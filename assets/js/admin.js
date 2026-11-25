(function () {
  'use strict';
  var KEY = 'glow_admin_key';
  var gate = document.getElementById('gate');
  var dash = document.getElementById('dashboard');
  var form = document.getElementById('gate-form');
  var input = document.getElementById('admin-key');
  var error = document.getElementById('gate-error');
  var range = document.getElementById('range');
  var timer = null;

  function key() { return sessionStorage.getItem(KEY) || ''; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function seasonName(id) {
    var s = window.GLOW && window.GLOW.seasons && window.GLOW.seasons[id];
    return s ? s.name : id;
  }

  function styleName(id) {
    var s = window.GLOW && window.GLOW.archetypes && window.GLOW.archetypes[id];
    return s ? s.name : id;
  }

  function showGate(message) {
    dash.hidden = true;
    gate.hidden = false;
    error.hidden = !message;
    if (message) error.textContent = message;
    setTimeout(function () { input.focus(); }, 30);
  }

  function showDash() {
    gate.hidden = true;
    dash.hidden = false;
  }

  function fetchStats() {
    var days = range.value;
    var headers = {};
    headers['x-admin-key'] = key();
    return fetch('/api/stats?days=' + days, { headers: headers, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      });
  }

  function metric(label, value, hint) {
    return '<div class="metric"><div class="metric-k">' + esc(label) + '</div><div class="metric-v">' + esc(value) + '</div><div class="metric-h">' + esc(hint) + '</div></div>';
  }

  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }

  function render(data) {
    var b = data.byName || {};
    var pv = b.page_view || 0;
    var start = b.quiz_start || 0;
    var complete = b.quiz_complete || 0;
    var result = b.result_view || 0;
    var share = (b.share_link_copy || 0) + (b.share_card_download || 0);
    var leads = data.leads || 0;
    var rate = start ? Math.round(complete / start * 100) : 0;

    document.getElementById('metrics').innerHTML =
      metric('独立会话', data.sessions, '去重 session') +
      metric('事件', data.events, '近 ' + data.days + ' 天') +
      metric('测试开始', start, 'quiz_start') +
      metric('测试完成', complete, '完成率 ' + rate + '%') +
      metric('结果页浏览', result, 'result_view') +
      metric('留资', leads, '邮箱 / 内测申请');

    var stages = [
      ['页面浏览', pv],
      ['测试开始', start],
      ['测试完成', complete],
      ['结果页', result],
      ['分享 / 下载', share],
      ['邮箱留资', (b.report_email_submitted || 0) + (b.lead_submitted || 0)]
    ];
    document.getElementById('funnel').innerHTML = stages.map(function (s) {
      var p = pct(s[1], pv);
      return '<div class="funnel-row"><div class="funnel-top"><span>' + s[0] + '</span><b>' + s[1] + '</b></div><div class="funnel-bar"><i style="width:' + Math.min(100, p) + '%"></i></div><div class="funnel-pct">' + p + '%</div></div>';
    }).join('');

    var days = data.byDay || [];
    var max = Math.max.apply(null, days.map(function (d) { return d.events; }).concat([1]));
    document.getElementById('day-chart').innerHTML = days.map(function (d) {
      var h = Math.max(3, Math.round(d.events / max * 120));
      return '<div class="day-col"><div class="day-bar" style="height:' + h + 'px" title="' + d.date + ' · ' + d.events + ' 事件"><span>' + d.events + '</span></div><small>' + d.date.slice(5) + '</small></div>';
    }).join('');
    document.getElementById('range-label').textContent = '近 ' + data.days + ' 天';

    function ranks(el, rows, mapper) {
      if (!rows || !rows.length) { el.innerHTML = '<p class="admin-empty">暂无数据。</p>'; return; }
      var max = rows[0][1] || 1;
      el.innerHTML = rows.map(function (r) {
        return '<div class="rank-row"><div class="rank-top"><span>' + esc(mapper(r[0])) + '</span><b>' + r[1] + '</b></div><div class="rank-bar"><i style="width:' + Math.round(r[1] / max * 100) + '%"></i></div></div>';
      }).join('');
    }
    ranks(document.getElementById('top-seasons'), data.topSeasons, seasonName);
    ranks(document.getElementById('top-styles'), data.topStyles, styleName);
    ranks(document.getElementById('top-referrers'), data.topReferrers, function (x) { return x.replace('ref:', '邀请 '); });
    ranks(document.getElementById('top-campaigns'), data.topCampaigns, function (x) { return x; });

    var tb = document.getElementById('leads-body');
    var empty = document.getElementById('leads-empty');
    var recent = data.recentLeads || [];
    var intentLabel = { paid_plus: '首月付款', plus_trial: 'Plus 预约', free_report: '免费报告', result_feedback: '结果反馈', account_email: '邮箱同步', consult: '顾问咨询', notify: '通知' };
    empty.hidden = recent.length > 0;
    tb.innerHTML = recent.map(function (l) {
      return '<tr><td>' + esc((l.ts || '').replace('T', ' ').slice(0, 16)) + '</td><td>' + esc(l.email) + '</td><td>' + esc(intentLabel[l.intent] || l.intent) + '</td><td>' + esc(l.source) + '</td><td>' + esc(l.message || '—') + '</td><td>' + esc(seasonName(l.seasonId)) + '</td><td>' + esc(styleName(l.styleId)) + '</td></tr>';
    }).join('');

    document.getElementById('updated').textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  function load(showError) {
    fetchStats().then(function (data) {
      showDash();
      render(data);
    }).catch(function () {
      if (showError) showGate('密钥错误，或服务端未设置 ADMIN_KEY。');
      else showGate('');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    sessionStorage.setItem(KEY, v);
    load(true);
  });

  range.addEventListener('change', function () { load(true); });
  document.getElementById('refresh').addEventListener('click', function () { load(true); });
  document.getElementById('signout').addEventListener('click', function () {
    sessionStorage.removeItem(KEY);
    input.value = '';
    showGate('');
  });

  if (key()) load(false);
  else showGate('');
})();
