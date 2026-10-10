/* MedMO page: benchmark explorer.
   The numbers are the published results tables from the MedMO project page
   (https://genmilab.github.io/MedMO-Page/), transcribed by script; see CONTENT_SOURCES.md. */
(function () {
  'use strict';
  var SUITES = [{"id":"vqa","name":"Medical VQA","unit":"accuracy, %","cols":[{"i":7,"label":"Average of all VQA benchmarks"},{"i":0,"label":"MMMU-Med"},{"i":3,"label":"PathVQA"},{"i":4,"label":"PMC-VQA"},{"i":5,"label":"OmniMedVQA (OMVQA)"},{"i":6,"label":"MedXpertQA, multimodal (MedXQA)"}],"rows":[{"m":"GPT-4.1","g":"prop","v":[75.2,65.0,72.2,55.5,55.2,75.5,45.2,63.4]},{"m":"Claude Sonnet 4","g":"prop","v":[74.6,67.6,70.6,54.2,54.4,65.5,43.3,61.5]},{"m":"Gemini-2.5-Flash","g":"prop","v":[76.9,68.5,75.8,55.4,55.4,71.0,52.8,65.1]},{"m":"BiomedGPT","g":"open","v":[24.9,16.6,13.6,11.3,27.6,27.9,null,null]},{"m":"Med-R1-2B","g":"open","v":[34.8,39.0,54.5,15.3,47.4,null,21.1,null]},{"m":"MedVLM-R1-2B","g":"open","v":[35.2,48.6,56.0,32.5,47.6,77.7,20.4,45.4]},{"m":"MedGemma-4B-IT","g":"open","v":[43.7,72.5,76.4,48.8,49.9,69.8,22.3,54.8]},{"m":"LLaVA-Med-7B","g":"open","v":[29.3,53.7,48.0,38.8,30.5,44.3,20.3,37.8]},{"m":"HuatuoGPT-V-7B","g":"open","v":[47.3,67.0,67.8,48.0,53.3,74.2,21.6,54.2]},{"m":"BioMediX2-8B","g":"open","v":[39.8,49.2,57.7,37.0,43.5,63.3,21.8,44.6]},{"m":"Qwen2.5VL-7B","g":"open","v":[50.6,64.5,67.2,44.1,51.9,63.6,22.3,52.0]},{"m":"InternVL2.5-8B","g":"open","v":[53.5,59.4,69.0,42.1,51.3,81.3,21.7,54.0]},{"m":"InternVL3-8B","g":"open","v":[59.2,null,null,39.0,53.8,79.1,22.4,57.4]},{"m":"Lingshu-7B","g":"open","v":[54.0,null,null,41.9,54.2,82.9,26.9,55.1]},{"m":"Fleming-VL-8B","g":"open","v":[63.3,null,null,56.5,64.3,88.2,21.6,66.1]},{"m":"Qwen3VL-8B","g":"open","base":1,"v":[61.4,null,null,14.6,52.3,77.2,24.8,40.5]},{"m":"MedMO-4B","g":"ours","v":[54.6,null,null,42.4,50.6,79.7,24.8,45.4]},{"m":"MedMO-4B-Next","g":"ours","v":[58.7,null,null,73.3,75.7,90.6,27.0,68.5]},{"m":"MedMO-8B","g":"ours","v":[64.6,null,null,56.3,59.4,84.8,26.2,63.2]},{"m":"MedMO-8B-Next","g":"ours","v":[69.3,null,null,56.3,74.1,93.3,42.9,72.7]}]},{"id":"qa","name":"Text QA","unit":"accuracy, %","cols":[{"i":7,"label":"Average of all text QA benchmarks"},{"i":0,"label":"MMLU-Med"},{"i":1,"label":"PubMedQA"},{"i":2,"label":"MedMCQA"},{"i":3,"label":"MedQA"},{"i":5,"label":"MedXpertQA, text (MedXQA)"},{"i":6,"label":"SGPQA"}],"rows":[{"m":"GPT-4.1","g":"prop","v":[89.6,75.6,77.7,89.1,77.0,30.9,49.9,70.0]},{"m":"Claude Sonnet 4","g":"prop","v":[91.3,78.6,79.3,92.1,80.2,33.6,56.3,73.1]},{"m":"Gemini-2.5-Flash","g":"prop","v":[84.2,73.8,73.6,91.2,77.6,35.6,53.3,69.9]},{"m":"BiomedGPT","g":"open","v":[null,null,null,null,null,null,null,null]},{"m":"Med-R1-2B","g":"open","v":[51.5,66.2,39.1,39.9,33.6,11.2,17.9,37.0]},{"m":"MedVLM-R1-2B","g":"open","v":[51.8,66.4,39.7,42.3,33.8,11.8,19.1,37.8]},{"m":"MedGemma-4B-IT","g":"open","v":[66.7,72.2,52.2,56.2,45.6,12.8,21.6,46.8]},{"m":"LLaVA-Med-7B","g":"open","v":[50.6,26.4,39.4,42.0,34.4,9.9,16.1,31.3]},{"m":"HuatuoGPT-V-7B","g":"open","v":[69.3,72.8,51.2,52.9,40.9,10.1,21.9,45.6]},{"m":"BioMediX2-8B","g":"open","v":[68.6,75.2,52.9,58.9,45.9,13.4,25.2,48.6]},{"m":"Qwen2.5VL-7B","g":"open","v":[73.4,76.4,52.6,57.3,42.1,12.8,26.3,48.7]},{"m":"InternVL2.5-8B","g":"open","v":[74.2,76.4,52.4,53.7,42.4,11.6,26.1,48.1]},{"m":"InternVL3-8B","g":"open","v":[77.5,75.4,57.7,62.1,null,13.1,31.2,51.2]},{"m":"Lingshu-7B","g":"open","v":[69.6,75.8,56.3,63.5,null,16.4,27.5,53.1]},{"m":"Fleming-VL-8B","g":"open","v":[71.8,74.0,51.8,53.7,null,12.1,24.9,45.7]},{"m":"Qwen3VL-8B","g":"open","base":1,"v":[79.3,70.4,60.0,66.1,null,15.1,34.7,53.6]},{"m":"MedMO-4B","g":"ours","v":[75.7,78.0,58.0,78.5,null,16.4,29.4,55.1]},{"m":"MedMO-4B-Next","g":"ours","v":[74.8,78.2,58.1,78.3,null,16.5,29.5,55.0]},{"m":"MedMO-8B","g":"ours","v":[81.0,77.6,65.0,84.3,null,19.9,36.0,61.3]},{"m":"MedMO-8B-Next","g":"ours","v":[80.2,75.6,62.0,83.8,null,20.9,35.5,60.1]}]},{"id":"report","name":"Report generation","unit":"score","cols":[{"i":1,"label":"MIMIC-CXR: CIDEr","grp":"MIMIC-CXR"},{"i":0,"label":"MIMIC-CXR: R-L","grp":"MIMIC-CXR"},{"i":2,"label":"MIMIC-CXR: RaTE","grp":"MIMIC-CXR"},{"i":3,"label":"MIMIC-CXR: Semb","grp":"MIMIC-CXR"},{"i":4,"label":"CheXpert Plus: R-L","grp":"CheXpert Plus"},{"i":5,"label":"CheXpert Plus: CIDEr","grp":"CheXpert Plus"},{"i":6,"label":"CheXpert Plus: RaTE","grp":"CheXpert Plus"},{"i":7,"label":"CheXpert Plus: Semb","grp":"CheXpert Plus"},{"i":8,"label":"IU-Xray: R-L","grp":"IU-Xray"},{"i":9,"label":"IU-Xray: CIDEr","grp":"IU-Xray"},{"i":10,"label":"IU-Xray: RaTE","grp":"IU-Xray"},{"i":11,"label":"IU-Xray: Semb","grp":"IU-Xray"},{"i":12,"label":"Med-Trinity: R-L","grp":"Med-Trinity"},{"i":13,"label":"Med-Trinity: CIDEr","grp":"Med-Trinity"},{"i":14,"label":"Med-Trinity: RaTE","grp":"Med-Trinity"},{"i":15,"label":"Med-Trinity: Semb","grp":"Med-Trinity"}],"rows":[{"m":"GPT-4.1","g":"prop","v":[9.0,82.8,51.3,23.9,24.5,78.8,45.5,23.2,30.2,124.6,51.3,47.5,null,null,null,null]},{"m":"Claude Sonnet 4","g":"prop","v":[20.0,56.6,45.6,19.7,22.0,59.5,43.5,18.9,25.4,88.3,55.4,41.0,null,null,null,null]},{"m":"Gemini-2.5-Flash","g":"prop","v":[25.4,80.7,50.3,29.7,23.6,72.2,44.3,27.4,33.5,129.3,55.6,50.9,null,null,null,null]},{"m":"Med-R1-2B","g":"open","v":[19.3,35.4,40.6,14.8,18.6,37.1,38.5,17.8,16.1,38.3,41.4,12.5,null,null,null,null]},{"m":"MedVLM-R1-2B","g":"open","v":[20.3,40.1,41.6,14.2,20.9,43.5,38.9,15.5,22.7,61.1,46.1,22.7,null,null,null,null]},{"m":"MedGemma-4B-IT","g":"open","v":[25.6,81.0,52.4,29.2,27.1,79.0,47.2,29.3,30.8,103.6,57.0,46.8,null,null,null,null]},{"m":"LLaVA-Med-7B","g":"open","v":[15.0,43.4,12.8,18.3,18.4,45.5,38.8,23.5,18.8,68.2,40.9,16.0,null,null,null,null]},{"m":"HuatuoGPT-V-7B","g":"open","v":[23.4,69.5,48.9,20.0,21.3,64.7,44.2,19.3,29.6,104.3,52.9,40.7,null,null,null,null]},{"m":"BioMediX2-8B","g":"open","v":[20.0,52.8,44.4,17.7,18.1,47.9,40.8,21.6,19.6,58.8,40.1,11.6,null,null,null,null]},{"m":"Qwen2.5VL-7B","g":"open","v":[24.1,63.7,47.0,18.4,22.2,62.0,41.0,17.2,26.5,78.1,48.4,36.3,23.5,81.5,44.9,38.3]},{"m":"InternVL2.5-8B","g":"open","v":[23.2,61.8,47.0,21.0,20.6,58.5,43.1,19.7,24.8,75.4,51.1,36.7,13.5,47.1,42.5,12.8]},{"m":"InternVL3-8B","g":"open","v":[22.9,66.2,48.2,21.5,20.9,65.4,44.3,25.2,22.9,76.2,51.2,31.3,12.9,46.6,42.2,3.7]},{"m":"Lingshu-7B","g":"open","v":[30.8,109.4,52.1,30.0,26.5,79.0,45.4,26.8,41.2,180.7,57.6,48.4,16.0,74.5,44.4,24.0]},{"m":"Fleming-VL-8B","g":"open","v":[35.7,132.5,56.7,33.6,26.1,82.2,47.1,40.1,44.9,198.6,66.0,51.3,13.1,35.8,41.9,18.1]},{"m":"Qwen3VL-8B","g":"open","base":1,"v":[25.1,77.9,50.3,33.4,21.9,67.4,44.4,37.9,25.0,91.44,52.5,42.9,20.2,69.9,45.9,33.6]},{"m":"MedMO-4B","g":"ours","v":[26.0,92.6,49.8,31.6,15.1,62.3,36.6,34.2,26.6,94.0,42.1,41.3,22.5,152.6,47.8,34.3]},{"m":"MedMO-4B-Next","g":"ours","v":[28.3,96.7,52.0,34.3,23.5,74.5,42.6,38.7,38.0,147.8,62.0,49.4,26.3,183.8,49.5,38.6]},{"m":"MedMO-8B","g":"ours","v":[31.7,140.0,57.1,50.0,23.6,87.5,47.3,42.2,31.1,169.7,45.3,41.3,37.0,270.4,53.0,39.2]},{"m":"MedMO-8B-Next","g":"ours","v":[32.6,143.4,57.7,51.5,25.7,88.3,48.1,43.8,31.8,171.9,56.0,43.1,38.5,272.1,53.8,40.7]}]},{"id":"grounding","name":"Grounding","unit":"IoU, %","cols":[{"i":6,"label":"Average of all grounding benchmarks"},{"i":0,"label":"NIH"},{"i":1,"label":"DeepLesion"},{"i":2,"label":"Bacteria"},{"i":3,"label":"MedSG, multi-view"},{"i":4,"label":"MedSG, object tracking"},{"i":5,"label":"MedSG, referring"}],"rows":[{"m":"InternVL3-8B","g":"open","v":[10.1,0.0,0.7,6.3,13.0,3.3,5.6]},{"m":"Fleming-VL-8B","g":"open","v":[0.0,0.0,8.3,42.0,36.7,16.6,17.2]},{"m":"Lingshu-7B","g":"open","v":[5.3,0.7,10.8,28.3,38.7,10.4,13.9]},{"m":"Qwen3VL-8B","g":"open","v":[16.4,0.0,9.16,8.4,17.8,31.4,13.8]},{"m":"MedSG-Bench","g":"open","v":[null,null,null,55.0,62.1,60.4,null]},{"m":"MedMO-8B","g":"ours","v":[8.83,38.5,54.6,75.8,77.2,70.1,54.2]},{"m":"MedMO-8B-Next","g":"ours","v":[15.9,40.5,56.1,77.5,78.8,71.9,56.8]}]}];
  var host = document.getElementById('mm-bars');
  if (!host) return;
  var sel = document.getElementById('mm-col'), prop = document.getElementById('mm-prop'), summary = document.getElementById('mm-summary');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-mm-suite]'));
  var suite = SUITES[0], GROUP = { ours: 'MedMO', open: 'open-source model', prop: 'proprietary model' };
  function el(tag, cls, text, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function fmt(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  function fillSelect() {
    sel.textContent = '';
    var groups = {};
    suite.cols.forEach(function (c, k) {
      var parent = sel;
      if (c.grp) { if (!groups[c.grp]) { groups[c.grp] = document.createElement('optgroup'); groups[c.grp].label = c.grp; } parent = groups[c.grp]; }
      var o = el('option', null, c.grp ? c.label.split(': ')[1] + ' (' + c.grp + ')' : c.label, parent); o.value = k;
    });
    Object.keys(groups).forEach(function (g) { sel.appendChild(groups[g]); });
    sel.value = 0;
  }
  function render() {
    var col = suite.cols[+sel.value], showProp = prop.checked, rows = [], missing = [];
    suite.rows.forEach(function (r) {
      if (r.g === 'prop' && !showProp) return;
      var v = r.v[col.i];
      if (v == null) missing.push(r.m); else rows.push({ r: r, v: v });
    });
    rows.sort(function (a, b) { return b.v - a.v; });
    var max = rows.length ? rows[0].v : 1;
    host.textContent = '';
    rows.forEach(function (d, k) {
      var row = el('div', 'mm-row mm-' + d.r.g, null, host); row.setAttribute('role', 'listitem');
      row.title = d.r.m + ' (' + GROUP[d.r.g] + '): ' + fmt(d.v);
      el('span', 'mm-name', d.r.m + (d.r.base ? ' (base model)' : ''), row);
      var track = el('span', 'mm-track', null, row);
      el('span', 'mm-bar', null, track).style.width = 'calc((100% - 3.2rem) * ' + (max > 0 ? Math.max(0, d.v / max) : 0).toFixed(4) + ')';
      el('span', 'mm-val', fmt(d.v), track);
    });
    var hasProp = suite.rows.some(function (r) { return r.g === 'prop'; });
    prop.disabled = !hasProp; prop.parentNode.classList.toggle('mm-off', !hasProp);
    var bestOurs = null, rank = 0;
    rows.forEach(function (d, k) { if (!bestOurs && d.r.g === 'ours') { bestOurs = d; rank = k + 1; } });
    var text = col.label + ' (' + suite.unit + '), higher is better. ';
    if (rows.length) text += 'Highest: ' + rows[0].r.m + ' at ' + fmt(rows[0].v) + '. ';
    if (bestOurs && rank > 1) text += 'Best MedMO model: ' + bestOurs.r.m + ' at ' + fmt(bestOurs.v) + ', ranked ' + rank + ' of ' + rows.length + '. ';
    if (missing.length) text += 'Not reported: ' + missing.join(', ') + '.';
    summary.textContent = text;
  }
  function setSuite(id) {
    suite = SUITES.filter(function (s) { return s.id === id; })[0];
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-mm-suite') === id ? 'true' : 'false'); });
    fillSelect(); render();
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { setSuite(t.getAttribute('data-mm-suite')); }); });
  sel.addEventListener('change', render); prop.addEventListener('change', render);
  setSuite(SUITES[0].id);
})();
