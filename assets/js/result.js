/* GlowSelf v2 — result page */
(function () {
  'use strict';

  var UI = window.GLOW_UI;
  var G = window.GLOW;
  var result = null;
  var isShared = false;

  function $(id) { return document.getElementById(id); }
  function set(id, text) { var el = $(id); if (el) el.textContent = text; }

  function sharedResult() {
    var parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'r' || parts.length < 3) return null;
    var seasonId = parts[1];
    var styleId = parts[2];
    if (!G.seasons[seasonId] || !G.archetypes[styleId]) return null;
    var params = new URLSearchParams(location.search);
    var goal = params.get('g') || 'outfit';
    var body = params.get('b') || 'H';
    return {
      version: 2,
      shared: true,
      seasonId: seasonId,
      styleId: styleId,
      season: G.seasons[seasonId],
      archetype: G.archetypes[styleId],
      body: G.bodyTypes[body] || G.bodyTypes.H,
      goal: G.goals[goal] || G.goals.outfit,
      answers: { goal: goal, body: body },
      secondary: []
    };
  }

  function coords(season) {
    var f = season.family;
    var warm = (f === '春' || f === '秋') ? '偏暖' : '偏冷';
    var depth = '中等';
    var clarity = '中等';
    if (season.id.indexOf('light') === 0) { depth = '偏浅'; clarity = '清透'; }
    if (season.id.indexOf('deep') === 0) { depth = '偏深'; clarity = '浓郁'; }
    if (season.id.indexOf('soft') === 0) { depth = '中等'; clarity = '柔和'; }
    if (season.id.indexOf('clear') === 0) { depth = '中高'; clarity = '鲜明'; }
    return { warm: warm, depth: depth, clarity: clarity };
  }

  function fill() {
    var s = result.season;
    var a = result.archetype;
    var c = coords(s);
    set('season-family', s.family);
    set('season-name', s.name);
    set('season-name-2', s.name);
    set('palette-title', s.name);
    set('palette-en', s.en.toUpperCase());
    set('season-tagline', s.tagline);
    set('season-description', s.description);
    set('coord-warm', c.warm);
    set('coord-depth', c.depth);
    set('coord-clarity', c.clarity);
    set('style-name', a.name);
    set('style-name-2', a.name);
    set('style-description', a.description);
    set('style-silhouette', a.silhouette);
    set('style-fabrics', a.fabrics);
    set('style-pieces', a.pieces.join(' · '));
    set('lip', s.lip);
    set('blush', s.blush);
    set('eye', s.eye);
    set('hair', s.hair);
    set('metal', s.metal);
    set('metal-short', '金属：' + s.metal.split('、')[0]);
    set('body-name', result.body.name);
    set('body-advice', result.body.advice);
    set('goal-headline', result.goal.headline);
    set('goal-copy', result.goal.copy);
    document.title = '我的色彩 DNA：' + s.name + ' · ' + a.name + '｜GlowSelf';
    var date = new Date();
    set('report-date', 'GLOWSELF · ' + date.getFullYear() + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0'));

    var tags = [s.keywords[0], s.keywords[1], a.keywords[0], a.keywords[1]].concat(result.secondary || []);
    $('result-tags').innerHTML = Array.from(new Set(tags)).slice(0, 5).map(function (t) {
      return '<span>' + UI.escapeHtml(t) + '</span>';
    }).join('');

    $('palette-large').innerHTML = s.palette.map(function (col) {
      return '<span class="swatch" style="background:' + col[0] + '" title="' + col[1] + '"><i>' + col[1] + '</i></span>';
    }).join('');

    $('best-colors').innerHTML = s.palette.slice(0, 6).map(function (col) {
      return '<div class="color-item"><span class="dot" style="background:' + col[0] + '"></span><span>' + col[1] + '</span><span class="hex">' + col[0].toUpperCase() + '</span></div>';
    }).join('');

    $('avoid-list').innerHTML = s.avoid.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    $('style-avoid').innerHTML = '<span style="text-decoration:none;background:transparent;padding-left:0;color:var(--muted-2)">风格避雷：' + a.avoid + '</span>';

    $('outfit-list').innerHTML = s.formulas.map(function (f) {
      return '<li>' + f + '</li>';
    }).join('');

    if (result.body && result.body.advice && result.answers.body) {
      var extra = {
        X: '优先：收腰连衣裙、细腰带、V 领。',
        H: '优先：短上衣 + 高腰直筒裤、侧开衩半裙。',
        A: '优先：方领上装、泡泡袖、A 字裙。',
        O: '优先：V 领、长马甲、直筒裤。',
        Y: '优先：V 领、落肩、阔腿裤。'
      }[result.answers.body];
      if (extra) set('body-advice', result.body.advice + ' ' + extra);
    }

    if (isShared) {
      $('shared-banner').hidden = false;
      $('retake-link').textContent = '测测我的';
      document.querySelectorAll('[data-open-unlock], #email-report-form, #accuracy').forEach(function (el) {
        var wrap = el.closest('.side-card, .locked-wrap');
        if (wrap) wrap.style.display = 'none';
      });
      var navUnlock = document.querySelector('.nav-actions [data-open-unlock]');
      if (navUnlock) navUnlock.style.display = 'none';
      var next = document.querySelector('.result-side .side-card:last-child');
      if (next) next.style.display = '';
    }
  }

  function drawCard() {
    var canvas = $('share-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 1080, H = 1350;
    var s = result.season;
    var a = result.archetype;

    ctx.fillStyle = '#f6f1e8';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#ded3c3';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, W - 84, H - 84);

    ctx.fillStyle = '#bf4b32';
    ctx.beginPath(); ctx.arc(96, 104, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1f1b16';
    ctx.font = '500 28px "Songti SC", "Noto Serif SC", serif';
    ctx.fillText('光绽 GLOWSELF', 120, 114);

    ctx.fillStyle = '#9a8f80';
    ctx.font = '600 18px "PingFang SC", sans-serif';
    ctx.fillText('PERSONAL COLOUR DNA · 12 SEASONS', 80, 190);

    ctx.fillStyle = '#1f1b16';
    ctx.font = '500 132px "Songti SC", "Noto Serif SC", serif';
    ctx.fillText(s.name, 76, 340);

    ctx.fillStyle = '#bf4b32';
    ctx.font = 'italic 38px Georgia, serif';
    ctx.fillText(s.en, 82, 404);

    ctx.fillStyle = '#3a332b';
    ctx.font = '400 30px "PingFang SC", sans-serif';
    wrapText(ctx, s.tagline, 80, 470, 900, 44);

    var cols = s.palette.slice(0, 6);
    var startX = 80, gap = 150, rowY = 660;
    cols.forEach(function (col, i) {
      ctx.fillStyle = col[0];
      ctx.beginPath(); ctx.arc(startX + i * gap + 54, rowY, 54, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#786d5f';
      ctx.font = '400 20px "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col[1], startX + i * gap + 54, rowY + 84);
      ctx.textAlign = 'left';
    });

    ctx.strokeStyle = '#ded3c3';
    ctx.beginPath(); ctx.moveTo(80, 800); ctx.lineTo(1000, 800); ctx.stroke();

    ctx.fillStyle = '#9a8f80';
    ctx.font = '600 18px "PingFang SC", sans-serif';
    ctx.fillText('STYLE COORDINATE', 80, 868);
    ctx.fillStyle = '#1f1b16';
    ctx.font = '500 56px "Songti SC", "Noto Serif SC", serif';
    ctx.fillText(a.name, 80, 936);

    ctx.fillStyle = '#786d5f';
    ctx.font = '400 26px "PingFang SC", sans-serif';
    ctx.fillText(s.keywords.join(' · ') + ' · ' + a.keywords.slice(0, 2).join(' · '), 80, 988);

    ctx.fillStyle = '#1f1b16';
    ctx.font = '500 26px "PingFang SC", sans-serif';
    ctx.fillText('不评分，不排名。只把你的特征，翻译成选择。', 80, 1120);

    ctx.fillStyle = '#9a8f80';
    ctx.font = '400 22px "PingFang SC", sans-serif';
    ctx.fillText('3 分钟测出你的色彩 DNA  →  glowself.cn', 80, 1238);

    ctx.fillStyle = '#bf4b32';
    ctx.beginPath(); ctx.arc(988, 1232, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6f1e8';
    ctx.font = '500 22px "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('G', 988, 1240);
    ctx.textAlign = 'left';
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var chars = String(text).split('');
    var line = '';
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = chars[i];
        y += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y;
  }

  function download() {
    var canvas = $('share-canvas');
    if (!canvas) return;
    canvas.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'glowself-' + result.seasonId + '.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.track('share_card_download', { seasonId: result.seasonId });
    }, 'image/png');
  }

  function bind() {
    $('download-card').addEventListener('click', download);
    $('copy-link').addEventListener('click', function () {
      var url = UI.shareUrl(result);
      UI.copyText(url).then(function () {
        UI.toast('链接已复制，去发给朋友吧');
        UI.track('share_link_copy', { seasonId: result.seasonId });
      }).catch(function () { UI.toast('复制失败，请手动复制地址栏'); });
    });

    $('email-report-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.currentTarget;
      var btn = form.querySelector('button');
      var email = form.email.value.trim();
      btn.disabled = true;
      btn.textContent = '发送中';
      UI.postLead({
        email: email,
        intent: 'free_report',
        source: isShared ? 'shared_result' : 'result',
        result: { seasonId: result.seasonId, styleId: result.styleId, goal: result.answers && result.answers.goal }
      }).then(function () {
        form.hidden = true;
        $('email-success').hidden = false;
        UI.track('report_email_submitted', { seasonId: result.seasonId });
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = '发送';
        UI.toast('发送失败，请稍后再试');
      });
    });

    document.querySelectorAll('#accuracy button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#accuracy button').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        UI.track('result_accuracy', { value: btn.dataset.accuracy, seasonId: result.seasonId, styleId: result.styleId });
        UI.postLead({
          email: '',
          intent: 'result_feedback',
          source: 'result',
          feedback: btn.dataset.accuracy,
          result: { seasonId: result.seasonId, styleId: result.styleId }
        }).catch(function () {});
        UI.toast('收到。谢谢你帮我们校准。');
      });
    });

    $('retake-link').addEventListener('click', function () {
      if (!isShared) UI.clearResult();
    });
  }

  function init() {
    var shared = sharedResult();
    if (shared) {
      result = shared;
      isShared = true;
    } else {
      result = UI.getResult();
    }
    $('result-root').hidden = false;
    if (!result || !result.season || !result.archetype) {
      $('result-root').hidden = true;
      $('empty-state').hidden = false;
      UI.track('result_empty_view');
      return;
    }
    fill();
    drawCard();
    bind();
    UI.track('result_view', {
      seasonId: result.seasonId,
      styleId: result.styleId,
      shared: isShared,
      goal: result.answers && result.answers.goal
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
