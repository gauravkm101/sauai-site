/* SauAI — "Get the app" install bar.
 *
 * Added 2026-09-10. Until today sauai.in said "Coming soon on Google Play"
 * a week after the app went live, and carried no install link at all — every
 * visitor left without a way to get the app. The homepage now has a button,
 * but the guide pages are where search traffic will actually land, and a
 * reader who reaches the bottom of a long format guide should not have to
 * scroll back up to find the app.
 *
 * Deliberately self-contained and defensive: one <script defer> tag per page,
 * no dependencies, its own colours, and everything wrapped in try/catch so a
 * failure here can never take a page down.
 *
 * The Play URL carries a `referrer` so Play Console → Acquisition can
 * attribute installs to the website instead of lumping them into "organic".
 */
(function () {
  'use strict';

  var PLAY_URL =
    'https://play.google.com/store/apps/details?id=in.sauai.app' +
    '&referrer=utm_source%3Dsauai.in%26utm_medium%3Dinstall_bar%26utm_campaign%3Dsite';

  var KEY = 'sau_appbar_dismissed_until';
  var HIDE_DAYS = 30;

  function dismissedRecently() {
    try {
      var until = window.localStorage.getItem(KEY);
      return !!until && Date.now() < parseInt(until, 10);
    } catch (e) {
      return false; // private mode / blocked storage — just show it
    }
  }

  function remember() {
    try {
      window.localStorage.setItem(KEY, String(Date.now() + HIDE_DAYS * 864e5));
    } catch (e) {
      /* nothing we can do; the bar simply reappears next visit */
    }
  }

  // Already inside the app's own webview? Then they plainly have it — no nag.
  function alreadyHasIt() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.navigator.standalone) return true;
      if (/SauAI|; wv\)/i.test(navigator.userAgent)) return true;
    } catch (e) {}
    return false;
  }

  function build() {
    var bar = document.createElement('div');
    bar.id = 'sau-app-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Get the SauAI Android app');

    bar.innerHTML =
      '<img src="/icon-192.png" alt="" width="44" height="44" class="sau-ab-icon">' +
      '<div class="sau-ab-txt">' +
        '<strong>SauAI for Android</strong>' +
        '<span>Shaadi biodata, resume, sarkari application &amp; 100+ AI tools — free.</span>' +
      '</div>' +
      '<a class="sau-ab-cta" href="' + PLAY_URL + '" target="_blank" rel="noopener">Install</a>' +
      '<button class="sau-ab-x" type="button" aria-label="Dismiss">&times;</button>';

    var css = document.createElement('style');
    css.textContent = [
      '#sau-app-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;',
      'display:flex;align-items:center;gap:12px;padding:10px 14px;',
      'background:rgba(10,10,20,.97);border-top:1px solid rgba(124,92,255,.38);',
      'box-shadow:0 -6px 24px rgba(0,0,0,.5);',
      "font-family:'Plus Jakarta Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",
      'transform:translateY(110%);transition:transform .35s ease}',
      '#sau-app-bar.sau-in{transform:translateY(0)}',
      '.sau-ab-icon{border-radius:11px;flex:0 0 auto;background:#14142B}',
      '.sau-ab-txt{flex:1 1 auto;min-width:0;line-height:1.3}',
      '.sau-ab-txt strong{display:block;color:#F4F4FB;font-size:14px;font-weight:800}',
      '.sau-ab-txt span{display:block;color:#9B9BC0;font-size:11.5px;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sau-ab-cta{flex:0 0 auto;background:linear-gradient(135deg,#7C5CFF,#00D4FF);',
      'color:#0A0A14;font-weight:800;font-size:13.5px;text-decoration:none;',
      'padding:9px 18px;border-radius:22px;white-space:nowrap}',
      '.sau-ab-cta:hover{filter:brightness(1.07)}',
      '.sau-ab-x{flex:0 0 auto;background:none;border:0;color:#7A7A9E;',
      'font-size:22px;line-height:1;padding:4px 6px;cursor:pointer}',
      '.sau-ab-x:hover{color:#F4F4FB}',
      '@media(max-width:420px){.sau-ab-txt span{display:none}',
      '.sau-ab-cta{padding:9px 15px}}',
      '@media(prefers-reduced-motion:reduce){#sau-app-bar{transition:none}}'
    ].join('');

    document.head.appendChild(css);
    document.body.appendChild(bar);

    // Keep the bar from sitting on top of the last line of the page.
    var pad = document.body.style.paddingBottom;
    document.body.style.paddingBottom =
      'calc(' + (pad && pad !== '0px' ? pad : '0px') + ' + 74px)';

    requestAnimationFrame(function () { bar.classList.add('sau-in'); });

    bar.querySelector('.sau-ab-x').addEventListener('click', function () {
      remember();
      bar.classList.remove('sau-in');
      document.body.style.paddingBottom = pad;
      setTimeout(function () { bar.remove(); }, 350);
    });
  }

  function start() {
    try {
      if (document.getElementById('sau-app-bar')) return; // never double-inject
      if (alreadyHasIt() || dismissedRecently()) return;
      // Short delay so the bar slides in rather than being the first paint.
      setTimeout(build, 700);
    } catch (e) {
      /* swallow — an install bar must never break the site */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
