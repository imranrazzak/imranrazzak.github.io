(() => {
  const picker = document.querySelector('.demo-picker');
  if (!picker) return;
  const buttons = [...picker.querySelectorAll('button')];
  const panels = [...document.querySelectorAll('.research-demo')];
  function select(id) {
    panels.forEach(panel => { panel.hidden = panel.id !== id; if (panel.hidden) panel.querySelector('video').pause(); });
    buttons.forEach(button => { const active = button.dataset.demoTarget === id; button.setAttribute('aria-pressed', String(active)); button.classList.toggle('active', active); });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.demoTarget)));
  picker.hidden = false;
  select(buttons[0].dataset.demoTarget);
})();
