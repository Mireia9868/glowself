/* GlowSelf v2 — quiz flow */
(function () {
  'use strict';

  var questions = window.GLOW.questions;
  var answers = {};
  var index = 0;
  var stepsEl = document.getElementById('quiz-steps');
  var backBtn = document.getElementById('quiz-back');
  var nextBtn = document.getElementById('quiz-next');
  var progressText = document.getElementById('progress-text');
  var progressFill = document.getElementById('progress-fill');
  var progressLabel = document.getElementById('progress-label');
  var startedAt = Date.now();

  function renderSteps() {
    stepsEl.innerHTML = questions.map(function (q, qi) {
      var opts = q.options.map(function (o, oi) {
        return [
          '<button class="quiz-option" type="button" data-q="' + q.id + '" data-value="' + String(o.value) + '" data-index="' + oi + '">',
          '  <span class="quiz-key">' + (oi + 1) + '</span>',
          '  <span class="quiz-option-text"><b>' + o.label + '</b><span>' + o.sub + '</span></span>',
          '</button>'
        ].join('');
      }).join('');
      return [
        '<div class="quiz-step" data-step="' + qi + '" aria-hidden="true">',
        '  <div class="quiz-count">QUESTION ' + String(qi + 1).padStart(2, '0') + ' / ' + String(questions.length).padStart(2, '0') + '</div>',
        '  <h2 class="quiz-question">' + q.prompt + '</h2>',
        '  <p class="quiz-hint">' + q.hint + '</p>',
        '  <div class="quiz-options" role="radiogroup" aria-label="' + q.label + '">' + opts + '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function currentStep() {
    return stepsEl.querySelector('[data-step="' + index + '"]');
  }

  function update() {
    stepsEl.querySelectorAll('.quiz-step').forEach(function (el) {
      var active = Number(el.dataset.step) === index;
      el.classList.toggle('active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    var q = questions[index];
    progressText.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(questions.length).padStart(2, '0');
    progressFill.style.width = ((index + 1) / questions.length * 100) + '%';
    progressLabel.textContent = q.label;
    backBtn.hidden = index === 0;
    nextBtn.disabled = answers[q.id] === undefined;
    nextBtn.textContent = index === questions.length - 1 ? '生成我的报告 →' : '继续 →';
    var selected = answers[q.id];
    currentStep().querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.classList.toggle('selected', selected !== undefined && String(selected) === btn.dataset.value);
      btn.setAttribute('aria-checked', selected !== undefined && String(selected) === btn.dataset.value ? 'true' : 'false');
    });
    if (window.GLOW_UI) GLOW_UI.track('quiz_question_view', { index: index + 1, id: q.id });
  }

  function select(value, btn) {
    var q = questions[index];
    answers[q.id] = q.id === 'depth' ? Number(value) : value;
    currentStep().querySelectorAll('.quiz-option').forEach(function (b) {
      b.classList.toggle('selected', b === btn);
      b.setAttribute('aria-checked', b === btn ? 'true' : 'false');
    });
    nextBtn.disabled = false;
    if (window.GLOW_UI) GLOW_UI.track('quiz_answer', { id: q.id, value: value, index: index + 1 });
  }

  function goNext() {
    if (answers[questions[index].id] === undefined) return;
    if (index < questions.length - 1) {
      index += 1;
      update();
      var first = currentStep().querySelector('.quiz-option');
      if (first) first.focus({ preventScroll: true });
      return;
    }
    finish();
  }

  function finish() {
    nextBtn.disabled = true;
    nextBtn.textContent = '正在匹配 12 季色彩…';
    var result;
    try {
      result = window.GLOW.analyze(answers);
    } catch (err) {
      nextBtn.disabled = false;
      nextBtn.textContent = '生成我的报告 →';
      if (window.GLOW_UI) GLOW_UI.toast('生成失败，请重试');
      return;
    }
    result.durationSec = Math.round((Date.now() - startedAt) / 1000);
    if (window.GLOW_UI) {
      GLOW_UI.saveResult(result);
      GLOW_UI.track('quiz_complete', {
        seasonId: result.seasonId,
        styleId: result.styleId,
        goal: result.answers.goal,
        durationSec: result.durationSec
      });
    }
    setTimeout(function () { location.href = '/result.html'; }, 550);
  }

  renderSteps();
  update();

  stepsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.quiz-option');
    if (!btn) return;
    select(btn.dataset.value, btn);
  });

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', function () {
    if (index > 0) { index -= 1; update(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'Enter') { e.preventDefault(); goNext(); return; }
    if (e.key === 'ArrowLeft' && index > 0) { index -= 1; update(); return; }
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) {
      var btn = currentStep().querySelectorAll('.quiz-option')[n - 1];
      if (btn) select(btn.dataset.value, btn);
    }
  });

  if (window.GLOW_UI) GLOW_UI.track('quiz_start', { questions: questions.length });
})();
