/* GlowSelf v2 — member space */
(function () {
  'use strict';

  var UI = window.GLOW_UI;
  var G = window.GLOW;
  var KEY = { wardrobe: 'glow_wardrobe_v1', plan: 'glow_plan_v1', saved: 'glow_saved_v1', email: 'glow_email_v1' };
  var result = null;
  var selectedDate = new Date();
  var variantByDate = {};
  var wardrobe = read(KEY.wardrobe, []);
  var planDone = read(KEY.plan, []);
  var saved = read(KEY.saved, []);
  var activeTab = 'today';

  function $(id) { return document.getElementById(id); }
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dayName(d) { return '日一二三四五六'[d.getDay()]; }
  function shortDate(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  var sceneTags = ['通勤', '见朋友', '周末', '约会', '出差', '居家', '重要场合'];

  function buildLook(date, variant) {
    var s = result.season;
    var a = result.archetype;
    var p = s.palette;
    var c = function (i) { return p[i % p.length][1]; };
    var scene = sceneTags[(date.getDay() + variant) % sceneTags.length];
    var body = result.answers.body || 'H';
    var bottoms = {
      X: ['收腰半裙', '直筒裤', '裹身裙'],
      H: ['高腰直筒裤', 'A 字半裙', '阔腿裤'],
      A: ['A 字半裙', '直筒裤', '伞裙'],
      O: ['直筒裤', '长马甲', '开衩半裙'],
      Y: ['阔腿裤', 'A 字裙', '微喇裤']
    }[body] || ['直筒裤', '半裙', '阔腿裤'];
    var tops = ['针织', '衬衫', '西装', '开衫', 'T 恤', '连衣裙', '马甲'];
    var shoes = ['乐福鞋', '尖头低跟鞋', '帆布鞋', '短靴', '玛丽珍鞋', '平底凉鞋', '运动鞋'];
    var t = tops[(date.getDate() + variant) % tops.length];
    var b = bottoms[(date.getDate() + variant) % bottoms.length];
    var sh = shoes[(date.getDate() + variant) % shoes.length];
    var c1 = c(5 + variant);
    var c2 = c(3 + variant);
    var c3 = c(9 + variant);
    var items = [c1 + t, c2 + b, sh];
    return {
      id: iso(date) + '-' + variant,
      scene: scene,
      items: items,
      colors: [p[(5 + variant) % 12][0], p[(3 + variant) % 12][0], p[(9 + variant) % 12][0]],
      title: items[0] + ' + ' + items[1],
      sub: '配 ' + items[2] + '。' + (variant % 2 ? '不费力的比例，适合坐一整天。' : '颜色靠近脸，精神会先回来。'),
      whyColor: '用' + s.keywords[0] + '的' + c1 + '和' + c2 + '，让肤色先显得干净。',
      whyShape: a.silhouette + '。',
      whyRatio: {
        X: '腰线清楚，上下保持平衡。',
        H: '短上衣 + 高腰，制造纵向比例。',
        A: '视觉重心放在肩颈，下装保持利落。',
        O: 'V 领和纵向线条拉长比例。',
        Y: '弱化肩部，下装增加一点量感。'
      }[body] || ''
    };
  }

  function renderLook() {
    var variant = variantByDate[iso(selectedDate)] || 0;
    var look = buildLook(selectedDate, variant);
    $('look-tag').textContent = look.scene + ' · ' + (result.season.keywords[0] || '');
    $('look-date').textContent = shortDate(selectedDate) + ' 周' + dayName(selectedDate);
    $('look-title').textContent = look.title;
    $('look-sub').textContent = look.sub;
    $('look-palette').innerHTML = look.colors.map(function (hex) {
      return '<span style="background:' + hex + '"></span>';
    }).join('');
    $('why-color').textContent = look.whyColor;
    $('why-shape').textContent = look.whyShape;
    $('why-ratio').textContent = look.whyRatio;
    $('look-why').textContent = '为什么是这套？';
    var isSaved = saved.indexOf(look.id) >= 0;
    $('save-look').textContent = isSaved ? '已收藏' : '收藏';
    $('save-look').dataset.lookId = look.id;
    $('save-look').dataset.lookTitle = look.title;
  }

  function renderWeek() {
    var start = addDays(new Date(), -new Date().getDay() + 1);
    var html = '';
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i);
      var isToday = iso(d) === iso(new Date());
      var isSel = iso(d) === iso(selectedDate);
      html += '<button class="day' + (isToday ? ' today' : '') + '" type="button" data-date="' + iso(d) + '" style="' + (isSel && !isToday ? 'border-color:var(--ink)' : '') + '">' +
        '<span class="d">周' + dayName(d) + '</span><span class="n">' + d.getDate() + '</span><span class="look-dot"></span></button>';
    }
    $('week-strip').innerHTML = html;
    $('week-strip').querySelectorAll('[data-date]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.dataset.date.split('-');
        selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        renderWeek();
        renderLook();
        UI.track('app_day_select', { date: btn.dataset.date });
      });
    });
  }

  function renderPlan() {
    var done = planDone.length;
    var pct = Math.round(done / 30 * 100);
    [['plan-bar', pct], ['plan-bar-2', pct]].forEach(function (pair) {
      var el = $(pair[0]); if (el) el.style.width = pair[1] + '%';
    });
    [['plan-percent', pct], ['plan-percent-2', pct], ['plan-done', done]].forEach(function (pair) {
      var el = $(pair[0]); if (el) el.textContent = pair[0] === 'plan-done' ? done : pct + '%';
    });
    $('plan-day').textContent = Math.max(1, done + 1);
    var grid = $('plan-grid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < 30; i++) {
      var d = addDays(new Date(), i);
      var key = iso(d);
      var look = buildLook(d, 0);
      var isDone = planDone.indexOf(key) >= 0;
      html += '<button class="plan-day' + (isDone ? ' done' : '') + '" type="button" data-plan="' + key + '">' +
        '<span class="pd">DAY ' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="pt">' + look.title + '</span>' +
        '<span class="ps">' + (isDone ? '已完成 ✓' : d.getDate() + ' 日 · 点按完成') + '</span></button>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('[data-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.plan;
        var idx = planDone.indexOf(key);
        if (idx >= 0) planDone.splice(idx, 1); else planDone.push(key);
        write(KEY.plan, planDone);
        renderPlan();
        UI.track('plan_toggle', { date: key, done: idx < 0 });
      });
    });
  }

  function renderWardrobe() {
    var grid = $('wardrobe-grid');
    $('wardrobe-count').textContent = wardrobe.length + ' 件';
    $('wardrobe-empty').hidden = wardrobe.length > 0;
    grid.innerHTML = wardrobe.map(function (item, i) {
      var text = isLight(item.hex) ? '#1f1b16' : '#fffdf8';
      return '<button class="wardrobe-item filled" type="button" data-remove="' + i + '" title="点击移除" style="background:' + item.hex + ';color:' + text + '">' + UI.escapeHtml(item.name) + '<span style="display:block;font-size:8px;opacity:.7">' + item.category + '</span></button>';
    }).join('');
    grid.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = Number(btn.dataset.remove);
        if (!confirm('从衣橱移除「' + wardrobe[i].name + '」？')) return;
        var removed = wardrobe.splice(i, 1)[0];
        write(KEY.wardrobe, wardrobe);
        renderWardrobe();
        UI.toast('已移除 ' + removed.name);
      });
    });
  }

  function isLight(hex) {
    var h = hex.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  }

  function renderDNA() {
    var s = result.season, a = result.archetype;
    $('side-season').textContent = s.name + ' · ' + a.name;
    $('dna-title').textContent = s.name;
    $('dna-style').textContent = a.name;
    $('dna-season-2').textContent = s.name;
    $('dna-en').textContent = s.en.toUpperCase();
    $('dna-desc').textContent = s.description;
    $('dna-style-2').textContent = a.name;
    $('dna-style-desc').textContent = a.description;
    $('dna-pieces').textContent = a.pieces.join(' · ');
    $('dna-makeup').textContent = s.lip + ' / ' + s.blush;
    $('dna-palette').innerHTML = s.palette.slice(0, 7).map(function (col) {
      return '<span style="width:26px;height:26px;border-radius:50%;background:' + col[0] + '" title="' + col[1] + '"></span>';
    }).join('');
    $('dna-full-palette').innerHTML = s.palette.map(function (col) {
      return '<span class="swatch" style="background:' + col[0] + '" title="' + col[1] + '"><i>' + col[1] + '</i></span>';
    }).join('');
    var sel = $('wardrobe-color');
    sel.innerHTML = s.palette.map(function (col) {
      return '<option value="' + col[0] + '">' + col[1] + '</option>';
    }).join('');
  }

  function renderTasks() {
    var tasks = [
      '把今天这套的颜色，拍下来存进手机相册',
      '从衣柜里找一件最接近「' + result.season.palette[5][1] + '」的上装',
      '出门前，只看脸附近 30cm 的颜色',
      '晚上回来，给这套 look 打个「像不像我」'
    ];
    $('tasks').innerHTML = tasks.map(function (t, i) {
      return '<label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer"><input type="checkbox" data-task="' + i + '" style="margin-top:3px"> <span>' + t + '</span></label>';
    }).join('');
  }

  function setGreeting() {
    var h = new Date().getHours();
    var g = h < 6 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
    $('greeting').textContent = g;
    $('today-meta').textContent = '今天是 ' + shortDate(new Date()) + '，周' + dayName(new Date()) + '。已经为你准备好一套。';
    $('weather').textContent = '今天 · ' + shortDate(new Date());
  }

  function switchTab(tab) {
    if (!['today', 'dna', 'wardrobe', 'plan', 'settings'].includes(tab)) tab = 'today';
    activeTab = tab;
    document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== tab; });
    document.querySelectorAll('[data-tab]').forEach(function (a) { a.classList.toggle('active', a.dataset.tab === tab); });
    var titles = { today: '今天', dna: '我的 DNA', wardrobe: '衣橱', plan: '30 天计划', settings: '设置' };
    $('page-title').textContent = titles[tab];
    if (history.replaceState) history.replaceState(null, '', '#' + tab);
    UI.track('app_tab_view', { tab: tab });
  }

  function bind() {
    document.querySelectorAll('[data-tab]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); switchTab(a.dataset.tab); });
    });
    $('new-look').addEventListener('click', function () {
      var key = iso(selectedDate);
      variantByDate[key] = (variantByDate[key] || 0) + 1;
      renderLook();
      UI.track('app_look_refresh', { date: key, variant: variantByDate[key] });
    });
    $('save-look').addEventListener('click', function () {
      var id = $('save-look').dataset.lookId;
      var idx = saved.indexOf(id);
      if (idx >= 0) { saved.splice(idx, 1); UI.toast('已取消收藏'); }
      else { saved.push(id); UI.toast('已收藏这套 look'); }
      write(KEY.saved, saved);
      renderLook();
      UI.track('app_look_save', { id: id, saved: idx < 0 });
    });
    $('wardrobe-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.currentTarget;
      var name = f.name.value.trim();
      if (!name) return;
      if (wardrobe.length >= 24) { UI.toast('内测版最多记录 24 件'); return; }
      wardrobe.push({ name: name, category: f.category.value, hex: f.color.value, addedAt: new Date().toISOString() });
      write(KEY.wardrobe, wardrobe);
      f.reset();
      renderWardrobe();
      UI.track('wardrobe_add', { category: f.category.value });
    });
    $('account-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.currentTarget;
      var email = f.email.value.trim();
      var btn = f.querySelector('button');
      btn.disabled = true;
      UI.postLead({ email: email, intent: 'account_email', source: 'app_settings', result: { seasonId: result.seasonId, styleId: result.styleId } })
        .then(function () {
          write(KEY.email, email);
          f.hidden = true;
          $('account-success').hidden = false;
          UI.track('account_email_submitted');
        })
        .catch(function () { btn.disabled = false; UI.toast('保存失败，请稍后再试'); });
    });
    $('export-data').addEventListener('click', function () {
      var data = {
        exportedAt: new Date().toISOString(),
        result: UI.getResult(),
        wardrobe: wardrobe,
        plan: planDone,
        savedLooks: saved,
        email: read(KEY.email, '')
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'glowself-my-data.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.track('data_export');
    });
    $('delete-data').addEventListener('click', function () {
      if (!confirm('删除后会清空本机的报告、衣橱和计划，且无法恢复。继续？')) return;
      ['glow_result_v2', KEY.wardrobe, KEY.plan, KEY.saved, KEY.email, 'glow_session_id'].forEach(function (k) { localStorage.removeItem(k); });
      UI.track('data_delete');
      location.href = '/';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.querySelector('.modal-backdrop.open')) UI.closeModal();
    });
  }

  function init() {
    result = UI.getResult();
    setGreeting();
    if (!result || !result.season || !result.archetype) {
      $('app-empty').hidden = false;
      $('app-ready').hidden = true;
      var topReport = document.querySelector('.app-top a[href="/result.html"]');
      if (topReport) { topReport.textContent = '开始测试'; topReport.href = '/test.html'; }
      UI.track('app_empty_view');
      return;
    }
    $('app-empty').hidden = true;
    $('app-ready').hidden = false;
    renderDNA();
    renderLook();
    renderWeek();
    renderPlan();
    renderWardrobe();
    renderTasks();
    bind();
    switchTab(location.hash.replace('#', '') || 'today');
    UI.track('app_view', { seasonId: result.seasonId, styleId: result.styleId });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
