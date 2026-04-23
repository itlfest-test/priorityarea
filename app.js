// ═══════════════════════════════════════════════════════
// State & 履歴管理
// ═══════════════════════════════════════════════════════

let S = {
  screen:     'welcome',
  lineId:     null,
  digits:     [],
  result:     null,
  visualCars: null,
  visualPath: [],
  visualNode: null,
};

const histStack = [];
const fwdStack  = [];

function navigate(patch) {
  histStack.push({ ...S });
  fwdStack.length = 0;
  S = { ...S, ...patch };
  render();
}

function goBack() {
  if (!histStack.length) return;
  fwdStack.push({ ...S });
  S = histStack.pop();
  render();
}

function goForward() {
  if (!fwdStack.length) return;
  histStack.push({ ...S });
  S = fwdStack.pop();
  render();
}

function goTop() {
  if (S.screen === 'welcome') return;
  histStack.push({ ...S });
  fwdStack.length = 0;
  S = { screen:'welcome', lineId:null, digits:[], result:null, visualCars:null, visualPath:[], visualNode:null };
  render();
}

// ═══════════════════════════════════════════════════════
// 車番判定
// ═══════════════════════════════════════════════════════

function getById(id) { return TRAINS.find(t => t.id === id); }
function getCands(ds) { return TRAINS.filter(t => !t.visualOnly && t.partial(ds)); }
function getMatch(ds) { return TRAINS.find(t => !t.visualOnly && t.match(ds)) || null; }

// 5桁目の入力が必要かどうか
// 4始まり: 3桁目1のQシート系(4桁目入力済)、または40050系(4桁目5,6入力済)
function needs5th(ds) {
  if (ds.length !== 4) return false;
  if (ds[0] !== '4') return false;
  // 3桁目1 → 4000番台Qシートあり/なし系 → 5桁目Y必要
  if (ds[2] === '1') return true;
  // 2桁目0かつ4桁目5,6 → 40050系 → 5桁目必要
  if (ds[1] === '0' && /[56]/.test(ds[3])) return true;
  return false;
}

function pushDigit(ch) {
  if (S.digits.length >= 5) return;
  const next = [...S.digits, ch];
  if (getCands(next).length === 0) return;
  const matched = getMatch(next);
  const cands   = getCands(next);
  if (matched) {
    navigate({ digits: next, result: matched, screen: 'result' });
  } else if (cands.length === 1 && !needs5th(next)) {
    navigate({ digits: next, result: cands[0], screen: 'result' });
  } else {
    navigate({ digits: next });
  }
}

function delDigit() {
  if (!S.digits.length) return;
  navigate({ digits: S.digits.slice(0, -1) });
}

// ═══════════════════════════════════════════════════════
// ステップバー
// ═══════════════════════════════════════════════════════

function renderStepBar() {
  const map = { welcome:0, line:1, help:1, method:2, digit:3, visual:3, result:3, marunouchi:3 };
  const active = map[S.screen] ?? 0;
  document.getElementById('stepBar').innerHTML =
    [1,2,3].map(i =>
      `<div class="step-seg${i<active?' done':i===active?' active':''}"></div>`
    ).join('');
}

// ═══════════════════════════════════════════════════════
// 各画面HTML
// ═══════════════════════════════════════════════════════

function renderWelcome() {
  return `<div class="card welcome-card">
    <p style="font-size:15px;line-height:1.8">
      このサイトでは、中央大学各キャンパスにアクセスする際に使う一部路線の、優先席および車いすスペースの検索ができます。
    </p>
    <p style="font-size:14px;line-height:1.8;color:var(--text2);margin-top:12px">
      次に来る電車の情報を知りたい場合、<a href="https://loo-ool.com/rail/" target="_blank" rel="noopener" class="link">このサイト</a>と時刻表を見比べ、来る車両を検索してください。詳しいやり方は次の画面の「？」ボタンからご確認ください。
    </p>
    <p style="font-size:12px;line-height:1.7;color:var(--text3);margin-top:10px">
      ※リンク先のページは有志により一般公開されている運用情報サイト（loo-ool）です。
    </p>
    <button class="primary-btn" data-action="toLine" style="margin-top:20px">路線を選ぶ →</button>
  </div>`;
}

function renderLine() {
  const lines = [
    { id:'fukutoshin', label:'副都心線・有楽町線・東急東横線 およびその直通先', goto:'method' },
    { id:'marunouchi', label:'東京メトロ丸ノ内線', goto:'marunouchi' },
    { id:'namboku',    label:'南北線・都営三田線・東急目黒線 およびその直通先', muted:true },
    { id:'shinjuku',   label:'都営新宿線・京王線', muted:true },
    { id:'jr',         label:'JR中央・総武線各駅停車', muted:true },
    { id:'other',      label:'その他', url:'https://line.me/R/ti/p/@513fripz?oat_content=url&ts=04131148' },
  ];
  const btns = lines.map((l, i) => {
    if (l.muted) return `<button class="opt-btn muted" disabled><span class="num-badge">${i+1}</span>${l.label}</button>`;
    if (l.url)   return `<a href="${l.url}" target="_blank" rel="noopener" class="opt-btn"><span class="num-badge">${i+1}</span>${l.label}</a>`;
    return `<button class="opt-btn" data-action="selectLine" data-goto="${l.goto}" data-line="${l.id}"><span class="num-badge">${i+1}</span>${l.label}</button>`;
  }).join('');
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:13px;color:var(--text2)">路線を選んでください</span>
      <button class="icon-btn" data-action="toHelp" title="使い方">？</button>
    </div>
    <div class="card"><p class="sec-label">ご乗車予定の路線</p>${btns}</div>
    <div class="notice">③〜⑤は現在未対応です。今後更新予定です。その他の路線は公式LINEから追加のご要望をお送りください。複数の方からご要望をいただいた場合追加します。</div>`;
}

function renderHelp() {
  return `<div class="card">
    <p style="font-size:14px;line-height:1.8;margin-bottom:12px">
      Topでご紹介した外部サイト（<a href="https://loo-ool.com/rail/" target="_blank" rel="noopener" class="link">loo-ool</a>）の使い方をご案内します。
    </p>
    <ol style="font-size:14px;line-height:1.9;padding-left:1.4em">
      <li>下までスクロールして「路線一覧」からこれから利用予定の路線を選択してください。</li>
      <li>一番上の「時刻表」を押し、利用する駅から最も近い駅を選んでください。</li>
      <li>時刻表を基に、乗車する駅を何時何分に出発する電車かを調べ、行き先の下あたりに書いてある<strong>4桁〜5桁の数字（車号）</strong>を覚えてください。</li>
      <li>このサイトに戻り、路線を選択し、「車いす・優先席を検索する」ボタンから手順③で覚えた番号を入力してください。</li>
    </ol>
    <div class="photo-example">
      <p style="font-size:12px;color:var(--text3);margin-bottom:8px">車号の例（車両側面に記載）</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="photo-card">
          <img src="img/photo_10031.jpg" alt="10000系 車号10031" style="width:100%;border-radius:6px;display:block">
          <p style="font-size:12px;color:var(--text2);margin-top:5px;text-align:center">例：10031（東京メトロ10000系）</p>
        </div>
        <div class="photo-card">
          <img src="img/photo_4113.jpg" alt="5050系4000番台 車号4113" style="width:100%;border-radius:6px;display:block">
          <p style="font-size:12px;color:var(--text2);margin-top:5px;text-align:center">例：4113（東急5050系4000番台）</p>
        </div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text3);margin-top:12px;line-height:1.7">
      ※一部サイト上での表記と実際の番号が異なります。わからない場合は電車が到着してからご確認ください。
    </p>
  </div>`;
}

function renderMethod() {
  return `<div class="card">
    <p class="sec-label">検索方法を選んでください</p>
    <button class="opt-btn" data-action="toDigit"><span class="num-badge">①</span>車両側面にある数字を入力する</button>
    <button class="opt-btn" data-action="toVisual"><span class="num-badge">②</span>車両の見た目から検索する</button>
  </div>`;
}

function renderDigit() {
  const cands   = getCands(S.digits);
  const allKeys = ['1','2','3','4','5','6','7','8','9','0','Y'];
  const valid   = allKeys.filter(k => getCands([...S.digits, k]).length > 0);
  const show5th = needs5th(S.digits);

  let boxes = '';
  for (let i = 0; i < 5; i++) {
    let cls = 'digit-box', v = '';
    if (i < S.digits.length) { cls += ' filled'; v = S.digits[i]; }
    else if (i === S.digits.length) cls += ' active';
    // 5桁目はYのみ
    const lbl = i === 4 ? 'Y' : `${i+1}桁目`;
    boxes += `<div class="${cls}">${v}<span class="digit-label">${lbl}</span></div>`;
  }

  const rows = [['1','2','3','4','5','6'],['7','8','9','0','Y','⌫']];
  const keys = rows.map(row => row.map(k =>
    k === '⌫'
      ? `<button class="key-btn del" data-action="delDigit">⌫</button>`
      : `<button class="key-btn${valid.includes(k)?'':' disabled'}" data-action="pushDigit" data-key="${k}">${k}</button>`
  ).join('')).join('');

  const hint = show5th
    ? `<p style="font-size:14px;color:#BA7517;margin-top:8px;line-height:1.6">この車両番号は5桁です。5桁目に「Y」を入力してください。</p>`
    : S.digits.length
    ? `<p style="font-size:13px;color:var(--text3);margin-top:6px">候補 ${cands.length}件</p>`
    : `<p style="font-size:14px;color:var(--text3);margin-top:6px">車両側面の番号を入力してください</p>`;

  return `<div class="card">
    <p class="sec-label" style="font-size:14px">車番を1桁ずつ入力</p>
    <div class="digit-row">${boxes}</div>
    <div class="keypad">${keys}</div>
    ${hint}
  </div>`;
}

function renderVisual() {
  if (!S.visualCars) {
    return `<div class="card">
      <p class="sec-label" style="font-size:14px">両数を選んでください</p>
      <button class="opt-btn" data-action="setVcars" data-cars="8">8両編成</button>
      <button class="opt-btn" data-action="setVcars" data-cars="10">10両編成</button>
    </div>`;
  }
  const node = S.visualNode;
  const opts = node.opts.map(opt => {
    const dot = 'color' in opt
      ? `<span class="color-dot" style="background:${opt.color||'var(--border2)'}"></span>` : '';
    return `<button class="opt-btn" data-action="selectVopt" data-vopt='${JSON.stringify(opt)}'>${dot}${opt.label}</button>`;
  }).join('');
  return `<div class="card"><p class="sec-label" style="font-size:14px">${node.q}</p>${opts}</div>`;
}

function renderResultCard(train) {
  const wcText  = train.wheelchair_text || '調査中';
  const priText = train.priority_text   || '調査中';
  const diag    = buildDiagram(train);
  const dirRow  = buildDirectionRow(train);
  const sides   = buildSideLabel(train.doors);
  const legend  = buildLegend(train);
  const svcNote = train.service_note
    ? `<div class="service-note">${train.service_note}</div>` : '';
  const diagNote = train.diagram_note
    ? `<p style="font-size:12px;color:var(--text2);margin-top:6px">${train.diagram_note}</p>` : '';

  return `<div class="result-card">
    <p class="train-name">${train.company} ${train.name}${train.note?`<span class="badge">${train.note}</span>`:''}</p>
    <p class="train-meta">全${train.cars}両編成</p>
    ${svcNote}
    <hr class="divider">
    ${dirRow}
    ${sides}
    <div class="diagram-wrap">${diag}</div>
    ${diagNote}
    ${legend}
    <hr class="divider">
    <div class="info-block">
      <p class="info-label">車いすスペース</p>
      <div class="info-value${wcText==='調査中'?' pending':''}">${wcText.replace(/\n/g,'<br>')}</div>
    </div>
    <div class="info-block">
      <p class="info-label">優先席</p>
      <div class="info-value${priText==='調査中'?' pending':''}">${priText}</div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════
// メイン描画
// ═══════════════════════════════════════════════════════

function render() {
  renderStepBar();
  const el = document.getElementById('content');

  if      (S.screen==='welcome')     el.innerHTML = renderWelcome();
  else if (S.screen==='line')        el.innerHTML = renderLine();
  else if (S.screen==='help')        el.innerHTML = renderHelp();
  else if (S.screen==='method')      el.innerHTML = renderMethod();
  else if (S.screen==='digit')       el.innerHTML = renderDigit();
  else if (S.screen==='visual')      el.innerHTML = renderVisual();
  else if (S.screen==='marunouchi') el.innerHTML = renderResultCard(MARUNOUCHI);
  else if (S.screen==='result')      el.innerHTML = renderResultCard(S.result);

  // ナビボタン表示制御
  const bk = document.getElementById('navBack');
  const fw = document.getElementById('navFwd');
  const tp = document.getElementById('navTop');
  if (bk) bk.style.visibility = histStack.length ? 'visible' : 'hidden';
  if (fw) fw.style.visibility  = fwdStack.length  ? 'visible' : 'hidden';
  if (tp) tp.style.visibility  = S.screen !== 'welcome' ? 'visible' : 'hidden';

  bindEvents();
}

// ═══════════════════════════════════════════════════════
// イベントバインド
// ═══════════════════════════════════════════════════════

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const a = el.dataset.action;
      if      (a==='toLine')     navigate({ screen:'line' });
      else if (a==='toHelp')     navigate({ screen:'help' });
      else if (a==='toDigit')    navigate({ screen:'digit', digits:[] });
      else if (a==='toVisual')   navigate({ screen:'visual', visualCars:null, visualPath:[], visualNode:null });
      else if (a==='selectLine') navigate({ screen:el.dataset.goto, lineId:el.dataset.line });
      else if (a==='pushDigit')  pushDigit(el.dataset.key);
      else if (a==='delDigit')   delDigit();
      else if (a==='setVcars') {
        const c = parseInt(el.dataset.cars);
        navigate({ visualCars:c, visualNode:c===8?VISUAL_8:VISUAL_10, visualPath:[] });
      }
      else if (a==='selectVopt') {
        const opt = JSON.parse(el.dataset.vopt);
        if (opt.result) navigate({ result:getById(opt.result), screen:'result' });
        else if (opt.next) navigate({ visualPath:[...S.visualPath, S.visualNode], visualNode:opt.next });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════
// 左右余白タップ／固定ナビボタン
// ═══════════════════════════════════════════════════════

let tsX = null, tsY = null;
document.addEventListener('touchstart', e => {
  tsX = e.touches[0].clientX; tsY = e.touches[0].clientY;
}, { passive:true });
document.addEventListener('touchend', e => {
  if (tsX===null) return;
  const dx = e.changedTouches[0].clientX - tsX;
  const dy = e.changedTouches[0].clientY - tsY;
  if (Math.abs(dx)<50 || Math.abs(dy)>80) return;
  const appW = document.querySelector('.app').offsetWidth;
  const margin = (window.innerWidth - appW) / 2;
  const tx = e.changedTouches[0].clientX;
  if (tx < margin || tx > window.innerWidth - margin) {
    dx < 0 ? goBack() : goForward();
  }
  tsX = null;
}, { passive:true });

document.addEventListener('click', e => {
  const r = document.querySelector('.app').getBoundingClientRect();
  if (e.clientX < r.left - 10)  goBack();
  if (e.clientX > r.right + 10) goForward();
});

document.getElementById('navBack').addEventListener('click', goBack);
document.getElementById('navFwd').addEventListener('click',  goForward);
document.getElementById('navTop').addEventListener('click',  goTop);

render();
