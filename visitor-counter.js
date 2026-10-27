(() => {
  'use strict';
  // Keep local design previews and other hosts out of the public statistics.
  if (location.hostname !== 'jinsaaang.github.io') return;

  const endpoint = 'https://jinsaaang.goatcounter.com';
  const panel = document.getElementById('visitor-counter');
  if (!panel) return;

  const tracker = document.createElement('script');
  tracker.src = 'https://gc.zgo.at/count.js';
  tracker.async = true;
  tracker.dataset.goatcounter = endpoint + '/count';
  tracker.dataset.goatcounterSettings = JSON.stringify({path: '/', no_events: true});
  document.head.appendChild(tracker);

  function koreaDate(date) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  async function count(query = '') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(endpoint + '/counter/TOTAL.json' + query, {
        signal: controller.signal, credentials: 'omit'
      });
      if (!response.ok) throw new Error('Counter unavailable');
      const data = await response.json();
      // GoatCounter supplies formatted strings; never insert API text as HTML.
      const raw = String(data.count ?? '').replace(/[\s,]/g, '');
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
        throw new Error('Invalid visitor count');
      }
      return new Intl.NumberFormat('en-US').format(Number(raw));
    } finally {
      clearTimeout(timeout);
    }
  }

  async function update() {
    const now = new Date();
    const start = koreaDate(now);
    const end = koreaDate(new Date(now.getTime() + 86400000));
    const params = new URLSearchParams({start, end});
    try {
      const [today, total] = await Promise.all([count('?' + params), count()]);
      document.getElementById('visitors-today').textContent = today;
      document.getElementById('visitors-total').textContent = total;
      panel.hidden = false;
    } catch (_) {
      // A blocked analytics request must not show a fabricated zero or break the page.
      panel.hidden = true;
    }
  }

  update();
  // Refresh the date range if a tab stays open across midnight in Korea.
  setInterval(() => { if (!document.hidden) update(); }, 300000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();
