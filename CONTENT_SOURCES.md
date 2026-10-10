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
TIP acceptance for arXiv:2506.05221 and JBHI acceptance for arXiv:2602.07088 were confirmed by Imran Razzak. Acceptance month was subsequently confirmed as September 2026 by Imran Razzak. Both records are grouped and sorted using September 2026 (the first day is a month-only sort key). Architecture figures appear in the bibliography and recent publications; news is text-only. No volume, issue, pages, or publisher DOI was inferred.

## Homepage visualizations (September 11, 2026)
- Research overview is an editorial diagram linking existing research directions, not an experimental causal graph.
- Featured project cards reuse the existing MedMO paper figure and user-supplied CARL and microbiome illustrations. Team preview reuses supplied photographs without cropping people.
- Timeline is reproducible with `scripts/build_publication_timeline.py`. Exact normalized titles or shared arXiv/DOI identifiers merge records; each group uses its latest recorded year. The downloadable audit identifies all groups. This is not a citation metric; changed titles without shared IDs may remain separate.
- Research demo videos are silent, 12-second paper-figure walkthroughs, not model executions: 5 seconds of the existing architecture figure, followed by 7 seconds of qualitative results. Entire figures are fitted without cropping or synthesizing results.
- SAM-TTA results: https://arxiv.org/html/2506.05221v2#S3.F3 (result_seg_sota_3.png).
- AD-RegNet results: https://arxiv.org/html/2602.07088v1#S4.F5 (dir_ixi.png).
- MedMO results: https://arxiv.org/html/2602.06965v2#A5.F17 (result1.png).

## MedOmni profile
CEO role, company name, evidence-based medicine focus and logo supplied directly by Imran Razzak. Company text describes this focus; no external website, LinkedIn URL, performance claims or released products were inferred.

MedOmni.ai was subsequently supplied by Imran Razzak as the planned company domain; the link is labeled “Website coming soon.”

## Visitor counter
Restored the existing Flag Counter account `ykSr` from the original website, retaining its recorded country history. The counter loads in the shared footer on all pages. A requested 20,000 starting value cannot be set through the documented public embed options; no fabricated count or country history was added.

## Model families and WLMs pages (October 10, 2026)
- Requested by Imran Razzak: MedMO is listed under the MedOS Family, DoAtlas-2 under the DoAtlas Family, and WLMs is a third family under Open Source Models with three pages: ECGWM, CGMWM and SleepWM. `model-wlms.html` is the family overview. (WLMs was first published as a separate tab and the menu briefly listed DoAtlas-1; both were corrected the same day at his request.)
- Navigation: `_data/navigation.yml` now allows a family entry to carry its own `children`; `_includes/navbar.html` renders them as indented member links under the family link.
- MedOS Family page: the MedMO card reuses the existing MedMO paper figure, description and links from `model-medmo.html`. No new claims were added.
- WLMs pages: no model information was supplied yet, so none is stated. The expansion of "WLMs" and of the "WM" suffix was not supplied and is not spelled out. Each page says only which signal the model is for (taken from its name) and marks description, evaluation, paper and code as "Coming soon".
- Visualizations on the WLMs pages are illustrations of the signal type, not results. All traces are synthesised in the visitor's browser by `assets/js/wlm.js` (sum-of-Gaussians heartbeat; meal-response glucose curve; cycle-based hypnogram with stage-dependent heart rate and SpO₂). They are labelled "Illustrative" and captioned as not patient data and not model output. Replace or remove them when real figures are available.
- General reference values shown: adult PR interval 120 to 200 ms and QRS duration under 120 ms; the 70 to 180 mg/dL (3.9 to 10.0 mmol/L) CGM target range used for time in range; sleep stages wake, REM, N1 to N3.

## MedMO page expansion (October 10, 2026)
- Requested by Imran Razzak, who supplied the project page https://genmilab.github.io/MedMO-Page/ as the source. Page text (motivation, training stages, approach, contributions, dataset coverage, the cell-grounding example) is condensed from that page; nothing was added from other sources. Title and authors follow the existing publication record for arXiv:2602.06965.
- Benchmark numbers: the four results tables (medical VQA, text QA, report generation, grounding) were extracted by script from the project page source (https://github.com/genmilab/MedMO-Page, commit `e4c5a1a`) into `assets/js/medmo.js` and the static tables in `model-medmo.html`, not retyped. The gains over Fleming-VL-8B are computed from those tables and match the figures quoted in the project page abstract (6.0, 9.8, 21.3, 8.4, 30.1, 47.8, 6.6 and 14.4). They are differences in points.
- The interactive chart omits VQA-RAD, SLAKE and Medbullets because some rows give two variants (closed/all, or 4 and 5 options) and others one number; all values remain in the full tables.
- `assets/images/medmo/benchmarks.webp` and `dataset-composition.webp` are the project page's own figures, resized to WebP without redrawing. The architecture figure is the existing paper Figure 2.
- The grounding illustration draws the four boxes listed on the project page as plain rectangles on a 0 to 999 grid; it does not reproduce the microscopy image. The dermatology example was left out because, as shown on the project page, the answer attributed to the other models ("B. Psoriasis") does not match the listed options.
- No MIMIC-CXR "average" report score is stated in text, since that value appears only in the benchmark figure, not in the tables.

## Prospective Students guide — 10 October 2026

- Requested by Imran Razzak: strengthen `student.html`, add the skills students should have, life at MBZUAI and in the UAE, and information about the GenMI group. The existing advice sections are kept and tightened; a duplicated enquiry paragraph left over from the migration (with an unbalanced closing tag) was removed.
- GenMI section: drawn only from this site (profile, team page, model pages, news items). Acceptance counts are the author's announcements, as elsewhere. Nothing is stated about what "GenMI" stands for, because no source gives it.
- Skills, "what I look for at each stage" and the self-check are new advice text written for this page, not sourced facts. They should be read and adjusted by Imran Razzak as his own guidance.
- MBZUAI facts were read on the official pages on 10 October 2026: student numbers (929 students from 71 countries, AY 2026-2027) and Masdar City from https://mbzuai.ac.ae/campus-community; canteen, clinic, park, mall, shuttle, bank account help and prayer rooms from https://mbzuai.ac.ae/campus-community/campus-facilities; sport, clubs, events, counseling and health insurance from https://mbzuai.ac.ae/campus-community/student-life; housing eligibility (first-year graduate students) from https://mbzuai.ac.ae/campus-community/housing.
- Benefits for funded students from https://mbzuai.ac.ae/admissions/graduate-phd-admissions. At Imran Razzak's request the page does not describe the PhD and MSc funding model and gives no application dates or stipend amounts; it links to the official admissions pages for those. Screening exam and interview wording from https://mbzuai.ac.ae/academics/phd-programs/doctoral-computational-biology.
- The old link `https://mbzuai.ac.ae/study/graduate-admission-process/` now redirects to a general Academics page, and the two program links redirect to new addresses. All three were replaced with the current URLs.
- Abu Dhabi safety ranking: https://www.mediaoffice.abudhabi/en/security/abu-dhabi-ranked-worlds-safest-city-for-10th-consecutive-year/ (Numbeo 2026, published 17 January 2026). Climate, geography and landmarks are general knowledge, stated without figures. No ranking of MBZUAI, GPU counts or cost-of-living figures were added, because no current official figure was found.
- The Life at MBZUAI photo is the newest entry in `_data/team_events.yml`, so it follows Team Life automatically.
- The student numbers and the safety ranking on this page will go out of date; review them each academic year.
