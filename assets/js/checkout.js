(function () {
  var UI = window.GLOW_UI;
  var form = document.getElementById('pay-form');
  var success = document.getElementById('pay-success');
  var errorEl = document.getElementById('pay-error');
  var submit = document.getElementById('pay-submit');
  if (!form || !UI) return;

  UI.track('checkout_view', { plan: 'plus_month_2990' });

  var savedEmail = '';
  try { savedEmail = localStorage.getItem('glow_email_v1') || ''; } catch (e) {}
  if (savedEmail) document.getElementById('pay-email').value = savedEmail;

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    var email = document.getElementById('pay-email').value.trim();
    var orderNo = document.getElementById('pay-order').value.trim();
    var confirmed = document.getElementById('pay-confirm').checked;

    if (!email || email.indexOf('@') < 1) return showError('请填一个能收到通知的邮箱。');
    if (orderNo.length < 6) return showError('请填支付宝订单号后 6 位（至少 6 位）。');
    if (!confirmed) return showError('请先确认你已经完成支付。');

    submit.disabled = true;
    submit.textContent = '正在提交…';

    var result = UI.getResult ? UI.getResult() : null;
    var payload = {
      intent: 'paid_plus',
      email: email,
      source: 'checkout',
      message: '首月 ¥29.90 · 支付宝订单尾号 ' + orderNo,
      result: result ? { seasonId: result.seasonId, styleId: result.styleId, goal: result.answers && result.answers.goal } : null
    };

    UI.postLead(payload).then(function (res) {
      try {
        localStorage.setItem('glow_paid_pending', JSON.stringify({ email: email, orderNo: orderNo, at: Date.now() }));
        localStorage.setItem('glow_email_v1', email);
      } catch (e) {}
      UI.track('checkout_submitted', { plan: 'plus_month_2990', order_tail: String(orderNo).slice(-4) });
      document.getElementById('success-email').textContent = email;
      document.getElementById('success-id').textContent = (res && res.id) || '—';
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function () {
      submit.disabled = false;
      submit.textContent = '提交，等待开通';
      showError('提交没有成功，请稍后再试，或直接发邮件到 hello@glowself.cn。');
    });
  });
})();
