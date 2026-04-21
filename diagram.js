// ═══════════════════════════════════════════════════════
// 断面図描画
// 各号車を 縦2行 × 横4列（ドア番号）のマスに分割
// top行 = 進行左側 / bottom行 = 進行右側
// ═══════════════════════════════════════════════════════

const COLOR = {
  priority:  { fill:'#9FE1CB', stroke:'#1D9E75', text:'#0F6E56' },
  wheelchair:{ fill:'#B5D4F4', stroke:'#378ADD', text:'#185FA5' },
  partner:   { fill:'#FAC775', stroke:'#BA7517', text:'#7A4A00' },
  toilet:    { fill:'#D4C5F5', stroke:'#7C5CBF', text:'#4A2E8A' },
  base:      { fill:'var(--car-base)', stroke:'var(--car-border)', text:'var(--text2)' },
};

const CAR_W = 52;   // 1両の幅
const ROW_H = 20;   // 上段/下段それぞれの高さ
const GAP   = 2;    // 両間隔
const PAD   = 1;    // SVG padding

function buildDiagram(train) {
  const cars   = train.cars;
  const isMaru = !!train.marunouchi;
  const DOORS  = 4;

  const CELL_W  = CAR_W / DOORS;
  const CAR_H   = ROW_H * 2;
  const TOTAL_W = cars * (CAR_W + GAP) - GAP + PAD * 2;
  const TOTAL_H = CAR_H + 24; // 24 = 号車番号エリア

  // zone / priority を {car→{door→{side→type}}} のMapに変換
  const zoneMap = new Map();
  const priMap  = new Map();

  function setMap(map, zones) {
    if (!zones) return;
    zones.forEach(z => {
      const key = z.car;
      if (!map.has(key)) map.set(key, {});
      const carObj = map.get(key);
      const dKey = z.door;
      if (!carObj[dKey]) carObj[dKey] = {};
      carObj[dKey][z.side] = z.type || true;
    });
  }
  setMap(zoneMap, train.zones);
  setMap(priMap,  train.priority_zones);

  let cells = '';
  let carNums = '';

  for (let c = 1; c <= cars; c++) {
    const cx = PAD + (c - 1) * (CAR_W + GAP);
    const cy = 20; // 号車番号の下

    // 号車番号
    carNums += `<text x="${cx + CAR_W/2}" y="14" text-anchor="middle"
      font-size="11" font-family="sans-serif" fill="var(--text2)">${c}</text>`;

    // 外枠
    cells += `<rect x="${cx}" y="${cy}" width="${CAR_W}" height="${CAR_H}"
      rx="3" fill="none" stroke="var(--car-border)" stroke-width="0.5"/>`;

    for (let d = 1; d <= DOORS; d++) {
      for (const [si, side] of [['top',0],['bottom',1]]) {
        const cellX = cx + (d - 1) * CELL_W;
        const cellY = cy + si * ROW_H;

        const zType = zoneMap.get(c)?.[d]?.[side];
        const isPri = !!priMap.get(c)?.[d]?.[side];

        let col;
        if      (zType === 'wheelchair') col = COLOR.wheelchair;
        else if (zType === 'partner')    col = COLOR.partner;
        else if (zType === 'toilet')     col = COLOR.toilet;
        else if (isPri)                  col = COLOR.priority;
        else                             col = null;

        if (col) {
          cells += `<rect x="${cellX + 0.5}" y="${cellY + 0.5}"
            width="${CELL_W - 1}" height="${ROW_H - 1}"
            fill="${col.fill}" stroke="${col.stroke}" stroke-width="0.5"/>`;
        }

        // 縦区切り線（ドア間）
        if (d < DOORS) {
          cells += `<line x1="${cx + d * CELL_W}" y1="${cy}" x2="${cx + d * CELL_W}" y2="${cy + CAR_H}"
            stroke="var(--car-border)" stroke-width="0.5"/>`;
        }
      }
      // 横区切り線（上下段）
      cells += `<line x1="${cx}" y1="${cy + ROW_H}" x2="${cx + CAR_W}" y2="${cy + ROW_H}"
        stroke="var(--car-border)" stroke-width="0.5"/>`;
    }
  }

  return `<svg width="${TOTAL_W}" height="${TOTAL_H}" viewBox="0 0 ${TOTAL_W} ${TOTAL_H}"
    xmlns="http://www.w3.org/2000/svg" style="display:block;min-width:${TOTAL_W}px">
    ${carNums}${cells}
  </svg>`;
}

function buildDirectionRow(train) {
  const isMaru = !!train.marunouchi;
  if (isMaru) {
    return `<div class="direction-row">
      <div class="dir-label">← 池袋方面<br><span class="dir-sub">1番ドア側</span></div>
      <div class="dir-label right">荻窪・方南町方面 →<br><span class="dir-sub">4番ドア側</span></div>
    </div>`;
  }
  const right = train.cars === 10
    ? '元町・中華街 / 新木場方面 →<br><span class="dir-sub">4番ドア側</span>'
    : '元町・中華街方面 →<br><span class="dir-sub">4番ドア側</span>';
  return `<div class="direction-row">
    <div class="dir-label">← 飯能・西武秩父<br>和光市・川越市方面<br><span class="dir-sub">1番ドア側</span></div>
    <div class="dir-label right">${right}<br>新横浜・海老名・湘南台方面</div>
  </div>`;
}

function buildSideLabel() {
  return `<div class="side-label-row">
    <span class="side-label">進行方向左側</span>
    <span class="side-label right">進行方向右側</span>
  </div>`;
}

function buildLegend(train) {
  const hasWC  = train.zones && train.zones.some(z => z.type === 'wheelchair');
  const hasPri = train.priority_zones && train.priority_zones.length > 0;
  const hasPtn = train.zones && train.zones.some(z => z.type === 'partner');
  const hasWC2 = train.zones && train.zones.some(z => z.type === 'toilet');
  const items = [];
  if (hasPri) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#9FE1CB;border:1px solid #1D9E75"></div>優先席</div>`);
  if (hasWC)  items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#B5D4F4;border:1px solid #378ADD"></div>車いすスペース</div>`);
  if (hasPtn) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#FAC775;border:1px solid #BA7517"></div>パートナーゾーン</div>`);
  if (hasWC2) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#D4C5F5;border:1px solid #7C5CBF"></div>多機能トイレ</div>`);
  items.push(`<div class="legend-item"><div class="legend-swatch" style="background:var(--car-base);border:1px solid var(--car-border)"></div>通常</div>`);
  return `<div class="legend">${items.join('')}</div>`;
}
