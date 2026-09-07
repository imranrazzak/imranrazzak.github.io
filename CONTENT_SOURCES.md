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
