// ═══════════════════════════════════════════════════════
// ユーティリティ
// ═══════════════════════════════════════════════════════

function getById(id) {
  return TRAINS.find(t => t.id === id);
}

function getCands(ds) {
  return TRAINS.filter(t => !t.visualOnly && t.partial(ds));
}

function getMatch(ds) {
  return TRAINS.find(t => !t.visualOnly && t.match(ds)) || null;
}

// ═══════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════

let S = {
  screen:     'line',   // line | method | digit | visual | result | marunouchi
  lineId:     null,
  method:     null,
  digits:     [],
  result:     null,
  visualCars: null,
  visualPath: [],
  visualNode: null,
};

// ═══════════════════════════════════════════════════════
// 数字入力ロジック
// ═══════════════════════════════════════════════════════

function pushDigit(ch) {
  if (S.digits.length >= 5) return;
  const next = [...S.digits, ch];
  if (getCands(next).length === 0) return;
  S.digits = next;
  const cands  = getCands(S.digits);
  const matched = getMatch(S.digits);
  if (matched) {
    S.result = matched;
    S.screen = 'result';
  } else if (cands.length === 1) {
    S.result = cands[0];
    S.screen = 'result';
  }
  render();
}

function delDigit() {
  if (!S.digits.length) return;
  S.digits = S.digits.slice(0, -1);
  render();
}

// ═══════════════════════════════════════════════════════
// 断面図・方向矢印・凡例
// ═══════════════════════════════════════════════════════

function buildDiagram(train) {
  const cars   = train.cars;
  const isMaru = !!train.marunouchi;
  const CAR_W  = 54, CAR_H = 56, GAP = 3;
  const TOTAL_W = cars * CAR_W + (cars - 1) * GAP + 2;
  const SVG_H   = CAR_H + 16;

  // 車いすスペース・優先席のある号車を集合で持つ
  const wcSet  = new Set();
  const priSet = new Set();

  if (train.zones) {
    train.zones.forEach(z => {
      if (z.type === 'wheelchair') wcSet.add(z.car);
    });
  }
  if (train.priority_doors === 'all_end') {
    for (let i = 1; i <= cars; i++) priSet.add(i);
  } else if (Array.isArray(train.priority_doors)) {
    train.priority_doors.forEach(p => priSet.add(p.car));
  }

  let rects = '';
  for (let i = 0; i < cars; i++) {
    const carNum = i + 1;
    const x      = 1 + i * (CAR_W + GAP);
    const isWC   = wcSet.has(carNum);
    const isPri  = priSet.has(carNum) && !isWC;

    let fill, stroke, textFill;
    if (isWC) {
      fill = '#B5D4F4'; stroke = '#378ADD'; textFill = '#185FA5';
    } else if (isPri) {
      fill = '#9FE1CB'; stroke = '#1D9E75'; textFill = '#0F6E56';
    } else {
      fill = 'var(--car-base)'; stroke = 'var(--car-border)'; textFill = 'var(--text2)';
    }

    // 丸ノ内線：フリースペース位置を内部に細い帯で表示
    let innerRect = '';
    if (isMaru) {
      if (carNum <= 5) {
        innerRect = `<rect x="${x+2}" y="${SVG_H-CAR_H-2+2}" width="8" height="${CAR_H-4}" rx="2" fill="#B5D4F4" opacity="0.9"/>`;
      } else {
        innerRect = `<rect x="${x+CAR_W-10}" y="${SVG_H-CAR_H-2+2}" width="8" height="${CAR_H-4}" rx="2" fill="#B5D4F4" opacity="0.9"/>`;
      }
    }

    rects += `
      <rect x="${x}" y="${SVG_H-CAR_H-2}" width="${CAR_W}" height="${CAR_H}"
            rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      ${innerRect}
      <text x="${x + CAR_W/2}" y="${SVG_H-CAR_H/2-2+4}"
            text-anchor="middle" font-size="12" font-family="sans-serif" fill="${textFill}">
        ${carNum}
      </text>
    `;
  }

  return `<svg width="${TOTAL_W}" height="${SVG_H}" viewBox="0 0 ${TOTAL_W} ${SVG_H}"
    xmlns="http://www.w3.org/2000/svg" style="display:block">
    ${rects}
  </svg>`;
}

function buildDirectionRow(train) {
  const isMaru = !!train.marunouchi;
  if (isMaru) {
    return `<div class="direction-row">
      <div class="dir-label">← 池袋方面</div>
      <div class="dir-label right">荻窪・方南町方面 →</div>
    </div>`;
  }
  const rightLabel = train.cars === 10
    ? '元町・中華街 / 新木場方面 →<br>新横浜・海老名・湘南台方面'
    : '元町・中華街方面 →<br>新横浜・海老名・湘南台方面';
  return `<div class="direction-row">
    <div class="dir-label">← 飯能・西武秩父<br>和光市・川越市方面</div>
    <div class="dir-label right">${rightLabel}</div>
  </div>`;
}

function buildLegend(train) {
  const isMaru = !!train.marunouchi;
  const hasPri = train.priority_doors && !isMaru;
  const hasWC  = train.zones || isMaru;
  const items  = [];
  if (hasPri) {
    items.push(`<div class="legend-item">
      <div class="legend-swatch" style="background:#9FE1CB;border:1px solid #1D9E75"></div>
      優先席あり
    </div>`);
  }
  if (hasWC) {
    items.push(`<div class="legend-item">
      <div class="legend-swatch" style="background:#B5D4F4;border:1px solid #378ADD"></div>
      車いすスペース / フリースペース
    </div>`);
  }
  items.push(`<div class="legend-item">
    <div class="legend-swatch" style="background:#FAC775;border:1px solid #BA7517"></div>
    ふれあいゾーン（準備中）
  </div>`);
  items.push(`<div class="legend-item">
    <div class="legend-swatch" style="background:var(--car-base);border:1px solid var(--car-border)"></div>
    通常車両
  </div>`);
  return `<div class="legend">${items.join('')}</div>`;
}

// ═══════════════════════════════════════════════════════
// ステップバー
// ═══════════════════════════════════════════════════════

function renderStepBar() {
  const map    = { line:1, method:2, digit:3, visual:3, result:3, marunouchi:3 };
  const active = map[S.screen] || 1;
  document.getElementById('stepBar').innerHTML =
    [1, 2, 3].map(i =>
      `<div class="step-seg${i < active ? ' done' : i === active ? ' active' : ''}"></div>`
    ).join('');
}

// ═══════════════════════════════════════════════════════
// 各画面のHTML生成
// ═══════════════════════════════════════════════════════

function renderLine() {
  const lines = [
    { id:'fukutoshin', label:'副都心線・有楽町線・東急東横線 およびその直通先', goto:'method' },
    { id:'marunouchi', label:'東京メトロ丸ノ内線',                               goto:'marunouchi' },
    { id:'namboku',    label:'南北線・都営三田線・東急目黒線 およびその直通先',   muted:true },
    { id:'shinjuku',   label:'都営新宿線・京王線',                               muted:true },
    { id:'jr',         label:'JR中央・総武線各駅停車',                           muted:true },
    { id:'other',      label:'その他',                                           muted:true },
  ];
  const btns = lines.map((l, i) => {
    if (l.muted) {
      return `<button class="opt-btn muted" disabled>
        <span class="num-badge">${i+1}</span>${l.label}
      </button>`;
    }
    return `<button class="opt-btn" data-goto="${l.goto}" data-line="${l.id}">
      <span class="num-badge">${i+1}</span>${l.label}
    </button>`;
  }).join('');

  return `
    <div class="card">
      <p class="sec-label">ご乗車予定の路線</p>
      ${btns}
    </div>
    <div class="notice">
      ③〜⑤は現在未対応です。今後更新予定です。<br>
      ⑥については、公式LINEにご要望をお送りください。必要とされる方が複数いらっしゃいましたら実装します。
    </div>
  `;
}

function renderMethod() {
  return `
    <button class="back-btn" data-goto="line">← 路線選択に戻る</button>
    <div class="card">
      <p class="sec-label">検索方法を選んでください</p>
      <button class="opt-btn" data-goto="digit">
        <span class="num-badge">①</span>車両側面にある数字を入力する
      </button>
      <button class="opt-btn" data-goto="visual">
        <span class="num-badge">②</span>車両の見た目から検索する
      </button>
    </div>
  `;
}

function renderDigit() {
  const cands    = getCands(S.digits);
  const allKeys  = ['1','2','3','4','5','6','7','8','9','0','Y'];
  const valid    = allKeys.filter(k => getCands([...S.digits, k]).length > 0);

  let boxes = '';
  for (let i = 0; i < 5; i++) {
    let cls = 'digit-box', v = '';
    if (i < S.digits.length) { cls += ' filled'; v = S.digits[i]; }
    else if (i === S.digits.length) cls += ' active';
    boxes += `<div class="${cls}">${v}<span class="digit-label">${i+1}桁目</span></div>`;
  }

  const keyRows = [['1','2','3','4','5','6'],['7','8','9','0','Y','⌫']];
  const keys = keyRows.map(row =>
    row.map(k =>
      k === '⌫'
        ? `<button class="key-btn del" data-dkey="del">⌫</button>`
        : `<button class="key-btn${valid.includes(k) ? '' : ' disabled'}" data-dkey="${k}">${k}</button>`
    ).join('')
  ).join('');

  const candList = S.digits.length
    ? `<div class="cand-list">
        <p style="font-size:11px;color:var(--text3);margin-bottom:5px">候補 ${cands.length}件</p>
        ${cands.map(c =>
          `<div class="cand-item">
            <span class="cand-dot"></span>
            ${c.company} ${c.name}${c.note ? '（'+c.note+'）' : ''}
          </div>`
        ).join('')}
      </div>`
    : `<p style="font-size:13px;color:var(--text3)">車両側面の番号を1桁ずつ入力してください</p>`;

  return `
    <button class="back-btn" data-goto="method">← 検索方法に戻る</button>
    <div class="card">
      <p class="sec-label">車番を1桁ずつ入力</p>
      <div class="digit-row">${boxes}</div>
      <div class="keypad">${keys}</div>
      ${candList}
    </div>
  `;
}

function renderVisual() {
  if (!S.visualCars) {
    return `
      <button class="back-btn" data-goto="method">← 検索方法に戻る</button>
      <div class="card">
        <p class="sec-label">両数を選んでください</p>
        <button class="opt-btn" data-vcars="8">8両編成</button>
        <button class="opt-btn" data-vcars="10">10両編成</button>
      </div>
    `;
  }
  const node     = S.visualNode;
  const backLabel = S.visualPath.length === 0 ? '← 両数選択に戻る' : '← 前の質問に戻る';
  const opts = node.opts.map(opt => {
    const dot = 'color' in opt
      ? `<span class="color-dot" style="background:${opt.color || 'var(--border2)'}"></span>`
      : '';
    return `<button class="opt-btn" data-vopt='${JSON.stringify(opt)}'>${dot}${opt.label}</button>`;
  }).join('');
  return `
    <button class="back-btn" data-vback="1">${backLabel}</button>
    <div class="card">
      <p class="sec-label">${node.q}</p>
      ${opts}
    </div>
  `;
}

function renderResultCard(train) {
  const isMaru  = !!train.marunouchi;
  const wcText  = train.wheelchair_text || '調査中';
  const priText = train.priority_text   || '調査中';
  const backGoto  = isMaru ? 'line'   : 'method';
  const backLabel = isMaru ? '← 路線選択に戻る' : '← 最初からやり直す';

  return `
    <button class="back-btn" data-goto="${backGoto}">${backLabel}</button>
    <div class="result-card">
      <p class="train-name">
        ${train.company} ${train.name}
        ${train.note ? `<span class="badge">${train.note}</span>` : ''}
      </p>
      <p class="train-meta">全${train.cars}両編成</p>
      <hr class="divider">
      ${buildDirectionRow(train)}
      <div class="diagram-wrap">${buildDiagram(train)}</div>
      ${buildLegend(train)}
      <hr class="divider">
      <div class="info-block">
        <p class="info-label">車いすスペース / フリースペース</p>
        <div class="info-value${wcText === '調査中' ? ' pending' : ''}">
          ${wcText.replace(/\n/g, '<br>')}
        </div>
      </div>
      <div class="info-block">
        <p class="info-label">優先席</p>
        <div class="info-value${priText === '調査中' ? ' pending' : ''}">
          ${priText}
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// メイン描画
// ═══════════════════════════════════════════════════════

function render() {
  renderStepBar();
  const el = document.getElementById('content');

  if      (S.screen === 'line')        el.innerHTML = renderLine();
  else if (S.screen === 'method')      el.innerHTML = renderMethod();
  else if (S.screen === 'digit')       el.innerHTML = renderDigit();
  else if (S.screen === 'visual')      el.innerHTML = renderVisual();
  else if (S.screen === 'marunouchi') el.innerHTML = renderResultCard(MARUNOUCHI);
  else if (S.screen === 'result')      el.innerHTML = renderResultCard(S.result);

  bindEvents();
}

// ═══════════════════════════════════════════════════════
// イベントバインド
// ═══════════════════════════════════════════════════════

function bindEvents() {
  // 画面遷移
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const g = el.dataset.goto;
      if (g === 'line') {
        S = { screen:'line', lineId:null, method:null, digits:[], result:null,
              visualCars:null, visualPath:[], visualNode:null };
      } else if (g === 'method') {
        S = { ...S, screen:'method', digits:[], result:null,
              visualCars:null, visualPath:[], visualNode:null };
      } else if (g === 'digit') {
        S = { ...S, screen:'digit', method:'digit', digits:[], result:null };
      } else if (g === 'visual') {
        S = { ...S, screen:'visual', method:'visual',
              visualCars:null, visualPath:[], visualNode:null };
      } else if (g === 'marunouchi') {
        S = { ...S, screen:'marunouchi' };
      }
      if (el.dataset.line) S.lineId = el.dataset.line;
      render();
    });
  });

  // テンキー
  document.querySelectorAll('[data-dkey]').forEach(el => {
    el.addEventListener('click', () => {
      const k = el.dataset.dkey;
      if (k === 'del') delDigit(); else pushDigit(k);
    });
  });

  // 両数選択
  document.querySelectorAll('[data-vcars]').forEach(el => {
    el.addEventListener('click', () => {
      S.visualCars = parseInt(el.dataset.vcars);
      S.visualPath = [];
      S.visualNode = S.visualCars === 8 ? VISUAL_8 : VISUAL_10;
      render();
    });
  });

  // 見た目の選択肢
  document.querySelectorAll('[data-vopt]').forEach(el => {
    el.addEventListener('click', () => {
      const opt = JSON.parse(el.dataset.vopt);
      if (opt.result) {
        S.result = getById(opt.result);
        S.screen = 'result';
      } else if (opt.next) {
        S.visualPath.push(S.visualNode);
        S.visualNode = opt.next;
      }
      render();
    });
  });

  // 見た目の戻る
  document.querySelectorAll('[data-vback]').forEach(el => {
    el.addEventListener('click', () => {
      if (S.visualPath.length > 0) {
        S.visualNode = S.visualPath.pop();
      } else {
        S.visualCars = null;
        S.visualNode = null;
      }
      render();
    });
  });
}

// 起動
render();
