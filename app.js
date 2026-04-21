// ═══════════════════════════════════════════════════════
// State & 履歴
// ═══════════════════════════════════════════════════════

let S = {
  screen:     'welcome', // welcome | line | method | digit | visual | result | marunouchi | help
  lineId:     null,
  method:     null,
  digits:     [],
  result:     null,
  visualCars: null,
  visualPath: [],
  visualNode: null,
};

// 戻る/進む用の画面履歴スタック
const history  = [];  // 戻れる画面
const forward  = [];  // 進める画面（戻った後）

function navigate(newState) {
  history.push({ ...S });
  forward.length = 0; // 新たに進んだら進む履歴はリセット
  S = { ...S, ...newState };
  render();
}

function goBack() {
  if (!history.length) return;
  forward.push({ ...S });
  S = history.pop();
  render();
}

function goForward() {
  if (!forward.length) return;
  history.push({ ...S });
  S = forward.pop();
  render();
}

// ═══════════════════════════════════════════════════════
// 車番入力ロジック
// ═══════════════════════════════════════════════════════

function getById(id) { return TRAINS.find(t => t.id === id); }
function getCands(ds) { return TRAINS.filter(t => !t.visualOnly && t.partial(ds)); }
function getMatch(ds) { return TRAINS.find(t => !t.visualOnly && t.match(ds)) || null; }

function pushDigit(ch) {
  if (S.digits.length >= 4) return;
  const next = [...S.digits, ch];
  if (getCands(next).length === 0) return;
  const newDigits = next;
  const matched = getMatch(newDigits);
  const cands   = getCands(newDigits);
  if (matched) {
    navigate({ digits: newDigits, result: matched, screen: 'result' });
  } else if (cands.length === 1) {
    navigate({ digits: newDigits, result: cands[0], screen: 'result' });
  } else {
    navigate({ digits: newDigits });
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
  const map = { welcome:0, line:1, method:2, digit:3, visual:3, result:3, marunouchi:3, help:1 };
  const active = map[S.screen] ?? 0;
  document.getElementById('stepBar').innerHTML =
    [1,2,3].map(i =>
      `<div class="step-seg${i < active ? ' done' : i === active ? ' active' : ''}"></div>`
    ).join('');
}

// ═══════════════════════════════════════════════════════
// 各画面HTML
// ═══════════════════════════════════════════════════════

function renderWelcome() {
  return `<div class="card welcome-card">
    <p style="font-size:15px;line-height:1.75;color:var(--text)">
      このサイトでは、中央大学各キャンパスにアクセスする際に使う一部路線の、優先席および車いすスペースの検索ができます。
    </p>
    <p style="font-size:14px;line-height:1.75;color:var(--text2);margin-top:12px">
      次に来る電車の情報を知りたい場合、<a href="https://loo-ool.com/rail/" target="_blank" rel="noopener" class="link">このサイト</a>と時刻表を見比べ、来る車両を検索してください。詳しいやり方は次の画面の「？」ボタンからご確認ください。
    </p>
    <button class="primary-btn" data-action="toLine" style="margin-top:20px">路線を選ぶ →</button>
  </div>`;
}

function renderLine() {
  const lines = [
    { id:'fukutoshin', label:'副都心線・有楽町線・東急東横線 およびその直通先', goto:'method' },
    { id:'marunouchi', label:'東京メトロ丸ノ内線',                               goto:'marunouchi' },
    { id:'namboku',    label:'南北線・都営三田線・東急目黒線 およびその直通先',   muted:true },
    { id:'shinjuku',   label:'都営新宿線・京王線',                               muted:true },
    { id:'jr',         label:'JR中央・総武線各駅停車',                           muted:true },
    { id:'other',      label:'その他',                                           line_url:'https://line.me/' },
  ];
  const btns = lines.map((l, i) => {
    if (l.muted) return `<button class="opt-btn muted" disabled><span class="num-badge">${i+1}</span>${l.label}</button>`;
    if (l.line_url) return `<a href="${l.line_url}" target="_blank" rel="noopener" class="opt-btn"><span class="num-badge">${i+1}</span>${l.label}</a>`;
    return `<button class="opt-btn" data-action="selectLine" data-goto="${l.goto}" data-line="${l.id}"><span class="num-badge">${i+1}</span>${l.label}</button>`;
  }).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <span style="font-size:13px;color:var(--text2)">路線を選んでください</span>
    <button class="icon-btn" data-action="toHelp" title="使い方">？</button>
  </div>
  <div class="card"><p class="sec-label">ご乗車予定の路線</p>${btns}</div>
  <div class="notice">③〜⑤は現在未対応です。今後更新予定です。⑥は公式LINEへのリンクです。</div>`;
}

function renderHelp() {
  return `<div class="card">
    <p style="font-size:15px;line-height:1.8;color:var(--text)">
      <a href="https://loo-ool.com/rail/" target="_blank" rel="noopener" class="link">このサイト</a>の使い方をご案内します。
    </p>
    <ol style="font-size:14px;line-height:1.9;color:var(--text);padding-left:1.4em;margin-top:12px">
      <li>まず、下までスクロールして「路線一覧」からこれから利用予定の路線を選択してください。</li>
      <li>次に、一番上の「時刻表」を押し、利用する駅から最も近い駅を選んでください。</li>
      <li>時刻表を基に、②で選んだ駅を何時何分に出発する電車かを調べ、行き先の下あたりに書いてある、比較的長い数字を覚えてください。</li>
      <li>このサイトに戻り、路線を選択し、「車体側面にある数字を入力する」ボタンから③で覚えた番号を入力してください。</li>
    </ol>
    <p style="font-size:12px;color:var(--text3);margin-top:14px;line-height:1.7">
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

  let boxes = '';
  for (let i = 0; i < 4; i++) {
    let cls = 'digit-box', v = '';
    if (i < S.digits.length) { cls += ' filled'; v = S.digits[i]; }
    else if (i === S.digits.length) cls += ' active';
    boxes += `<div class="${cls}">${v}<span class="digit-label">${i+1}桁目</span></div>`;
  }
  const rows = [['1','2','3','4','5','6'],['7','8','9','0','Y','⌫']];
  const keys = rows.map(row => row.map(k =>
    k === '⌫'
      ? `<button class="key-btn del" data-action="delDigit">⌫</button>`
      : `<button class="key-btn${valid.includes(k)?'':' disabled'}" data-action="pushDigit" data-key="${k}">${k}</button>`
  ).join('')).join('');

  return `<div class="card">
    <p class="sec-label" style="font-size:14px">車番を1桁ずつ入力</p>
    <div class="digit-row">${boxes}</div>
    <div class="keypad">${keys}</div>
    ${S.digits.length
      ? `<p style="font-size:13px;color:var(--text3);margin-top:6px">候補 ${cands.length}件</p>`
      : `<p style="font-size:14px;color:var(--text3);margin-top:6px">車両側面の番号を入力してください</p>`}
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
      ? `<span class="color-dot" style="background:${opt.color || 'var(--border2)'}"></span>` : '';
    return `<button class="opt-btn" data-action="selectVopt" data-vopt='${JSON.stringify(opt)}'>${dot}${opt.label}</button>`;
  }).join('');
  return `<div class="card"><p class="sec-label" style="font-size:14px">${node.q}</p>${opts}</div>`;
}

function renderResultCard(train) {
  const isMaru  = !!train.marunouchi;
  const wcText  = train.wheelchair_text || '調査中';
  const priText = train.priority_text   || '調査中';
  const diag    = buildDiagram(train);
  const dirRow  = buildDirectionRow(train);
  const sides   = buildSideLabel();
  const legend  = buildLegend(train);

  const serviceNote = train.service_note
    ? `<div class="service-note">${train.service_note}</div>` : '';
  const diagNote = train.diagram_note
    ? `<p style="font-size:12px;color:var(--text2);margin-top:6px">${train.diagram_note}</p>` : '';

  return `<div class="result-card">
    <p class="train-name">${train.company} ${train.name}${train.note ? `<span class="badge">${train.note}</span>` : ''}</p>
    <p class="train-meta">全${train.cars}両編成</p>
    ${serviceNote}
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

  if      (S.screen === 'welcome')     el.innerHTML = renderWelcome();
  else if (S.screen === 'line')        el.innerHTML = renderLine();
  else if (S.screen === 'help')        el.innerHTML = renderHelp();
  else if (S.screen === 'method')      el.innerHTML = renderMethod();
  else if (S.screen === 'digit')       el.innerHTML = renderDigit();
  else if (S.screen === 'visual')      el.innerHTML = renderVisual();
  else if (S.screen === 'marunouchi') el.innerHTML = renderResultCard(MARUNOUCHI);
  else if (S.screen === 'result')      el.innerHTML = renderResultCard(S.result);

  // 左下戻る・右下進むボタン更新
  const btnBack = document.getElementById('navBack');
  const btnFwd  = document.getElementById('navFwd');
  if (btnBack) btnBack.style.visibility = history.length  ? 'visible' : 'hidden';
  if (btnFwd)  btnFwd.style.visibility  = forward.length  ? 'visible' : 'hidden';

  bindEvents();
}

// ═══════════════════════════════════════════════════════
// イベントバインド
// ═══════════════════════════════════════════════════════

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', e => {
      const a = el.dataset.action;
      if      (a === 'toLine')     navigate({ screen: 'line' });
      else if (a === 'toHelp')     navigate({ screen: 'help' });
      else if (a === 'toDigit')    navigate({ screen: 'digit', digits: [] });
      else if (a === 'toVisual')   navigate({ screen: 'visual', visualCars: null, visualPath: [], visualNode: null });
      else if (a === 'selectLine') {
        const goto = el.dataset.goto;
        const lineId = el.dataset.line;
        navigate({ screen: goto, lineId });
      }
      else if (a === 'pushDigit')  pushDigit(el.dataset.key);
      else if (a === 'delDigit')   delDigit();
      else if (a === 'setVcars') {
        const cars = parseInt(el.dataset.cars);
        navigate({ visualCars: cars, visualNode: cars === 8 ? VISUAL_8 : VISUAL_10, visualPath: [] });
      }
      else if (a === 'selectVopt') {
        const opt = JSON.parse(el.dataset.vopt);
        if (opt.result) {
          navigate({ result: getById(opt.result), screen: 'result' });
        } else if (opt.next) {
          navigate({ visualPath: [...S.visualPath, S.visualNode], visualNode: opt.next });
        }
      }
    });
  });
}

// ═══════════════════════════════════════════════════════
// 左右タップ・スワイプで進む/戻る
// ═══════════════════════════════════════════════════════

let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dy) > 80) return; // 縦スクロールは無視
  // 余白タップか判定：コンテンツ幅外のみ
  const appW = document.querySelector('.app').offsetWidth;
  const winW = window.innerWidth;
  const margin = (winW - appW) / 2;
  const tx = e.changedTouches[0].clientX;
  const isMargin = tx < margin || tx > winW - margin;
  if (!isMargin) return;
  if (dx < 0) goBack();    // 左端タップ = 戻る
  else        goForward(); // 右端タップ = 進む
  touchStartX = null;
}, { passive: true });

// PCでの左右余白クリック
document.addEventListener('click', e => {
  const appEl = document.querySelector('.app');
  const rect  = appEl.getBoundingClientRect();
  if (e.clientX < rect.left - 10)  goBack();
  if (e.clientX > rect.right + 10) goForward();
});

// 左下・右下ボタン
document.getElementById('navBack').addEventListener('click', goBack);
document.getElementById('navFwd').addEventListener('click',  goForward);

// 起動
render();
