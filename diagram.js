// ═══════════════════════════════════════════════════════
// 断面図描画
// 各号車を 縦2行（top=進行左・bottom=進行右）× 横N列（ドア数）
// 「車端部」= ドア1列目とドア4列目（または3列目）の左右端のみ
// ═══════════════════════════════════════════════════════

const ZONE_COLOR = {
  wheelchair: { fill:'#B5D4F4', stroke:'#1A6FC4' },
  partner:    { fill:'#FAC775', stroke:'#BA7517' },
  toilet:     { fill:'#D4C5F5', stroke:'#7C5CBF' },
  priority:   { fill:'#9FE1CB', stroke:'#1D9E75' },
};

const CAR_W   = 54;   // 1両の幅
const ROW_H   = 22;   // 上下各行の高さ
const GAP     = 10;   // 両間のギャップ（連結器スペース）
const PAD     = 4;    // SVG左右padding
const LABEL_H = 18;   // 号車番号エリアの高さ
const COUPLER_W = 6;  // 連結器の幅
const COUPLER_H = 6;  // 連結器の高さ

function buildDiagram(train) {
  const cars  = train.cars;
  const doors = train.doors || 4;  // デフォルト4ドア、丸ノ内線は3ドア
  const CELL_W = CAR_W / doors;
  const CAR_H  = ROW_H * 2;
  const SVG_W  = PAD * 2 + cars * CAR_W + (cars - 1) * GAP;
  const SVG_H  = CAR_H + LABEL_H;
  const carY   = LABEL_H;
  const midY   = carY + CAR_H / 2;

  // zones/priority_zones を Map に変換: car→door→side→type
  function toMap(list) {
    const m = new Map();
    if (!list) return m;
    list.forEach(z => {
      if (!m.has(z.car)) m.set(z.car, {});
      const co = m.get(z.car);
      if (!co[z.door]) co[z.door] = {};
      co[z.door][z.side] = z.type || true;
    });
    return m;
  }
  const zMap = toMap(train.zones);
  const pMap = toMap(train.priority_zones);

  let svg = `<svg width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}"
    xmlns="http://www.w3.org/2000/svg" style="display:block;min-width:${SVG_W}px">`;

  for (let c = 1; c <= cars; c++) {
    const cx = PAD + (c - 1) * (CAR_W + GAP);

    // 号車番号
    svg += `<text x="${cx + CAR_W/2}" y="${LABEL_H - 4}" text-anchor="middle"
      font-size="11" font-family="sans-serif" fill="var(--text2)">${c}</text>`;

    // 車体外枠（ベース色）
    svg += `<rect x="${cx}" y="${carY}" width="${CAR_W}" height="${CAR_H}"
      rx="3" fill="var(--car-base)" stroke="var(--car-border)" stroke-width="0.8"/>`;

    // 各セルを描画
    for (let d = 1; d <= doors; d++) {
      const cellX = cx + (d - 1) * CELL_W;
      for (const [si, side] of [[0,'top'],[1,'bottom']]) {
        const cellY = carY + si * ROW_H;
        const zType = zMap.get(c)?.[d]?.[side];
        const isPri = !!pMap.get(c)?.[d]?.[side];
        let col = null;
        if      (zType === 'wheelchair') col = ZONE_COLOR.wheelchair;
        else if (zType === 'partner')    col = ZONE_COLOR.partner;
        else if (zType === 'toilet')     col = ZONE_COLOR.toilet;
        else if (isPri)                  col = ZONE_COLOR.priority;
        if (col) {
          svg += `<rect x="${cellX + 0.5}" y="${cellY + 0.5}"
            width="${CELL_W - 1}" height="${ROW_H - 1}"
            fill="${col.fill}" stroke="${col.stroke}" stroke-width="0.6"/>`;
        }
      }
      // ドア間の縦仕切り
      if (d < doors) {
        svg += `<line x1="${cx + d*CELL_W}" y1="${carY}" x2="${cx + d*CELL_W}" y2="${carY + CAR_H}"
          stroke="var(--car-border)" stroke-width="0.5"/>`;
      }
    }

    // 上下の横仕切り
    svg += `<line x1="${cx}" y1="${carY + ROW_H}" x2="${cx + CAR_W}" y2="${carY + ROW_H}"
      stroke="var(--car-border)" stroke-width="0.5"/>`;

    // 連結器（最終号車以外の右端）
    if (c < cars) {
      const couplerX = cx + CAR_W + (GAP - COUPLER_W) / 2;
      const couplerY = midY - COUPLER_H / 2;
      // 連結棒（横線）
      svg += `<line x1="${cx + CAR_W}" y1="${midY}" x2="${cx + CAR_W + GAP}" y2="${midY}"
        stroke="var(--car-border)" stroke-width="1.2"/>`;
      // 連結器の四角
      svg += `<rect x="${couplerX}" y="${couplerY}" width="${COUPLER_W}" height="${COUPLER_H}"
        rx="1" fill="var(--car-base)" stroke="var(--car-border)" stroke-width="1"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

function buildDirectionRow(train) {
  const L = train.dir_left  || '1号車側';
  const R = train.dir_right || `${train.cars}号車側`;
  return `<div class="direction-row">
    <div class="dir-label">← ${L}</div>
    <div class="dir-label right">${R} →</div>
  </div>`;
}

function buildSideLabel() {
  return `<div class="side-label-row">
    <span>進行左（1番ドア側）</span>
    <span>進行右（最終ドア側）</span>
  </div>`;
}

function buildLegend(train) {
  const hasWC  = train.zones?.some(z => z.type==='wheelchair');
  const hasPri = train.priority_zones?.length > 0;
  const hasPtn = train.zones?.some(z => z.type==='partner');
  const hasTlt = train.zones?.some(z => z.type==='toilet');
  const items  = [];
  if (hasPri) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#9FE1CB;border:1px solid #1D9E75"></div>優先席</div>`);
  if (hasWC)  items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#B5D4F4;border:1px solid #1A6FC4"></div>車いすスペース</div>`);
  if (hasPtn) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#FAC775;border:1px solid #BA7517"></div>パートナーゾーン</div>`);
  if (hasTlt) items.push(`<div class="legend-item"><div class="legend-swatch" style="background:#D4C5F5;border:1px solid #7C5CBF"></div>多機能トイレ</div>`);
  items.push(`<div class="legend-item"><div class="legend-swatch" style="background:var(--car-base);border:1px solid var(--car-border)"></div>通常</div>`);
  return `<div class="legend">${items.join('')}</div>`;
}
