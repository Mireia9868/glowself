// ===== State =====
const state = {
  token: localStorage.getItem('glowself_token') || null,
  user: null,
  uploadedFiles: { photo: null, ideal: null },
  photoBase64: null,
  idealBase64: null,
  currentReportPhoto: null,
  currentReportPhotoMeta: null,
  currentRating: 4,
  visionAvailable: null,
  credits: 0,
  isBeta: false,
  paymentReady: false,
  currentOrderNo: null,
  pollTimer: null,
  selectedReportType: 'basic',
  selectedPackage: 'basic',
};

// ===== API Helper =====
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  try {
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') throw new Error('网络连接失败，请检查网络');
    throw err;
  }
}

// ===== Label Maps =====
const SKIN_LABELS = { dry:'干性', oily:'油性', combination:'混合性', sensitive:'敏感性', normal:'中性' };
const STYLE_LABELS = { elegant:'优雅知性', fresh:'清新自然', chic:'时尚前卫', classic:'经典复古', casual:'休闲舒适' };

// ===== Auth =====
function switchTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function handleLogin() {
  const login = document.getElementById('login-input').value.trim();
  const password = document.getElementById('login-password').value;
  if (!login || !password) { toast('请填写邮箱/手机号和密码'); return; }
  try {
    toast('登录中...');
    const data = await api('/api/login', { method:'POST', body: JSON.stringify({ login, password }) });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('glowself_token', data.token);
    showApp();
    toast('登录成功，欢迎回来！');
  } catch (err) {
    toast(err.message);
  }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!email && !phone) { toast('请至少填写邮箱或手机号'); return; }
  if (!password || password.length < 6) { toast('密码至少6位'); return; }
  try {
    toast('注册中...');
    const data = await api('/api/register', { method:'POST', body: JSON.stringify({ email, phone, password, name }) });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('glowself_token', data.token);
    showApp();
    toast('注册成功，送你1次免费体验！');
  } catch (err) {
    toast(err.message);
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('glowself_token');
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-input').value = '';
  document.getElementById('login-password').value = '';
  toast('已退出登录');
}

async function checkAuth() {
  if (!state.token) return false;
  try {
    const data = await api('/api/profile');
    state.user = data.user;
    return true;
  } catch {
    localStorage.removeItem('glowself_token');
    state.token = null;
    return false;
  }
}

function showApp() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app').classList.add('active');
  const name = state.user?.name || state.user?.email || state.user?.phone || '用户';
  document.getElementById('user-name').textContent = name;
  document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
  navTo('home');
  loadCredits();
}

// ===== Credits =====
async function loadCredits() {
  try {
    const data = await api('/api/credits');
    state.credits = data.credits;
    state.isBeta = data.isBeta;
    state.paymentReady = data.paymentReady;
    updateCreditsUI();
  } catch {}
}

function updateCreditsUI() {
  const el = document.getElementById('credits-display');
  if (el) {
    if (state.isBeta) {
      el.innerHTML = `<span class="credits-badge beta">内测账号 · 无限次</span>`;
    } else if (state.credits > 0) {
      el.innerHTML = `<span class="credits-badge has">剩余 ${state.credits} 积分</span>`;
    } else {
      el.innerHTML = `<span class="credits-badge none">积分不足</span>`;
    }
  }
}

// ===== Navigation =====
function navTo(screen) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.topbar-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(screen + '-screen').classList.add('active');
  const navLink = document.querySelector(`.topbar-nav a[data-screen="${screen}"]`);
  if (navLink) navLink.classList.add('active');
  window.scrollTo(0, 0);
  if (screen === 'history') loadHistory();
  if (screen === 'feedback') loadFeedback();
  if (screen === 'home') loadCredits();
}

// ===== File Upload =====
function triggerUpload(type) { document.getElementById('input-' + type).click(); }

function handleFileSelect(e, type) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('请上传图片文件'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('图片不能超过10MB'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    showPreview(type, ev.target.result);
    if (type === 'photo') state.photoBase64 = ev.target.result;
    else state.idealBase64 = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function handleDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => {
    showPreview(type, ev.target.result);
    if (type === 'photo') state.photoBase64 = ev.target.result;
    else state.idealBase64 = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function showPreview(type, src) {
  const preview = document.getElementById('preview-' + type);
  const clear = document.getElementById('clear-' + type);
  const dz = document.getElementById('dz-' + type);
  preview.src = src; preview.classList.add('show');
  clear.classList.add('show');
  dz.querySelector('.dropzone-icon').style.display = 'none';
  dz.querySelector('.dropzone-text').style.display = 'none';
  dz.querySelector('.dropzone-hint').style.display = 'none';
}

function clearUpload(type) {
  const preview = document.getElementById('preview-' + type);
  const clear = document.getElementById('clear-' + type);
  const dz = document.getElementById('dz-' + type);
  preview.classList.remove('show'); preview.src = '';
  clear.classList.remove('show');
  dz.querySelector('.dropzone-icon').style.display = '';
  dz.querySelector('.dropzone-text').style.display = '';
  dz.querySelector('.dropzone-hint').style.display = '';
  if (type === 'photo') state.photoBase64 = null;
  else state.idealBase64 = null;
  document.getElementById('input-' + type).value = '';
}

function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('dragover'); }

// ===== Payment =====
async function openPayment(pkg) {
  document.getElementById('payment-modal').classList.add('show');
  // If a specific package is requested, select it
  if (pkg) {
    document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector(`.pkg-card[data-pkg="${pkg}"]`);
    if (card) {
      card.classList.add('active');
      card.querySelector('input').checked = true;
      state.selectedPackage = pkg;
    }
  }
  await createPaymentOrder();
}

async function createPaymentOrder() {
  const pkg = state.selectedPackage || 'basic';
  document.getElementById('qrcode-area').innerHTML = '<div class="payment-loading"><div class="spinner"></div><p>正在生成支付二维码...</p></div>';
  try {
    const data = await api('/api/payment/create', { method: 'POST', body: JSON.stringify({ package: pkg }) });
    state.currentOrderNo = data.orderNo;
    if (data.codeUrl) {
      renderQRCode(data.codeUrl);
      startPolling(data.orderNo);
    } else {
      document.getElementById('qrcode-area').innerHTML = `<div class="payment-pending"><p>支付功能正在开通中</p><p class="sub">${data.message || ''}</p><p class="sub">套餐：${data.packageName} · ¥${data.amount} · ${data.credits}次积分</p></div>`;
    }
  } catch (err) {
    document.getElementById('qrcode-area').innerHTML = '<div class="payment-error"><p>' + err.message + '</p></div>';
  }
}

function closePayment() {
  document.getElementById('payment-modal').classList.remove('show');
  if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
}

function renderQRCode(codeUrl) {
  const canvas = document.createElement('canvas');
  const area = document.getElementById('qrcode-area');
  area.innerHTML = '';
  area.appendChild(canvas);
  if (typeof QRCode !== 'undefined') {
    QRCode.toCanvas(canvas, codeUrl, { width: 200, margin: 1 }, function(err) {
      if (err) {
        area.innerHTML = '<p>二维码生成失败，请刷新重试</p>';
      }
    });
  } else {
    area.innerHTML = '<p style="font-size:14px;color:var(--text-mid);">请使用微信扫码支付<br><code style="word-break:break-all;font-size:11px;">' + codeUrl + '</code></p>';
  }
}

function startPolling(orderNo) {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    try {
      const data = await api('/api/payment/status/' + orderNo);
      if (data.paid) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
        state.credits = data.credits;
        updateCreditsUI();
        closePayment();
        toast('支付成功！积分已到账');
        setTimeout(() => startAnalysis(), 500);
      }
    } catch {}
  }, 2000);
  setTimeout(() => {
    if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
  }, 300000);
}

// ===== Analysis =====
async function startAnalysis() {
  if (!state.photoBase64) { toast('请先上传一张面部照片'); return; }
  const height = document.getElementById('input-height').value;
  const weight = document.getElementById('input-weight').value;
  if (!height || !weight) { toast('请填写身高和体重'); return; }

  // Get selected report type
  const selectedRadio = document.querySelector('input[name="report-type"]:checked');
  state.selectedReportType = selectedRadio ? selectedRadio.value : 'basic';

  if (!state.isBeta) {
    const costs = { basic: 1, deep: 5, vip: 15 };
    const cost = costs[state.selectedReportType] || 1;
    if (state.credits < cost) {
      openPayment(state.selectedReportType);
      return;
    }
  }

  const btn = document.getElementById('btn-analyze');
  btn.disabled = true;
  document.getElementById('loading-text').textContent = '正在分析你的光彩特质';
  document.getElementById('loading-sub').textContent = `AI 正在为你生成${state.selectedReportType === 'vip' ? 'VIP' : state.selectedReportType === 'deep' ? '深度' : ''}报告...`;
  document.getElementById('loading').classList.add('show');

  try {
    const body = {
      photo: state.photoBase64,
      idealPhoto: state.idealBase64 || undefined,
      height: parseFloat(height),
      weight: parseFloat(weight),
      skinType: document.getElementById('input-skin').value,
      stylePreference: document.getElementById('input-style').value,
      reportType: state.selectedReportType,
    };
    const data = await api('/api/analyze', { method:'POST', body: JSON.stringify(body) });
    document.getElementById('loading').classList.remove('show');
    if (data.remainingCredits !== undefined) {
      state.credits = data.remainingCredits;
      updateCreditsUI();
    }
    state.currentReportPhoto = data.report.photo || state.photoBase64;
    state.currentReportPhotoMeta = {
      width: data.report.photoWidth,
      height: data.report.photoHeight,
    };
    renderReport(data.report, {
      photo: state.currentReportPhoto,
      photoMeta: state.currentReportPhotoMeta,
    });
    navTo('report');
    toast('分析完成！已生成你的光彩报告');
  } catch (err) {
    document.getElementById('loading').classList.remove('show');
    if (err.message.includes('积分不足')) {
      openPayment(state.selectedReportType);
    } else {
      toast('分析失败: ' + err.message);
    }
  } finally {
    btn.disabled = false;
  }
}

// ===== Report Rendering =====
// ===== Icons (minimal line icons for suggestions) =====
const ICONS = {
  contour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5 3 9 8 12 5-3 8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="11" r="2.5"/></svg>',
  feature: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  makeup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6l-3 3v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11l-3-3V2"/><path d="M9 2h6"/><path d="M9 16h6"/></svg>',
  hairstyle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0 4 1 6 6 6s6-2 6-6"/><path d="M4 14c0-4 3-8 8-8s8 4 8 8c0 3-2 6-4 7v3H8v-3c-2-1-4-4-4-7z"/></svg>',
  outfit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l-3 5 4 2v11h10V10l4-2-3-5-3 2a3 3 0 0 1-6 0z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>',
  skincare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 8h4M10 12h4M10 16h4"/></svg>',
  posture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v8M8 11l4-2 4 2M9 22l3-7 3 7"/></svg>',
};

// ===== Face Contour SVG (minimal line drawing) =====
// ===== Facial Contour Panel (photo + legend) =====
// Renders the user's actual photo with adaptive sizing on the left, and
// contour analysis legend (脸型 / 下颌线 / 额头 / 眼位 / 五官集中度) on the right.
// Falls back to a graceful placeholder if no photo is available (legacy reports).
function renderContourPanel(contour, photoDataUrl, photoMeta) {
  const items = [
    { label: '脸型', value: contour?.faceShape || '—' },
    { label: '下颌线', value: contour?.jawline || '—' },
    { label: '额头', value: contour?.forehead || '—' },
    { label: '眼位', value: contour?.eyePosition || '—' },
    { label: '五官集中度', value: contour?.featureConcentration || '—' },
  ];

  let photoBlock;
  if (photoDataUrl) {
    // Adaptive sizing: preserve original aspect ratio, capped so it always fits a tidy
    // ~220px-wide column and never exceeds ~360px tall. Uses the real dimensions when
    // available, otherwise lets the browser figure it out via object-fit.
    const ar = photoMeta?.width && photoMeta?.height
      ? `aspect-ratio:${photoMeta.width}/${photoMeta.height}`
      : 'aspect-ratio:3/4';   // sensible default for portraits
    const maxH = photoMeta?.width && photoMeta?.height
      ? `max-height:${Math.min(420, Math.round(photoMeta.height * (220 / photoMeta.width) + 24))}px`
      : 'max-height:380px';
    photoBlock = `
      <div class="contour-photo-frame" style="${ar};${maxH}">
        <img class="contour-photo" src="${photoDataUrl}" alt="面部照片" loading="eager"
          onload="this.dataset.loaded='1'"
          onerror="this.parentElement.classList.add('photo-fallback'); this.remove()"/>
        <div class="contour-photo-overlay">
          <span>${items[0].value}</span>
        </div>
      </div>
    `;
  } else {
    // Fallback for older reports / missing photo: simple placeholder with a note.
    photoBlock = `
      <div class="contour-photo-frame photo-missing">
        <svg viewBox="0 0 220 280" class="contour-svg-placeholder" fill="none" stroke="#D49A9F" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M110 18 C 60 18, 38 70, 38 130 C 38 180, 60 240, 110 260 C 160 240, 182 180, 182 130 C 182 70, 160 18, 110 18 Z"/>
          <path d="M75 95 Q 90 90, 105 95" /><path d="M115 95 Q 130 90, 145 95" />
          <path d="M110 115 L 105 145 Q 110 152, 115 145 Z" />
          <path d="M90 175 Q 110 182, 130 175 Q 110 188, 90 175 Z" />
        </svg>
        <p class="photo-missing-hint">该报告未存储面部照片<br/>（旧版本记录）</p>
      </div>
    `;
  }

  return `
  <div class="contour-card">
    <div class="contour-photo-wrap">
      ${photoBlock}
    </div>
    <div class="contour-legend">
      ${items.map(i => `<div class="legend-row"><div class="legend-label">${i.label}</div><div class="legend-value">${i.value}</div></div>`).join('')}
    </div>
  </div>`;
}

// ===== Dimension Score Bar =====
function renderDimBar(d) {
  const pct = (d.score / 10) * 100;
  return `<div class="dim-row">
    <div class="dim-name">${d.name}</div>
    <div class="dim-bar"><div class="dim-fill" style="width:${pct}%"></div></div>
    <div class="dim-num">${d.score.toFixed(1)}</div>
  </div>
  <div class="dim-comment">${d.comment || ''}</div>`;
}

// ===== Stars Rating =====
function renderStars(stars) {
  const full = Math.floor(stars);
  const half = (stars - full) >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let html = '';
  for (let i = 0; i < full; i++) html += '<span class="star full">★</span>';
  if (half) html += '<span class="star half">★</span>';
  for (let i = 0; i < empty; i++) html += '<span class="star empty">★</span>';
  return html;
}

function renderReport(report, opts = {}) {
  const photoDataUrl = opts.photo || null;
  const photoMeta = opts.photoMeta || (report?.photoWidth && report?.photoHeight
    ? { width: report.photoWidth, height: report.photoHeight } : null);
  const container = document.getElementById('report-content');
  // Backward compat with old schema
  const r = {
    reportNo: report.reportNo || `FA-2026-${String(Math.floor(Math.random()*9000)+1000)}`,
    analysisDate: report.analysisDate || (report.created_at ? report.created_at.slice(0,10) : new Date().toISOString().slice(0,10)),
    basicInfo: report.basicInfo || { gender:'—', ageRange:'—', bmi: report.bmi || '—', height: report.height, weight: report.weight },
    contour: report.contour || {},
    overallScore: report.overallScore ?? report.score ?? 8.0,
    scoreTitle: report.scoreTitle || '风格定位',
    overallComment: report.overallComment || report.scoreDesc || '',
    dimensionScores: report.dimensionScores || [],
    detailedAnalysis: report.detailedAnalysis || {
      symmetry: report.facialAnalysis || '',
      facialProportion: '',
      boneStructure: '',
      skinCondition: report.skinAnalysis || '',
      eyes: '', nose: '', lips: '', aura: report.bodyAnalysis || '',
    },
    strengths: report.strengths || report.keywords || [],
    improvements: report.improvements || [],
    suggestions: report.suggestions || {
      contour:'', feature:'', makeup:'', hairstyle: report.hairAdvice || '',
      outfit: report.stylingAdvice?.join('；') || '', photoAngle:'',
      skincare: report.skinAnalysis || '', posture:'',
    },
    seasonalStyle: report.seasonalStyle || { spring: report.seasonalAdvice||'', summer:'', autumn:'', winter:'' },
    fitnessAdvice: report.fitnessAdvice || '',
    brandRecommendations: report.brandRecommendations || [],
    comparisonAdvice: report.comparisonAdvice || '',
    conclusion: report.conclusion || '',
    growthPotential: report.growthPotential || '',
    rating: report.rating || { stars: Math.min(5, ((report.overallScore ?? report.score ?? 8) / 10) * 5), score: report.overallScore ?? report.score ?? 8 },
    visionAvailable: report.visionAvailable !== false,
    reportType: report.reportType || 'basic',
    // Deep/Vip extra fields
    skincareRoutine: report.skincareRoutine || null,
    makeupTutorial: report.makeupTutorial || null,
    hairstyleSuggestions: report.hairstyleSuggestions || null,
    colorDiagnosis: report.colorDiagnosis || null,
    shoppingList: report.shoppingList || null,
    consultantAdvice: report.consultantAdvice || null,
  };

  const score = parseFloat(r.overallScore) || 8.0;
  const circ = 2 * Math.PI * 70;
  const offset = (circ * (1 - score / 10)).toFixed(1);

  const dimsHtml = r.dimensionScores.map(renderDimBar).join('');

  // 8 提升建议
  const sugList = [
    { key:'contour', icon: ICONS.contour, title:'轮廓优化', text: r.suggestions.contour },
    { key:'feature', icon: ICONS.feature, title:'五官精修', text: r.suggestions.feature },
    { key:'makeup', icon: ICONS.makeup, title:'妆容方向', text: r.suggestions.makeup },
    { key:'hairstyle', icon: ICONS.hairstyle, title:'发型建议', text: r.suggestions.hairstyle },
    { key:'outfit', icon: ICONS.outfit, title:'穿搭风格', text: r.suggestions.outfit },
    { key:'photo', icon: ICONS.camera, title:'拍照建议', text: r.suggestions.photoAngle },
    { key:'skincare', icon: ICONS.skincare, title:'皮肤管理', text: r.suggestions.skincare },
    { key:'posture', icon: ICONS.posture, title:'仪态建议', text: r.suggestions.posture },
  ];

  const suggestionCards = sugList.map(s => `
    <div class="sug-card">
      <div class="sug-icon">${s.icon}</div>
      <div class="sug-title">${s.title}</div>
      <div class="sug-text">${s.text || '—'}</div>
    </div>
  `).join('');

  // Strengths / Improvements lists
  const strengthsHtml = (r.strengths || []).map(s => `<li><span class="dot good">✓</span><span>${s}</span></li>`).join('');
  const improvementsHtml = (r.improvements || []).map(s => `<li><span class="dot warn">○</span><span>${s}</span></li>`).join('');

  // Seasonal cards
  const seasons = [
    { key:'spring', name:'春季', icon:'🌸' },
    { key:'summer', name:'夏季', icon:'☀️' },
    { key:'autumn', name:'秋季', icon:'🍂' },
    { key:'winter', name:'冬季', icon:'❄️' },
  ];
  const seasonalHtml = seasons.map(s => `
    <div class="season-card">
      <div class="season-head"><span class="season-ico">${s.icon}</span><span>${s.name}</span></div>
      <div class="season-text">${r.seasonalStyle[s.key] || '—'}</div>
    </div>
  `).join('');

  // Brand cards
  const brandHtml = r.brandRecommendations.map(b => `
    <div class="brand-card">
      <div class="b-name">${b.name||''}</div>
      <div class="b-desc">${b.desc||''}</div>
      <div class="b-price">${b.priceRange||''}</div>
    </div>
  `).join('');

  // Detailed analysis cards
  const detailList = [
    { icon:'◐', title:'对称性', text: r.detailedAnalysis.symmetry },
    { icon:'▦', title:'面部比例', text: r.detailedAnalysis.facialProportion },
    { icon:'◇', title:'骨骼结构', text: r.detailedAnalysis.boneStructure },
    { icon:'✦', title:'皮肤状态', text: r.detailedAnalysis.skinCondition },
    { icon:'◉', title:'眼睛', text: r.detailedAnalysis.eyes },
    { icon:'△', title:'鼻子', text: r.detailedAnalysis.nose },
    { icon:'◡', title:'嘴唇', text: r.detailedAnalysis.lips },
    { icon:'✧', title:'气质印象', text: r.detailedAnalysis.aura },
  ];
  const detailHtml = detailList.map(d => `
    <div class="detail-card">
      <div class="detail-ico">${d.icon}</div>
      <div class="detail-title">${d.title}</div>
      <div class="detail-text">${d.text || '—'}</div>
    </div>
  `).join('');

  const visionNotice = r.visionAvailable === false
    ? '<div class="vision-notice">视觉分析暂不可用，以下分析基于通用美学原则</div>' : '';

  const comparisonHtml = r.comparisonAdvice
    ? `<section class="block">
        <div class="block-head"><span class="block-num">09</span><h3>理想形象对比建议</h3></div>
        <div class="block-body"><p class="prose">${r.comparisonAdvice}</p></div>
      </section>` : '';

  container.innerHTML = `
    <!-- Header -->
    <div class="rp-header">
      <div>
        <h1 class="rp-title">面部美学分析报告</h1>
        <div class="rp-sub">FACE AESTHETIC ANALYSIS REPORT</div>
      </div>
      <div class="rp-meta">
        <div class="rp-no">报告编号 · ${r.reportNo}</div>
        <div class="rp-date">分析日期 · ${r.analysisDate}</div>
        <div class="rp-type">${r.reportType === 'vip' ? 'VIP报告' : r.reportType === 'deep' ? '深度报告' : '基础报告'}</div>
      </div>
    </div>

    <!-- Basic info -->
    <div class="rp-info-row">
      <div class="rp-info-cell"><span class="lbl">性别</span><span class="val">${r.basicInfo.gender}</span></div>
      <div class="rp-info-cell"><span class="lbl">年龄</span><span class="val">${r.basicInfo.ageRange}</span></div>
      <div class="rp-info-cell"><span class="lbl">身高/体重</span><span class="val">${r.basicInfo.height||'—'}cm / ${r.basicInfo.weight||'—'}kg</span></div>
      <div class="rp-info-cell"><span class="lbl">BMI</span><span class="val">${r.basicInfo.bmi || '—'}</span></div>
    </div>
    ${visionNotice}

    <!-- 01 轮廓 + 总体评分 -->
    <section class="block">
      <div class="block-head"><span class="block-num">01</span><h3>面部轮廓</h3></div>
      <div class="block-body">
        <div class="contour-layout">
          ${renderContourPanel(r.contour, photoDataUrl, photoMeta)}
          <div class="contour-side">
            <div class="overall-score">
              <svg viewBox="0 0 160 160" class="overall-ring">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F0EBE8" stroke-width="8"/>
                <circle cx="80" cy="80" r="70" fill="none" stroke="#D4A574" stroke-width="8"
                  stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
                  transform="rotate(-90 80 80)"/>
              </svg>
              <div class="overall-center">
                <div class="overall-num">${score.toFixed(1)}</div>
                <div class="overall-of">/ 10</div>
              </div>
            </div>
            <div class="overall-tags">${(r.scoreTitle||'').split('|').map(t => t.trim()).filter(Boolean).map(t => `<span class="tag">${t}</span>`).join('')}</div>
            <p class="overall-comment">${r.overallComment}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 维度评分 -->
    <section class="block">
      <div class="block-head"><span class="block-num">02</span><h3>维度评分</h3></div>
      <div class="block-body">
        <div class="dim-list">${dimsHtml}</div>
      </div>
    </section>

    <!-- 03 详细分析 -->
    <section class="block">
      <div class="block-head"><span class="block-num">03</span><h3>详细分析</h3></div>
      <div class="block-body">
        <div class="detail-grid">${detailHtml}</div>
      </div>
    </section>

    <!-- 04 优势与可优化 -->
    <section class="block">
      <div class="block-head"><span class="block-num">04</span><h3>优势亮点 & 可优化空间</h3></div>
      <div class="block-body">
        <div class="dual-col">
          <div class="dual-card strengths">
            <h4>优势亮点</h4>
            <ul>${strengthsHtml}</ul>
          </div>
          <div class="dual-card improvements">
            <h4>可优化空间</h4>
            <ul>${improvementsHtml}</ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 05 提升建议 -->
    <section class="block">
      <div class="block-head"><span class="block-num">05</span><h3>提升建议</h3></div>
      <div class="block-body">
        <div class="sug-grid">${suggestionCards}</div>
      </div>
    </section>

    <!-- 06 季节穿搭 -->
    <section class="block">
      <div class="block-head"><span class="block-num">06</span><h3>季节穿搭</h3></div>
      <div class="block-body">
        <div class="season-grid">${seasonalHtml}</div>
      </div>
    </section>

    ${fitnessHtml(r.fitnessAdvice)}
    ${brandHtml2(r.brandRecommendations, brandHtml)}
    ${renderDeepSections(r)}
    ${renderVipSections(r)}
    ${comparisonHtml}

    <!-- 07 结论总结 -->
    <section class="block">
      <div class="block-head"><span class="block-num">07</span><h3>结论总结</h3></div>
      <div class="block-body">
        <p class="conclusion">${r.conclusion || ''}</p>
        ${r.growthPotential ? `<div class="potential">可达到的综合评分上限：<strong>${r.growthPotential}</strong></div>` : ''}
      </div>
    </section>

    <!-- 08 综合评价 -->
    <section class="block final-rating">
      <div class="final-row">
        <div>
          <div class="final-label">综合评价</div>
          <div class="final-stars">${renderStars(r.rating.stars)}</div>
        </div>
        <div class="final-score">
          <span class="final-num">${r.rating.score.toFixed(1)}</span>
          <span class="final-of">/ 10</span>
        </div>
      </div>
    </section>

    <div class="report-actions">
      <button class="btn-action ghost" onclick="navTo('history')">查看历史</button>
      <button class="btn-action ghost" onclick="navTo('home')">重新分析</button>
    </div>
  `;
}

function fitnessHtml(text) {
  if (!text) return '';
  return `<section class="block">
    <div class="block-head"><span class="block-num">·</span><h3>健身与体态</h3></div>
    <div class="block-body"><p class="prose">${text}</p></div>
  </section>`;
}

function brandHtml2(list, html) {
  if (!list || list.length === 0) return '';
  return `<section class="block">
    <div class="block-head"><span class="block-num">·</span><h3>品牌推荐</h3></div>
    <div class="block-body"><div class="brand-grid">${html}</div></div>
  </section>`;
}

// ===== Deep/Vip report extra sections =====
function renderDeepSections(r) {
  if (!r.skincareRoutine && !r.makeupTutorial && !r.hairstyleSuggestions && !r.colorDiagnosis) return '';
  let html = '';

  // Skincare routine
  if (r.skincareRoutine) {
    const sk = r.skincareRoutine;
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>个性化护肤方案</h3><span class="rt-badge deep">深度</span></div>
      <div class="block-body">
        <div class="deep-grid">
          <div class="deep-card"><div class="deep-title">晨间护肤</div><p class="deep-text">${sk.morning || '—'}</p></div>
          <div class="deep-card"><div class="deep-title">晚间护肤</div><p class="deep-text">${sk.evening || '—'}</p></div>
          <div class="deep-card"><div class="deep-title">每周护理</div><p class="deep-text">${sk.weekly || '—'}</p></div>
        </div>
      </div>
    </section>`;
  }

  // Makeup tutorial
  if (r.makeupTutorial) {
    const mk = r.makeupTutorial;
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>妆容教程</h3><span class="rt-badge deep">深度</span></div>
      <div class="block-body">
        <div class="deep-grid">
          <div class="deep-card"><div class="deep-title">底妆方案</div><p class="deep-text">${mk.base || '—'}</p></div>
          <div class="deep-card"><div class="deep-title">眼妆方案</div><p class="deep-text">${mk.eyes || '—'}</p></div>
          <div class="deep-card"><div class="deep-title">唇妆方案</div><p class="deep-text">${mk.lips || '—'}</p></div>
        </div>
        <div class="deep-steps">${mk.steps || '—'}</div>
      </div>
    </section>`;
  }

  // Hairstyle suggestions
  if (r.hairstyleSuggestions && r.hairstyleSuggestions.length) {
    const hairHtml = r.hairstyleSuggestions.map(h => `
      <div class="deep-card">
        <div class="deep-title">${h.name || '—'}</div>
        <p class="deep-text">${h.desc || '—'}</p>
        <span class="deep-tag">${h.faceShapeMatch || ''}</span>
      </div>
    `).join('');
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>发型建议</h3><span class="rt-badge deep">深度</span></div>
      <div class="block-body"><div class="deep-grid">${hairHtml}</div></div>
    </section>`;
  }

  // Color diagnosis
  if (r.colorDiagnosis) {
    const cd = r.colorDiagnosis;
    const bestColors = (cd.bestColors || []).map(c => `<span class="color-chip best">${c}</span>`).join('');
    const avoidColors = (cd.avoidColors || []).map(c => `<span class="color-chip avoid">${c}</span>`).join('');
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>个人色彩诊断</h3><span class="rt-badge deep">深度</span></div>
      <div class="block-body">
        <div class="color-diagnosis">
          <div class="color-season">色彩季型：<strong>${cd.season || '—'}</strong></div>
          <div class="color-palette">
            <div class="palette-group"><span class="palette-label">推荐色</span><div class="chips">${bestColors}</div></div>
            <div class="palette-group"><span class="palette-label">不宜色</span><div class="chips">${avoidColors}</div></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  return html;
}

function renderVipSections(r) {
  if (!r.shoppingList && !r.consultantAdvice) return '';
  let html = '';

  // Shopping list
  if (r.shoppingList && r.shoppingList.length) {
    const shopHtml = r.shoppingList.map(s => `
      <div class="shop-card">
        <span class="shop-cat">${s.category || '—'}</span>
        <div class="shop-brand">${s.brand || '—'}</div>
        <div class="shop-product">${s.product || '—'}</div>
        <div class="shop-price">${s.priceRange || '—'}</div>
        <p class="shop-reason">${s.reason || '—'}</p>
      </div>
    `).join('');
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>定制购物清单</h3><span class="rt-badge vip">VIP</span></div>
      <div class="block-body"><div class="shop-grid">${shopHtml}</div></div>
    </section>`;
  }

  // Consultant advice
  if (r.consultantAdvice) {
    html += `<section class="block">
      <div class="block-head"><span class="block-num">·</span><h3>顾问咨询建议</h3><span class="rt-badge vip">VIP</span></div>
      <div class="block-body"><p class="prose">${r.consultantAdvice}</p></div>
    </section>`;
  }

  return html;
}

// ===== History =====
async function loadHistory() {
  const container = document.getElementById('history-content');
  try {
    const data = await api('/api/history');
    if (!data.reports || data.reports.length === 0) {
      container.innerHTML = `<div class="empty-state"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><h3>暂无分析记录</h3><p>完成你的第一次光彩分析，开始记录成长轨迹</p></div>`;
      return;
    }
    renderHistory(data.reports);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>加载失败: ${err.message}</p></div>`;
  }
}

function renderHistory(reports) {
  const container = document.getElementById('history-content');
  const sorted = [...reports].reverse();
  const latest = reports[0];
  const first = sorted[0];
  const improvement = (latest.score || 0) - (first.score || 0);
  const days = Math.max(1, Math.round((new Date(latest.created_at) - new Date(first.created_at)) / 86400000));

  const points = sorted.map((r, i) => {
    const x = 50 + (i / Math.max(1, sorted.length - 1)) * 600;
    const y = 180 - ((r.score - 70) / 30) * 140;
    return { x, y: Math.max(20, Math.min(180, y)), score: r.score, date: r.created_at };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length-1].x.toFixed(0)} 200 L ${points[0].x.toFixed(0)} 200 Z`;

  let chartHtml = '';
  if (points.length >= 2) {
    chartHtml = `
    <div class="trend-card">
      <h3>光彩指数趋势</h3>
      <svg class="trend-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
        <line x1="0" y1="40" x2="700" y2="40" stroke="#F0EBE8" stroke-dasharray="4"/>
        <line x1="0" y1="100" x2="700" y2="100" stroke="#F0EBE8" stroke-dasharray="4"/>
        <line x1="0" y1="160" x2="700" y2="160" stroke="#F0EBE8" stroke-dasharray="4"/>
        <path d="${areaPath}" fill="url(#ag)" opacity="0.12"/>
        <path d="${linePath}" fill="none" stroke="#D4A574" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map((p, i) => `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${i === points.length-1 ? 6 : 5}" fill="${i === points.length-1 ? '#E8B4B8' : '#D4A574'}" ${i === points.length-1 ? 'stroke="#D4A574" stroke-width="2"' : ''}/>`).join('')}
        ${points.map(p => `<text x="${p.x.toFixed(0)}" y="${(p.y-12).toFixed(0)}" text-anchor="middle" font-size="11" fill="#D4A574" font-weight="600">${p.score}</text>`).join('')}
        <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4A574"/><stop offset="100%" stop-color="#E8B4B8"/></linearGradient></defs>
      </svg>
      <div class="trend-stats">
        <div class="trend-stat"><div class="stat-value">${latest.score || 0}</div><div class="stat-label">最新光彩指数</div></div>
        <div class="trend-stat"><div class="stat-value">${improvement >= 0 ? '+' : ''}${improvement}</div><div class="stat-label">较首次变化</div></div>
        <div class="trend-stat"><div class="stat-value">${reports.length}</div><div class="stat-label">累计分析次数</div></div>
        <div class="trend-stat"><div class="stat-value">${days}天</div><div class="stat-label">坚持记录</div></div>
      </div>
    </div>`;
  }

  const listHtml = reports.map((r, idx) => {
    const reportData = typeof r.report_data === 'string' ? JSON.parse(r.report_data) : r.report_data;
    const kws = Array.isArray(r.keywords) ? r.keywords : (reportData?.keywords || []);
    const title = reportData?.scoreTitle || '光彩分析';
    const tagsHtml = kws.slice(0, 3).map(k => `<span>${k}</span>`).join('');
    const emoji = ['✨', '🌸', '🌿', '💎', '🌙'][idx % 5];
    const rtLabel = r.report_type === 'vip' ? 'VIP' : r.report_type === 'deep' ? '深度' : '基础';
    const rtClass = r.report_type === 'vip' ? 'vip' : r.report_type === 'deep' ? 'deep' : 'basic';
    return `
    <div class="history-item" onclick="viewReport(${r.id})">
      <div class="history-thumb">${emoji}</div>
      <div class="history-info">
        <div class="h-date">${formatDate(r.created_at)} <span class="h-rt-badge ${rtClass}">${rtLabel}</span></div>
        <div class="h-title">${title}</div>
        <div class="h-tags">${tagsHtml}</div>
      </div>
      <div class="history-score"><div class="h-score">${r.score || 0}</div><div class="h-score-label">光彩指数</div></div>
    </div>`;
  }).join('');

  container.innerHTML = chartHtml + `<div class="history-list">${listHtml}</div>`;
}

async function viewReport(id) {
  try {
    const data = await api(`/api/report/${id}`);
    const reportObj = data.report.report_data || data.report;
    const photoDataUrl = data.report.photo_path || null;
    const photoMeta = (data.report.photo_width && data.report.photo_height)
      ? { width: data.report.photo_width, height: data.report.photo_height }
      : null;
    state.currentReportPhoto = photoDataUrl;
    state.currentReportPhotoMeta = photoMeta;
    renderReport(reportObj, { photo: photoDataUrl, photoMeta });
    navTo('report');
    toast('已加载历史报告');
  } catch (err) {
    toast('加载报告失败: ' + err.message);
  }
}

// ===== Feedback =====
async function loadFeedback() {
  const container = document.getElementById('feedback-list-content');
  try {
    const data = await api('/api/feedback');
    if (!data.feedback || data.feedback.length === 0) {
      container.innerHTML = '<p style="color:var(--text-light);font-size:14px;text-align:center;padding:20px;">暂无反馈记录</p>';
      return;
    }
    const html = data.feedback.map(f => {
      const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
      const statusClass = f.status === 'replied' ? 'replied' : 'pending';
      const statusText = f.status === 'replied' ? '已回复' : '待回复';
      return `<div class="feedback-item">
        <div class="f-header"><span class="f-rating">${stars}</span><span class="f-date">${formatDate(f.created_at)}</span></div>
        <p class="f-content">${f.content}</p>
        <span class="f-status ${statusClass}">${statusText}</span>
      </div>`;
    }).join('');
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--text-light);font-size:14px;">加载失败: ${err.message}</p>`;
  }
}

async function submitFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  if (!text) { toast('请输入反馈内容'); return; }
  try {
    await api('/api/feedback', { method:'POST', body: JSON.stringify({ rating: state.currentRating, content: text }) });
    toast('感谢你的反馈！我们已收到');
    document.getElementById('feedback-text').value = '';
    loadFeedback();
  } catch (err) {
    toast('提交失败: ' + err.message);
  }
}

// ===== Rating =====
function setRating(val) {
  state.currentRating = val;
  document.querySelectorAll('#rating-row .star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
  });
}

// ===== Utility =====
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

// ===== Init =====
async function init() {
  // Report type selector
  document.querySelectorAll('.report-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.report-type-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input').checked = true;
      state.selectedReportType = card.dataset.type;
    });
  });

  // Payment package selector
  document.querySelectorAll('.pkg-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input').checked = true;
      state.selectedPackage = card.dataset.pkg;
      createPaymentOrder(); // regenerate order for new package
    });
  });

  const authed = await checkAuth();
  if (authed) {
    showApp();
  } else {
    document.getElementById('login-screen').classList.add('active');
  }
  try {
    const vs = await api('/api/vision-status');
    state.visionAvailable = vs.available;
    if (!vs.available) {
      const note = document.getElementById('analyze-note');
      if (note) note.textContent = '注：当前视觉分析暂不可用，将基于基本信息生成报告';
    }
  } catch {}
}

init();
