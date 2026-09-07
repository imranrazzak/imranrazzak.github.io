(function () {
  'use strict';
  var input = document.getElementById('publication-search');
  if (!input) return;
  var entries = Array.from(document.querySelectorAll('.publication-entry'));
  var years = Array.from(document.querySelectorAll('.publication-year'));
  var count = document.getElementById('publication-count');
  var empty = document.getElementById('publication-empty');
  function filter() {
    var terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    var visible = 0;
    entries.forEach(function (entry) {
      var text = entry.dataset.search.toLocaleLowerCase();
      entry.hidden = !terms.every(function (term) { return text.includes(term); });
      if (!entry.hidden) visible++;
    });
    years.forEach(function (year) {
      year.hidden = !year.querySelector('.publication-entry:not([hidden])');
      var nav = document.querySelector('#navbar-year a[href="#' + year.id + '"]');
      if (nav) nav.hidden = year.hidden;
    });
    count.textContent = visible + ' of ' + entries.length + ' publications';
    empty.hidden = visible !== 0;
  }
  input.addEventListener('input', filter);
  document.getElementById('publication-clear').addEventListener('click', function () {
    input.value = ''; filter(); input.focus();
  });
})();
