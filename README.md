# Imran Razzak — academic homepage

Personal website: https://imranrazzak.github.io/

Uses [luost26/academic-homepage](https://github.com/luost26/academic-homepage) (upstream commit `163ee12`), retaining its Jekyll layouts, Bootstrap cards, typography, stylesheet, and publication widgets.

## Branches

- `academic-homepage-source`: editable Jekyll source and all publication records.
- `main`: generated public site, including `.nojekyll`, served by the existing GitHub Pages configuration. Static output supports the exact theme's email-protection plugin without requiring changes to GitHub Pages settings.

## Edit and build

```sh
bundle install
bundle exec jekyll build
python3 scripts/validate_site.py _site
bundle exec jekyll serve
```

Edit `_data/profile.yml`, `_data/navigation.yml`, `_news/`, `_publications/`, and the relevant HTML pages. `assets/data/publications.json` is a downloadable snapshot of the publication records; keep it aligned when editing publications. See [CONTENT_SOURCES.md](CONTENT_SOURCES.md) for content sources and migration decisions.

To deploy a validated build, update a clean checkout of `main` with the contents of `_site/`, include `.nojekyll`, and make a normal fast-forward commit and push. Preserve the `.git` directory and never force-push. Push the source branch too so later edits remain reproducible. Keep the generated branch README pointing back to the source branch.

The original website and every old file remain available in repository history.

The `.github/workflows/deploy.yml` workflow publishes the generated `main` branch on every push, including pushes made with a deploy key. Preserve this workflow when replacing generated output.

## Weekly Google Scholar sync

New publications are picked up from the [Google Scholar profile](https://scholar.google.com/citations?user=GlXI4N8AAAAJ&hl=en) automatically:

1. Every Monday `.github/workflows/scholar-sync.yml` runs `scripts/sync_scholar.py`. It compares the profile with `assets/data/publications.json` by Scholar record ID and, for each new record, adds a `_publications/<year>/<id>.md` file plus matching entries in `assets/data/publications.json` and `assets/data/figure-coverage.json`, then refreshes the timeline data.
2. If anything is new it opens (or refreshes) a pull request from the `scholar-sync` branch into `academic-homepage-source`, listing the papers. Nothing is published until that pull request is merged.
3. Merging it triggers `.github/workflows/publish.yml`, which builds the site, runs `scripts/validate_site.py`, copies `_site/` onto `main` and starts the Pages deployment. The same workflow publishes any other content change pushed to this branch; run it by hand with "dry run" ticked to build and validate without publishing.

Existing records are never edited or removed by the sync. Records that disappear from Scholar, and new Scholar IDs whose title is already listed, are only reported in the pull request. To keep a record off the site for good, add its ID to `scripts/scholar_ignore.txt`. New entries have no figure and are not `selected`; add those by hand as before.

Google Scholar has no API and often refuses requests from GitHub's servers. When that happens the run fails with a clear message and tries again the following week. For reliable runs add a repository secret named `SERPAPI_KEY` ([SerpApi](https://serpapi.com/) free plan is enough); the script then falls back to SerpApi whenever the direct read is refused. The script also runs locally: `pip install -r scripts/requirements.txt && python scripts/sync_scholar.py --dry-run`.

Both workflow files must be present, identical, on `main` and on this branch: schedules and the "Run workflow" button read them from `main`, merges into this branch read them from here. The pull request can only be opened if "Allow GitHub Actions to create and approve pull requests" is enabled under Settings → Actions → General.

## Publication figures

The bibliography retains all 517 Scholar records. Figures are local WebP assets in `assets/images/publications/`; each entry with a figure includes `cover`, `cover_source`, `cover_figure`, `cover_width`, and `cover_height`. Keep `assets/data/publications.json` synchronized with `_publications/`. See `assets/data/figure-sources.json` for source attribution and `assets/data/figure-coverage.json` for the remaining records that need an accessible paper figure. Do not restore synthetic placeholder graphics for missing figures.

`assets/js/publication-search.js` filters the bibliography by title, author, and venue without sending queries to a server. The MedOS company card is configured in `_data/profile.yml` and `_includes/widgets/company_card.html`.

### Team life events
Add lunch, gathering, or celebration photos under `assets/images/team/` and add entries to `_data/team_events.yml` with `title`, `date` (YYYY-MM-DD), `location`, `image` (site-relative path), `alt`, and `caption`. They appear newest first at `/team.html#team-life`. Only add actual events; the empty list publishes no sample entries.

### Homepage visuals
The research map, featured project cards, demo selector, publication timeline, and Team Life preview are Jekyll widgets. Update `_data/featured_research.yml` and `_data/research_demos.yml` to change their content. After bibliography changes, run `../.venv/bin/python scripts/build_publication_timeline.py` before building. Videos are click-to-play paper walkthroughs and use native browser controls; all examples remain available without JavaScript.
