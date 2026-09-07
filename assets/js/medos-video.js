(() => {
  const video = document.getElementById('medos-profile-video');
  const button = document.querySelector('.medos-motion-toggle');
  if (!video || !button) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !motion.matches && !navigator.connection?.saveData;
  const label = () => { button.textContent = video.paused ? 'Play MedOS animation' : 'Pause MedOS animation'; };
  const play = () => {
    video.muted = true;
    video.play().catch(label);
  };
  button.hidden = false;
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  button.addEventListener('click', () => {
    enabled = video.paused;
    if (enabled) play(); else video.pause(); else video.pause();
  });
  motion.addEventListener('change', () => { enabled = !motion.matches; if (enabled) play(); else video.pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else if (enabled) play(); });
  if (enabled) play(); else video.pause();
})();
