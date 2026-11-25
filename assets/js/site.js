/* GlowSelf v2 — shared UI + analytics helpers */
(function () {
  'use strict';

  const API = {
    events: '/api/events',
    leads: '/api/leads'
  };
  const SESSION_KEY = 'glow_session_id';
  const RESULT_KEY = 'glow_result_v2';
  const UID_KEY = 'glow_uid';
  const REF_KEY = 'glow_ref';
  const CAMP_KEY = 'glow_campaign_v1';
  const CAMP_TTL = 30 * 86400 * 1000;

  function id() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function sessionId() {
    let v = localStorage.getItem(SESSION_KEY);
    if (!v) { v = id(); localStorage.setItem(SESSION_KEY, v); }
    return v;
  }

  function uid() {
    let v = localStorage.getItem(UID_KEY);
    if (!v) { v = 'u_' + id().replace(/-/g, '').slice(0, 18); localStorage.setItem(UID_KEY, v); }
    return v;
  }
  function ref() {
    const incoming = new URLSearchParams(location.search).get('ref');
    if (incoming && /^[a-zA-Z0-9_-]{4,40}$/.test(incoming)) {
      localStorage.setItem(REF_KEY, incoming);
      return incoming;
    }
    return localStorage.getItem(REF_KEY) || '';
  }


  function readCampaign() {
    try {
      const c = JSON.parse(localStorage.getItem(CAMP_KEY) || 'null');
      if (!c || !c.at || Date.now() - c.at > CAMP_TTL) {
        localStorage.removeItem(CAMP_KEY);
        return null;
      }
      return c;
    } catch (e) { return null; }
  }

  function captureCampaign() {
    const params = new URLSearchParams(location.search);
    const incoming = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (key) {
      const value = params.get('utm_' + key);
      if (value) incoming[key] = value.replace(/[^\w\-./]/g, '').slice(0, 80);
    });
    if (!incoming.source && !incoming.campaign) return readCampaign();
    const existing = readCampaign();
    if (existing) return existing; // first-touch attribution for 30 days
    const data = Object.assign(incoming, { at: Date.now(), landing: location.pathname });
    try { localStorage.setItem(CAMP_KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  function campaignProps() {
    const c = readCampaign();
    if (!c) return undefined;
    const out = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (key) {
      if (c[key]) out[key] = c[key];
    });
    return Object.keys(out).length ? out : undefined;
  }

  function track(name, props) {
    const payload = {
      name: name,
      props: Object.assign({}, props || {}, { uid: uid(), ref: ref() || undefined, campaign: campaignProps() }),
      sessionId: sessionId(),
      path: location.pathname + location.search,
      referrer: document.referrer || '',
      ts: new Date().toISOString()
    };
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API.events, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(API.events, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
      }
    } catch (e) {}
    if (window.GLOW_DEBUG) console.log('[event]', name, payload.props);
  }

  function saveResult(result) {
    try { localStorage.setItem(RESULT_KEY, JSON.stringify(result)); } catch (e) {}
  }
  function getResult() {
    try { return JSON.parse(localStorage.getItem(RESULT_KEY) || 'null'); } catch (e) { return null; }
  }
  function clearResult() { localStorage.removeItem(RESULT_KEY); }

  function toast(message) {
    let el = document.getElementById('glow-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'glow-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function query(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function shareUrl(result) {
    const a = result.answers || {};
    const q = [];
    if (a.goal) q.push('g=' + encodeURIComponent(a.goal));
    if (a.body) q.push('b=' + encodeURIComponent(a.body));
    q.push('ref=' + encodeURIComponent(uid()));
    return location.origin + '/r/' + result.seasonId + '/' + result.styleId + '?' + q.join('&');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function postLead(data) {
    const payload = Object.assign({}, data, { uid: uid(), ref: ref() || undefined, campaign: campaignProps() });
    return fetch(API.leads, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      return r.json();
    });
  }

  function mountModal() {
    if (document.getElementById('unlock-modal')) return;
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.id = 'unlock-modal';
    wrap.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="unlock-title">',
      '  <button class="modal-close" type="button" aria-label="关闭" data-close>&times;</button>',
      '  <div class="kicker">GLOWSELF PLUS · 内测</div>',
      '  <h3 id="unlock-title">解锁你的完整形象说明书</h3>',
      '  <p>完整 12 季色彩报告、妆容色号、发型方向、30 天穿搭计划和每日 look。内测阶段先登记，不扣费。</p>',
      '  <div class="price-line"><strong>¥39</strong><span>/ 月 · 年付 ¥299</span></div>',
      '  <form data-lead-form>',
      '    <input type="email" name="email" required placeholder="你的邮箱" autocomplete="email">',
      '    <button class="btn btn-accent btn-block" type="submit">申请内测名额</button>',
      '  </form>',
      '  <p class="fine">提交即表示你同意我们仅用该邮箱发送 GlowSelf 内测与产品更新，可随时退订。正式收费前会再次确认。</p>',
      '</div>'
    ].join('');
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-close]')) closeModal();
    });
    const form = wrap.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button');
      const email = form.email.value.trim();
      btn.disabled = true;
      btn.textContent = '提交中…';
      postLead({ email: email, intent: 'plus_trial', source: wrap.dataset.source || 'site', result: getResult() })
        .then(function () {
          form.innerHTML = '<p class="success-msg">已加入内测名单。开通后我们会第一时间通知你。</p>';
          track('lead_submitted', { intent: 'plus_trial', source: wrap.dataset.source || 'site' });
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = '申请内测名额';
          toast('提交失败，请稍后再试');
        });
    });
  }

  function openModal(source) {
    mountModal();
    const wrap = document.getElementById('unlock-modal');
    wrap.dataset.source = source || 'site';
    wrap.classList.add('open');
    document.body.style.overflow = 'hidden';
    track('unlock_modal_open', { source: source || 'site' });
  }
  function closeModal() {
    const wrap = document.getElementById('unlock-modal');
    if (wrap) wrap.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }
    const links = document.querySelectorAll('.nav-links a');
    const path = location.pathname.replace(/\/$/, '') || '/';
    links.forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (href === path || (href !== '/' && path.indexOf(href) === 0)) a.classList.add('active');
    });
    document.querySelectorAll('[data-open-unlock]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(btn.dataset.openUnlock || 'cta');
      });
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }


  function initBilling() {
    const buttons = document.querySelectorAll('[data-billing]');
    if (!buttons.length) return;
    const prices = { Plus: { monthly: 39, annual: 299 }, Pro: { monthly: 199, annual: 1990 } };
    function apply(mode) {
      buttons.forEach(function (b) { b.classList.toggle('active', b.dataset.billing === mode); });
      document.querySelectorAll('.price-card').forEach(function (card) {
        const nameEl = card.querySelector('.price-name');
        const amountEl = card.querySelector('.price-amount strong');
        const periodEl = card.querySelector('.price-period');
        if (!nameEl || !amountEl) return;
        const plan = prices[nameEl.textContent.trim()];
        if (!plan) return;
        amountEl.textContent = '¥' + plan[mode];
        if (periodEl) periodEl.textContent = mode === 'annual' ? '/ 年' : '/ 月';
      });
      track('billing_toggle', { mode: mode });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.billing); });
    });
  }

  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  function init() {
    captureCampaign();
    initPWA();
    initNav();
    initBilling();
    initReveal();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    track('page_view', { title: document.title });
  }

  window.GLOW_UI = {
    track: track,
    saveResult: saveResult,
    getResult: getResult,
    clearResult: clearResult,
    toast: toast,
    escapeHtml: escapeHtml,
    query: query,
    shareUrl: shareUrl,
    copyText: copyText,
    postLead: postLead,
    openModal: openModal,
    closeModal: closeModal
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
