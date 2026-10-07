/**
 * Meta Pixel para páginas de campanha da Arcaffo (ex.: /diagnostico-de-marca/).
 *
 * Uso: <script defer src="/tracking/meta-pixel.js" data-pixel="ID" data-content-name="..."></script>
 * O Pixel só carrega depois do consentimento (LGPD), dado no aviso que este script mostra.
 * Eventos:
 *  - PageView: ao carregar o Pixel.
 *  - ViewContent: quando o cartão do formulário (#diagnostico) aparece na tela.
 *  - CTAClick (custom): clique em qualquer link para #diagnostico.
 *  - Lead: envio do formulário (evento `arcaffo:success`), com eventID = responseId,
 *    para deduplicar com a Conversions API. Se o envio acontecer antes do consentimento
 *    ou o Pixel não terminar a tempo, a página de obrigado reenvia com o mesmo eventID.
 */
(function () {
  var script = document.currentScript;
  var PIXEL_ID = script && script.dataset.pixel;
  var CONTENT_NAME = (script && script.dataset.contentName) || document.title;
  var CONSENT_KEY = 'arcaffo:consent';
  var LEAD_KEY = 'arcaffo:meta-lead';
  if (!PIXEL_ID) return;

  function store(kind, key, value) {
    try {
      var s = kind === 'local' ? localStorage : sessionStorage;
      if (value === undefined) return s.getItem(key);
      if (value === null) s.removeItem(key); else s.setItem(key, value);
    } catch (e) { /* sem armazenamento: segue sem lembrar */ }
    return null;
  }

  function loadPixel() {
    if (window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // Lead pendente: { id, sent }. Gravado no envio, conferido na página de obrigado.
  function sendLead() {
    var raw = store('session', LEAD_KEY);
    if (!raw || !window.fbq) return;
    var lead; try { lead = JSON.parse(raw); } catch (e) { return; }
    if (lead.sent) return;
    window.fbq('track', 'Lead', { content_name: CONTENT_NAME }, lead.id ? { eventID: lead.id } : undefined);
    lead.sent = true;
    store('session', LEAD_KEY, JSON.stringify(lead));
  }

  // Captura o envio mesmo sem consentimento; o Pixel só manda depois que houver.
  document.addEventListener('arcaffo:success', function (event) {
    var id = (event.detail && event.detail.responseId) || null;
    store('session', LEAD_KEY, JSON.stringify({ id: id, sent: false }));
    sendLead();
  });

  var started = false;
  function start() {
    if (started) return;
    started = true;
    loadPixel();
    sendLead();

    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href="#diagnostico"]');
      if (link && window.fbq) window.fbq('trackCustom', 'CTAClick', { label: link.id || link.textContent.trim() });
    });

    var form = document.getElementById('diagnostico');
    if (form && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        window.fbq('track', 'ViewContent', { content_name: CONTENT_NAME });
        observer.disconnect();
      }, { threshold: 0.35 });
      observer.observe(form);
    }
  }

  function showNotice() {
    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.innerHTML = '<p>Usamos cookies de medição para entender quais anúncios trazem você até aqui.</p>' +
      '<div><button type="button" data-consent="denied">Recusar</button>' +
      '<button type="button" data-consent="granted">Aceitar</button></div>';
    bar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (!button) return;
      store('local', CONSENT_KEY, button.dataset.consent);
      bar.remove();
      document.body.classList.remove('has-consent-bar');
      if (button.dataset.consent === 'granted') start();
    });
    document.body.appendChild(bar);
    document.body.classList.add('has-consent-bar');
  }

  var consent = store('local', CONSENT_KEY);
  if (consent === 'granted') start();
  else if (consent !== 'denied') showNotice();
})();
