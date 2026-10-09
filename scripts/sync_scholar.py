#!/usr/bin/env python3
"""Add publications that are new on Google Scholar to the site bibliography.

Reads the public Scholar profile, compares its record IDs with the ones already
in ``assets/data/publications.json`` and ``_publications/``, and for each record
that is not on the site yet writes

* ``_publications/<year>/<sha1(scholar_id)[:14]>.md``  (same front matter as the
  existing records),
* a matching entry in ``assets/data/publications.json``,
* a matching entry in ``assets/data/figure-coverage.json`` (new records have no
  figure yet).

Existing records are never edited or deleted. Records that have disappeared
from Scholar, and new Scholar IDs whose title is already on the site, are only
reported in the summary so a person can decide what to do.

Google Scholar has no API and regularly blocks cloud servers. The script first
reads the public profile page directly; if Scholar refuses and ``SERPAPI_KEY``
is set, it falls back to SerpApi's Google Scholar Author API.

Usage:
    python scripts/sync_scholar.py                 # add new records
    python scripts/sync_scholar.py --dry-run       # only report
    python scripts/sync_scholar.py --source serpapi --summary summary.md

Exit codes: 0 ok (also when nothing is new), 2 Scholar unavailable/blocked,
3 a safety check refused to write.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PUBS_DIR = ROOT / "_publications"
PUBS_JSON = ROOT / "assets/data/publications.json"
COVERAGE_JSON = ROOT / "assets/data/figure-coverage.json"
IGNORE_FILE = ROOT / "scripts/scholar_ignore.txt"

DEFAULT_USER = "GlXI4N8AAAAJ"
UNDATED_YEAR = "1900"  # the site groups records without a year under this sort value
PAGE_SIZE = 100
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0 Safari/537.36"
)
NO_FIGURE_REASON = "Added by the weekly Scholar sync; no figure has been retrieved yet."


class ScholarUnavailable(Exception):
    """Scholar (or SerpApi) could not be read: blocked, rate limited or offline."""


# --------------------------------------------------------------------------- HTTP

def http_get(url: str, timeout: int = 30) -> tuple[int, str]:
    """GET a URL and return (status, body). Network errors become status 0."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        return 0, str(err)


# ----------------------------------------------------------------- direct Scholar

def _refusal(what: str, status: int, body: str) -> str:
    if status == 0:
        return f"Google Scholar could not be reached for {what} ({body[:120]})"
    return f"Google Scholar refused {what} (HTTP {status})"


def parse_list_page(html: str) -> list[dict]:
    """Parse one page of the profile's article table."""
    soup = BeautifulSoup(html, "html.parser")
    if soup.select_one("#gsc_a_b") is None:
        raise ScholarUnavailable("profile page has no article table (blocked or layout changed)")
    rows = []
    for tr in soup.select("tr.gsc_a_tr"):
        link = tr.select_one("a.gsc_a_at")
        if link is None:  # the "no articles" placeholder row
            continue
        query = urllib.parse.parse_qs(urllib.parse.urlsplit(link.get("href", "")).query)
        sid = (query.get("citation_for_view") or [""])[0]
        if ":" not in sid:
            continue
        grays = tr.select("div.gs_gray")
        authors = grays[0].get_text(" ", strip=True) if grays else ""
        venue = ""
        if len(grays) > 1:
            for hidden in grays[1].select("span.gs_oph"):  # ", 2026" duplicate of the year column
                hidden.decompose()
            venue = grays[1].get_text(" ", strip=True)
        year_cell = tr.select_one("td.gsc_a_y")
        rows.append({
            "scholar_id": sid,
            "title": link.get_text(" ", strip=True),
            "authors": authors,
            "venue": venue,
            "year": year_cell.get_text(strip=True) if year_cell else "",
        })
    return rows


def parse_detail_page(html: str) -> dict:
    """Parse a single record's detail page into {'link': ..., 'fields': {...}}."""
    soup = BeautifulSoup(html, "html.parser")
    if soup.select_one("#gsc_oci_title") is None:
        raise ScholarUnavailable("record page has no title block (blocked or layout changed)")
    link = soup.select_one("a.gsc_oci_title_link")
    fields = {}
    for row in soup.select("#gsc_oci_table div.gs_scl"):
        key = row.select_one(".gsc_oci_field")
        value = row.select_one(".gsc_oci_value")
        if key and value:
            fields[key.get_text(strip=True).lower()] = value.get_text(" ", strip=True)
    return {"link": link.get("href", "") if link else "", "fields": fields}


def direct_list(user: str, delay: float) -> list[dict]:
    records, start = [], 0
    while start < 5000:
        url = ("https://scholar.google.com/citations?" + urllib.parse.urlencode({
            "user": user, "hl": "en", "cstart": start, "pagesize": PAGE_SIZE, "sortby": "pubdate"}))
        status, html = http_get(url)
        if status != 200:
            raise ScholarUnavailable(_refusal("the profile page", status, html))
        rows = parse_list_page(html)  # raises if Scholar served a CAPTCHA instead of the table
        records.extend(rows)
        if len(rows) < PAGE_SIZE:
            break
        start += PAGE_SIZE
        time.sleep(delay)
    return records


def direct_detail(user: str, sid: str) -> dict:
    status, html = http_get(scholar_url(user, sid))
    if status != 200:
        raise ScholarUnavailable(_refusal("the record page", status, html))
    return parse_detail_page(html)


# ------------------------------------------------------------------------ SerpApi

def _serpapi(params: dict, key: str) -> dict:
    query = urllib.parse.urlencode({"engine": "google_scholar_author", "hl": "en", **params, "api_key": key})
    status, body = http_get("https://serpapi.com/search.json?" + query, timeout=60)
    try:
        data = json.loads(body)
    except ValueError:
        raise ScholarUnavailable(f"SerpApi returned an unreadable response (HTTP {status})") from None
    if status != 200 and "error" not in data:
        raise ScholarUnavailable(f"SerpApi request failed (HTTP {status})")
    return data


def serpapi_list(user: str, key: str, delay: float) -> list[dict]:
    records, start = [], 0
    while start < 5000:
        data = _serpapi({"author_id": user, "sort": "pubdate", "start": start, "num": PAGE_SIZE}, key)
        articles = data.get("articles") or []
        if not articles:
            if start == 0 or "returned any results" not in str(data.get("error", "")):
                raise ScholarUnavailable(f"SerpApi: {data.get('error') or 'no articles returned'}")
            break
        for art in articles:
            year = str(art.get("year") or "").strip()
            venue = str(art.get("publication") or "").strip()
            if year and venue.endswith(", " + year):  # SerpApi keeps the hidden year suffix
                venue = venue[: -len(", " + year)].rstrip()
            records.append({
                "scholar_id": str(art.get("citation_id") or ""),
                "title": str(art.get("title") or "").strip(),
                "authors": str(art.get("authors") or "").strip(),
                "venue": venue,
                "year": year,
            })
        if len(articles) < PAGE_SIZE:
            break
        start += PAGE_SIZE
        time.sleep(delay)
    return [r for r in records if ":" in r["scholar_id"]]


def serpapi_detail(sid: str, key: str) -> dict:
    data = _serpapi({"view_op": "view_citation", "citation_id": sid}, key)
    cit = data.get("citation")
    if not isinstance(cit, dict):
        raise ScholarUnavailable(f"SerpApi: {data.get('error') or 'no citation returned'}")
    fields = {k.replace("_", " "): str(v) for k, v in cit.items()
              if isinstance(v, (str, int)) and k not in ("title", "link", "description")}
    return {"link": str(cit.get("link") or ""), "fields": fields}


# ------------------------------------------------------------------- record build

def scholar_url(user: str, sid: str) -> str:
    return ("https://scholar.google.com/citations?view_op=view_citation&hl=en"
            f"&user={user}&citation_for_view={sid}")


def norm_title(title: str) -> str:
    """Same normalisation as scripts/build_publication_timeline.py."""
    return "".join(c for c in unicodedata.normalize("NFKC", title).casefold() if c.isalnum())


def split_authors(text: str) -> list[str]:
    names = [n.strip() for n in text.replace("…", "...").split(",")]
    return [n for n in names if n]


def parse_year(text: str) -> int | None:
    match = re.fullmatch(r"\s*(\d{4})\s*", text or "")
    year = int(match.group(1)) if match else None
    return year if year and 1900 < year < 2200 else None


def parse_pub_date(text: str) -> tuple[int, int, int] | None:
    """'2026/9/30', '2026/9' or '2026' -> (year, month, day); missing parts become 1."""
    match = re.fullmatch(r"\s*(\d{4})(?:[/-](\d{1,2}))?(?:[/-](\d{1,2}))?\s*", text or "")
    if not match:
        return None
    year, month, day = int(match.group(1)), int(match.group(2) or 1), int(match.group(3) or 1)
    try:
        dt.date(year, month, day)
    except ValueError:
        return None
    return (year, month, day) if 1900 < year < 2200 else None


def venue_from_fields(fields: dict) -> str:
    """Rebuild Scholar's 'Venue 12 (3), 45-67' line from a record's detail fields."""
    name = next((fields[k] for k in ("journal", "conference", "book", "source", "institution")
                 if fields.get(k)), "")
    if not name:
        return ""
    text = name
    if fields.get("volume"):
        text += f" {fields['volume']}"
        if fields.get("issue"):
            text += f" ({fields['issue']})"
    if fields.get("pages"):
        text += f", {fields['pages']}"
    return text


def arxiv_id(*texts: str) -> str | None:
    for text in texts:
        match = (re.search(r"arxiv\.org/(?:abs|pdf|html)/(\d{4}\.\d{4,5})(v\d+)?", text or "", re.I)
                 or re.search(r"arXiv:\s*(\d{4}\.\d{4,5})(v\d+)?", text or "", re.I))
        if match:
            return match.group(1) + (match.group(2) or "")
    return None


def build_record(user: str, row: dict, detail: dict | None, today: dt.date) -> dict:
    fields = (detail or {}).get("fields", {})
    paper_link = (detail or {}).get("link", "")

    authors = split_authors(fields.get("authors") or row["authors"])
    venue = row["venue"]
    if (not venue or "…" in venue or "..." in venue) and venue_from_fields(fields):
        venue = venue_from_fields(fields)

    year = parse_year(row["year"])
    full_date = parse_pub_date(fields.get("publication date", ""))
    if year is None and full_date:
        year = full_date[0]

    if year is None:
        date = f"{UNDATED_YEAR}-01-01"
    elif full_date and full_date[0] == year and dt.date(*full_date) <= today:
        date = dt.date(*full_date).isoformat()  # sorts the newest papers first within the year
    else:
        date = f"{year}-01-01"

    if venue and year:
        pub = f"{venue} , {year}"
    else:
        pub = venue or (str(year) if year else "")

    sid = row["scholar_id"]
    links = {"Google Scholar": scholar_url(user, sid)}
    axv = arxiv_id(paper_link, venue)
    if paper_link.startswith("http") and not (axv and "arxiv.org" in paper_link.lower()):
        links["Paper"] = paper_link
    if axv:
        links["arXiv"] = f"https://arxiv.org/abs/{axv}"

    return {"title": row["title"], "date": date, "pub": pub, "authors": authors,
            "links": links, "scholar_id": sid, "selected": False}


def record_path(record: dict) -> Path:
    stem = hashlib.sha1(record["scholar_id"].encode()).hexdigest()[:14]
    return PUBS_DIR / record["date"][:4] / f"{stem}.md"


def front_matter(record: dict) -> str:
    return "---\n" + yaml.safe_dump(record, sort_keys=False, allow_unicode=True) + "---\n"


# ------------------------------------------------------------------- site state

def load_site() -> tuple[list[dict], dict]:
    records = json.loads(PUBS_JSON.read_text(encoding="utf-8"))
    coverage = json.loads(COVERAGE_JSON.read_text(encoding="utf-8")) if COVERAGE_JSON.exists() else None
    file_ids = set()
    for path in PUBS_DIR.glob("*/*.md"):
        match = re.search(r"^scholar_id:\s*['\"]?([^'\"\s]+)", path.read_text(encoding="utf-8"), re.M)
        if match:
            file_ids.add(match.group(1))
    json_ids = {r["scholar_id"] for r in records}
    if file_ids != json_ids:
        raise SystemExit(
            f"_publications/ ({len(file_ids)} records) and assets/data/publications.json "
            f"({len(json_ids)} records) disagree; fix that before syncing: "
            f"{sorted(file_ids ^ json_ids)[:5]}")
    return records, coverage


def load_ignored() -> set[str]:
    if not IGNORE_FILE.exists():
        return set()
    ids = set()
    for line in IGNORE_FILE.read_text(encoding="utf-8").splitlines():
        token = line.split("#", 1)[0].strip()
        if token:
            ids.add(token)
    return ids


def dump_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ----------------------------------------------------------------------- summary

def write_summary(path: str | None, text: str) -> None:
    print(text)
    if path:
        Path(path).write_text(text, encoding="utf-8")


def set_output(name: str, value) -> None:
    target = os.environ.get("GITHUB_OUTPUT")
    if target:
        with open(target, "a", encoding="utf-8") as handle:
            handle.write(f"{name}={value}\n")


def render_summary(source, total, added, duplicates, moved, gone, ignored, detail_failures, dry_run) -> str:
    lines = []
    verb = "would be added" if dry_run else "added"
    lines.append(f"**{len(added)} new publication{'s' if len(added) != 1 else ''} {verb}** "
                 f"(Scholar profile: {total} records, read via {source}).")
    lines.append("")
    for rec in added:
        authors = ", ".join(rec["authors"][:6]) + (", ..." if len(rec["authors"]) > 6 else "")
        extra = "".join(f" · [{name}]({url})" for name, url in rec["links"].items())
        flag = " — possible duplicate: same title as a record already on the site" if rec["scholar_id"] in duplicates else ""
        lines.append(f"- **{rec['title']}**{flag}  \n  {authors}  \n  *{rec['pub'] or 'no venue on Scholar'}*{extra}  \n"
                     f"  `{rec['scholar_id']}` → `{record_path(rec).relative_to(ROOT)}`")
    if added:
        lines += ["",
                  "Review the entries above: Scholar sometimes adds papers by another author with a similar name, "
                  "or a second version of a paper that is already listed. To leave one out, add its ID to "
                  "`scripts/scholar_ignore.txt` on the source branch and run the sync again; the proposal is "
                  "rebuilt without it. New entries have no figure and are not marked `selected`."]
    if detail_failures:
        lines += ["", f"Full details could not be read for {len(detail_failures)} record(s); they use Scholar's "
                      "abbreviated author list and may lack a paper link: " + ", ".join(f"`{s}`" for s in detail_failures)]
    if moved:
        lines += ["", "**Not added — title already on the site under a Scholar ID that no longer exists** "
                      "(Scholar re-issued or merged the record). The existing entry was left as it is:"]
        lines += [f"- {row['title']} (`{old}` → `{row['scholar_id']}`)" for row, old in moved]
    if gone:
        lines += ["", f"**{len(gone)} record(s) on the site are no longer on the Scholar profile** "
                      "(merged, retitled or removed there). Nothing was changed:"]
        lines += [f"- {rec['title']} (`{rec['scholar_id']}`)" for rec in gone]
    if ignored:
        lines += ["", f"{ignored} Scholar record(s) skipped because they are listed in `scripts/scholar_ignore.txt`."]
    return "\n".join(lines) + "\n"


# -------------------------------------------------------------------------- main

def fetch_profile(args, key: str) -> tuple[str, list[dict]]:
    if args.source in ("auto", "direct"):
        try:
            return "the public profile page", direct_list(args.user, args.delay)
        except ScholarUnavailable as err:
            if args.source == "direct" or not key:
                hint = "" if key else " Add a SERPAPI_KEY secret to fall back to SerpApi."
                raise ScholarUnavailable(f"{err}.{hint}") from None
            print(f"Direct access failed ({err}); falling back to SerpApi.", file=sys.stderr)
    if not key:
        raise ScholarUnavailable("--source serpapi needs the SERPAPI_KEY environment variable")
    return "SerpApi", serpapi_list(args.user, key, args.delay)


def fetch_detail(args, key: str, state: dict, sid: str) -> dict | None:
    """Full authors, date and paper link for one record; None if nothing could be read."""
    if state["direct_failures"] < 2:
        try:
            detail = direct_detail(args.user, sid)
            state["direct_failures"] = 0
            return detail
        except ScholarUnavailable as err:
            state["direct_failures"] += 1  # after two in a row, stop knocking on Scholar
            print(f"  direct details unavailable for {sid}: {err}", file=sys.stderr)
    if key and args.source != "direct":
        try:
            return serpapi_detail(sid, key)
        except ScholarUnavailable as err:
            print(f"  SerpApi details unavailable for {sid}: {err}", file=sys.stderr)
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--user", default=os.environ.get("SCHOLAR_USER_ID", DEFAULT_USER),
                        help="Google Scholar author ID (default: %(default)s)")
    parser.add_argument("--source", choices=("auto", "direct", "serpapi"), default="auto")
    parser.add_argument("--delay", type=float, default=3.0, help="seconds between requests")
    parser.add_argument("--max-new", type=int, default=40,
                        help="refuse to write if more new records than this are found")
    parser.add_argument("--summary", help="also write the Markdown summary to this file")
    parser.add_argument("--dry-run", action="store_true", help="report only; write nothing")
    args = parser.parse_args()
    key = os.environ.get("SERPAPI_KEY", "").strip()
    today = dt.datetime.now(dt.timezone.utc).date()

    records, coverage = load_site()
    known = {r["scholar_id"]: r for r in records}
    known_titles = {}
    for rec in records:
        known_titles.setdefault(norm_title(rec["title"]), rec)
    ignored_ids = load_ignored()

    try:
        source, rows = fetch_profile(args, key)
    except ScholarUnavailable as err:
        print(f"::error::Google Scholar could not be read this run: {err}")
        set_output("new_count", 0)
        return 2

    profile = {}
    for row in rows:
        if row["scholar_id"].split(":")[0] == args.user and row["title"]:
            profile.setdefault(row["scholar_id"], row)
    if len(profile) < max(1, len(known) // 2):
        print(f"::error::Only {len(profile)} records were read from Scholar but the site has {len(known)}; "
              "treating the read as incomplete and writing nothing.")
        set_output("new_count", 0)
        return 3

    gone = [rec for sid, rec in known.items() if sid not in profile]
    candidates = [row for sid, row in profile.items() if sid not in known]
    ignored = sum(1 for row in candidates if row["scholar_id"] in ignored_ids
                  or row["scholar_id"].split(":")[1] in ignored_ids)
    candidates = [row for row in candidates if row["scholar_id"] not in ignored_ids
                  and row["scholar_id"].split(":")[1] not in ignored_ids]

    moved, duplicates, to_add = [], set(), []
    for row in candidates:
        twin = known_titles.get(norm_title(row["title"]))
        if twin is not None and twin["scholar_id"] not in profile:
            moved.append((row, twin["scholar_id"]))  # same paper, Scholar changed its ID
            continue
        if twin is not None:
            duplicates.add(row["scholar_id"])  # a second Scholar record with the same title
        to_add.append(row)

    if len(to_add) > args.max_new:
        print(f"::error::{len(to_add)} new records found, more than --max-new={args.max_new}; "
              "writing nothing. Re-run with a higher --max-new if this is expected.")
        set_output("new_count", 0)
        return 3

    added, detail_failures = [], []
    state = {"direct_failures": 0 if source != "SerpApi" else 2}
    for row in to_add:
        time.sleep(args.delay)
        detail = fetch_detail(args, key, state, row["scholar_id"])
        if detail is None:
            detail_failures.append(row["scholar_id"])
        added.append(build_record(args.user, row, detail, today))

    if added and not args.dry_run:
        for rec in added:
            path = record_path(rec)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(front_matter(rec), encoding="utf-8")
            records.append(rec)
            if coverage is not None:
                coverage.setdefault("unresolved", []).append({
                    "scholar_id": rec["scholar_id"], "title": rec["title"],
                    "scholar_url": rec["links"]["Google Scholar"], "reason": NO_FIGURE_REASON})
        dump_json(PUBS_JSON, records)
        if coverage is not None:
            coverage["total_scholar_records"] = len(records)
            dump_json(COVERAGE_JSON, coverage)

    write_summary(args.summary, render_summary(
        source, len(profile), added, duplicates, moved, gone, ignored, detail_failures, args.dry_run))
    set_output("new_count", 0 if args.dry_run else len(added))
    return 0


if __name__ == "__main__":
    sys.exit(main())
