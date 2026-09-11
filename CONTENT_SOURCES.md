# Content provenance

Migration date: 7 September 2026.

- Theme: https://github.com/luost26/academic-homepage, commit `163ee12`. The original stylesheet, layouts and publication components are retained. Small integration changes add metadata, accessible names, working local links, optional education logos, month-only news dates, and a later navbar collapse breakpoint for the expanded navigation.
- Profile and education: https://mbzuai.ac.ae/study/faculty/imran-razzak/; old homepage at https://imranrazzak.github.io/.
- Publications: https://scholar.google.com/citations?user=GlXI4N8AAAAJ&hl=en. Imported all 517 displayed records across six pages (100 each, last page 17); deduplicated by Scholar record ID. Snapshot author lists and venues can be abbreviated by Scholar. Counts of citations are intentionally not frozen into the website. 28 records have no year; the internal 1900 sort value groups these under the visible label “Undated” and is not a claimed publication date.
- Verified selected-paper titles and full author lists against https://arxiv.org/abs/2602.06965, https://arxiv.org/abs/2602.17535, https://arxiv.org/abs/2511.18519, https://arxiv.org/abs/2505.18283, and https://arxiv.org/abs/2503.14800. Each already matched a Scholar record.
- News, teaching, grants, awards, team, services, student advice, project descriptions and assets: the original website repository. Month-only announcements do not assert a particular day; internal dates only order items. Conference acceptance announcements are carried over as the author's announcements, not independently verified publication metadata.
- Legacy `publications.html` actually contained teaching; legacy `teaching.html` contained the team. The new navigation corrects this: publications.html = bibliography, teaching.html = teaching, team.html = team. All other active old routes and their media remain available.
- Unused legacy `publication1` contains papers by a different researcher. It is retained in git history and excluded from the build, rather than imported as Imran Razzak's work.
- Old news repeated links to TAGS and Long Context Modeling under unrelated labels. Only correctly matched links are retained. CHIPS was mislabeled as both medical reasoning and efficient CLIP adaptation; it now has its verified title.
- Several old grant and award links pointed to unrelated grant programs or the wrong award image; these incorrect links were removed while retaining the descriptions. A missing MDM PDF is not linked.
- No invented employment dates, citation counts, paper abstracts, publication covers, or institutional logos were added. Portrait reused from the original site. Upstream publication bubble graphics remain the theme's default, not paper figures.

The full imported bibliography is available at `assets/data/publications.json`; editable theme publication entries are in `_publications/`.

## MedOS and figure update — 7 September 2026

- Added CEO, MedOS, as explicitly supplied by Imran Razzak; also corroborated by the TIME 2026 workshop biography at https://time.griffith.edu.au/workshop/time2026/.
- Company description: https://medos.tech/. Correct LinkedIn identity verified directly at https://www.linkedin.com/company/medos-tech/, whose website field links to medos.tech. Unrelated MedOS companies were excluded. No company performance metrics, customer counts, regulatory claims, or founding date were copied.
- Official MedOS logo reused from https://medos.tech/__l5e/assets-v1/32604b1a-4f46-4371-ab4f-1187f080b713/medos-logo.png, proportionally resized without redesign.
- All 517 imported Scholar record IDs remain present. Source records can contain alternate versions of the same publication; the count describes records, not a deduplicated count of distinct scholarly works.
- 141 records matched to arXiv metadata; full author lists were expanded where the match was verified. Publication years and original venue fields remain from Scholar.
- 211 records now have genuine paper figures, including all 7 selected homepage papers. Architecture, pipeline, study overview and teaser figures were prioritized. Where no architecture diagram was retrievable, an informative figure from the paper was used. No synthetic scientific diagrams or generic decorative thumbnails were introduced.
- Figure provenance (paper URL, image URL or PDF page and crop coordinates) is recorded in `assets/data/figure-sources.json`. PDF figures were rendered directly from the paper; HTML figures use the publisher/arXiv asset, proportionally resized to WebP. All published figure thumbnails were visually reviewed in contact sheets; the selected PDF crops were additionally checked against full source pages.
- Open-access COVIDSenti figure source: https://bura.brunel.ac.uk/bitstream/2438/33458/3/FullText.pdf, page 4, Figure 2. Deep Learning for Medical Image Processing: https://arxiv.org/pdf/1704.06825v1, page 8, Figure 3.
- Sources checked: arXiv author API, public Scholar detail pages, the UNSW publication bibliography and its publisher links, accessible publisher full texts, Brunel repository, and Europe PMC. Scholar detail requests stopped upon HTTP 429. Login challenges, restricted publisher resources and unavailable files were not bypassed.
- The remaining 306 records are preserved without a thumbnail; no suitable figure could be retrieved from the accessible material during this pass. The exact records are listed in `assets/data/figure-coverage.json` for future additions.
- Navigation now groups projects/datasets under Research, team/applications under People, and teaching/grants/service under Academic. All existing routes remain intact. The upstream `assets/css/global.css` is unchanged; a small additive stylesheet aligns cards and renders figures with `object-fit: contain` on desktop and mobile. Each publication is rendered once rather than in duplicate desktop/mobile blocks.

## MedOS logo video
User-provided `Desktop/Medos Video.mov`, added September 7, 2026. Converted to a silent, optimized H.264 MP4 with metadata removed; poster extracted from the same clip. A compact card below the portrait and social links uses the portrait column width, 70% opacity (30% transparency), a pause control, and reduced-motion/data-saving defaults.

## User-supplied photos and publication images (September 11, 2026)
Two team photographs added with descriptive captions; event dates and locations were not supplied and are omitted. The oral microbiome and CARL illustrations were supplied and assigned by Imran Razzak; they are labeled as supplied images rather than extracted paper figures. There are now 213 publication images (211 retrieved figures plus 2 supplied images). The CVPR workshop entry remains in the full bibliography but is omitted from homepage highlights.

## IEEE acceptance news (September 11, 2026)
TIP acceptance for arXiv:2506.05221 and JBHI acceptance for arXiv:2602.07088 were confirmed by Imran Razzak. News is dated to the announcement; original bibliography year groupings are retained. Existing arXiv architecture figures are reused in the homepage news. No volume, issue, pages, or publisher DOI was inferred.
