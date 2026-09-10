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

## Publication figures

The bibliography retains all 517 Scholar records. Figures are local WebP assets in `assets/images/publications/`; each entry with a figure includes `cover`, `cover_source`, `cover_figure`, `cover_width`, and `cover_height`. Keep `assets/data/publications.json` synchronized with `_publications/`. See `assets/data/figure-sources.json` for source attribution and `assets/data/figure-coverage.json` for the remaining records that need an accessible paper figure. Do not restore synthetic placeholder graphics for missing figures.

`assets/js/publication-search.js` filters the bibliography by title, author, and venue without sending queries to a server. The MedOS company card is configured in `_data/profile.yml` and `_includes/widgets/company_card.html`.

### Team life events
Add lunch, gathering, or celebration photos under `assets/images/team/` and add entries to `_data/team_events.yml` with `title`, `date` (YYYY-MM-DD), `location`, `image` (site-relative path), `alt`, and `caption`. They appear newest first at `/team.html#team-life`. Only add actual events; the empty list publishes no sample entries.
