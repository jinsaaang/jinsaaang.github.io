/* Runs before CSS so a saved preference is applied before the first paint. */
(() => {
  const key = 'sangjin-color-theme';
  const modes = ['system', 'light', 'dark'];
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try {
    const saved = window.localStorage.getItem(key);
    if (modes.includes(saved)) preference = saved;
  } catch (_) { /* Storage may be unavailable on file URLs or in private mode. */ }
  function apply() {
    const resolved = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }
  apply();
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('theme-select');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = modes.includes(select.value) ? select.value : 'system';
      apply();
      try {
        if (preference === 'system') window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, preference);
      } catch (_) { /* Switching still works for this page. */ }
    });
    window.addEventListener('storage', event => {
      if (event.key !== key && event.key !== null) return;
      preference = modes.includes(event.newValue) ? event.newValue : 'system';
      select.value = preference;
      apply();
    });
  });
})();
