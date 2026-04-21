// ═══════════════════════════════════════════════════════
// 車両データ
// ═══════════════════════════════════════════════════════
// zones[].type: 'wheelchair' = 車いすスペース / フリースペース
// priority_doors: [{car, door}] | 'all_end' | null
// ═══════════════════════════════════════════════════════

const TRAINS = [

  // ── 横浜高速 ──────────────────────────────────────────
  {
    id: 'y500', name: 'Y500系', company: '横浜高速鉄道', cars: 8,
    bandColor: '#3A8CD4', bandNote: '青・黄色中心',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 7, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
    match:   d => d[0]==='Y' && d.length===1,
    partial: d => !d.length || (d.length===1 && d[0]==='Y'),
  },

  // ── 東京メトロ ────────────────────────────────────────
  {
    id: '10000', name: '10000系', company: '東京メトロ', cars: 10,
    bandColor: '#8B6914', bandNote: 'ブラウン・ゴールド',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 9, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
    match:   d => d[0]==='1' && d[1]==='0' && d.length===2,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '1') return false;
      if (d.length === 1) return true;
      return d[1] === '0' && d.length <= 2;
    },
  },
  {
    id: '17000', name: '17000系', company: '東京メトロ', cars: 10,
    bandColor: '#8B6914', bandNote: 'ブラウン・ゴールド',
    zones: [
      {car:1,door:4,type:'wheelchair'},{car:2,door:4,type:'wheelchair'},
      {car:3,door:1,type:'wheelchair'},{car:4,door:1,type:'wheelchair'},
      {car:5,door:1,type:'wheelchair'},{car:6,door:1,type:'wheelchair'},
      {car:7,door:1,type:'wheelchair'},{car:8,door:1,type:'wheelchair'},
      {car:9,door:1,type:'wheelchair'},{car:10,door:1,type:'wheelchair'},
    ],
    wheelchair_text: '1・2号車は4番ドア、3〜10号車は1番ドア',
    priority_text: '全車両 車端部（編成端を除く）',
    priority_doors: 'all_end',
    match:   d => d[0]==='1' && d[1]==='7' && /[0-9]/.test(d[2]||'x') && d[3]==='0' && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '1') return false;
      if (d.length === 1) return true;
      if (d[1] !== '7') return false;
      if (d.length === 2) return true;
      if (!/[0-9]/.test(d[2])) return false;
      if (d.length === 3) return true;
      return d[3] === '0' && d.length <= 4;
    },
  },
  {
    id: '17080', name: '17080系', company: '東京メトロ', cars: 8,
    bandColor: '#8B6914', bandNote: 'ブラウン・ゴールド',
    zones: [
      {car:1,door:4,type:'wheelchair'},{car:2,door:4,type:'wheelchair'},
      {car:3,door:1,type:'wheelchair'},{car:4,door:1,type:'wheelchair'},
      {car:5,door:1,type:'wheelchair'},{car:6,door:1,type:'wheelchair'},
      {car:7,door:1,type:'wheelchair'},{car:8,door:1,type:'wheelchair'},
    ],
    wheelchair_text: '1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text: '全車両 車端部（編成端を除く）',
    priority_doors: 'all_end',
    match:   d => d[0]==='1' && d[1]==='7' && /[0-9]/.test(d[2]||'x') && d[3]==='8' && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '1') return false;
      if (d.length === 1) return true;
      if (d[1] !== '7') return false;
      if (d.length === 2) return true;
      if (!/[0-9]/.test(d[2])) return false;
      if (d.length === 3) return true;
      return d[3] === '8' && d.length <= 4;
    },
  },

  // ── 相鉄 ──────────────────────────────────────────────
  {
    id: '20000', name: '20000系', company: '相鉄', cars: 10,
    bandColor: '#1A3A6B', bandNote: '全面濃い青',
    zones: [
      { car: 1, door: 4, type: 'wheelchair' },
      ...Array.from({ length: 9 }, (_, i) => ({ car: i+2, door: 1, type: 'wheelchair' })),
    ],
    wheelchair_text: '1号車は4番ドア、2〜10号車は1番ドア',
    priority_text: '全車両 車端部（編成端を除く）',
    priority_doors: 'all_end',
    match:   d => d[0]==='2' && d.length===1,
    partial: d => !d.length || (d.length===1 && d[0]==='2'),
  },

  // ── 東急 4000番台 ─────────────────────────────────────
  {
    id: '5050_4000_qno', name: '5050系4000番台', company: '東急', cars: 10, note: 'Qシートなし',
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 9, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
    match:   d => d[0]==='4' && /[0-9]/.test(d[1]||'x') && d[2]==='1' && /[01]/.test(d[3]||'x') && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '4') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      if (d[2] !== '1') return false;
      if (d.length === 3) return true;
      return /[01]/.test(d[3]) && d.length <= 4;
    },
  },
  {
    id: '5050_4000_q', name: '5050系4000番台', company: '東急', cars: 10, note: 'Qシートあり',
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 9, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
    match:   d => d[0]==='4' && /[0-9]/.test(d[1]||'x') && d[2]==='1' && /[2-5]/.test(d[3]||'x') && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '4') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      if (d[2] !== '1') return false;
      if (d.length === 3) return true;
      return /[2-5]/.test(d[3]) && d.length <= 4;
    },
  },

  // ── 西武 ──────────────────────────────────────────────
  {
    id: '40000', name: '40000系', company: '西武', cars: 10, note: 'Qシート6席',
    bandColor: null, bandNote: 'ドアのみカラフル',
    zones: null,
    wheelchair_text: '調査中',
    priority_text: '調査中',
    priority_doors: null,
    match:   d => d[0]==='4' && d[1]==='0' && /[0-9]/.test(d[2]||'x') && /[0-9]/.test(d[3]||'x') && /[1-6]/.test(d[4]||'x') && d.length===5,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '4') return false;
      if (d.length === 1) return true;
      if (d[1] !== '0') return false;
      if (d.length === 2) return true;
      if (!/[0-9]/.test(d[2])) return false;
      if (d.length === 3) return true;
      if (!/[0-9]/.test(d[3])) return false;
      if (d.length === 4) return true;
      return /[1-6]/.test(d[4]) && d.length <= 5;
    },
  },
  {
    id: '40050', name: '40050系', company: '西武', cars: 10, note: 'Qシート7席',
    bandColor: null, bandNote: 'ドアのみカラフル',
    zones: [
      {car:1,door:4,type:'wheelchair'},{car:2,door:4,type:'wheelchair'},
      {car:3,door:1,type:'wheelchair'},{car:4,door:1,type:'wheelchair'},
      {car:5,door:1,type:'wheelchair'},{car:6,door:1,type:'wheelchair'},
      {car:7,door:1,type:'wheelchair'},{car:8,door:1,type:'wheelchair'},
      {car:9,door:1,type:'wheelchair'},{car:10,door:'partner',type:'wheelchair'},
    ],
    wheelchair_text: '1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン',
    priority_text: '全車両 車端部（編成端を除く）',
    priority_doors: 'all_end',
    match:   d => d[0]==='4' && d[1]==='0' && /[0-9]/.test(d[2]||'x') && /[56]/.test(d[3]||'x') && /[1-9]/.test(d[4]||'x') && d.length===5,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '4') return false;
      if (d.length === 1) return true;
      if (d[1] !== '0') return false;
      if (d.length === 2) return true;
      if (!/[0-9]/.test(d[2])) return false;
      if (d.length === 3) return true;
      if (!/[56]/.test(d[3])) return false;
      if (d.length === 4) return true;
      return /[1-9]/.test(d[4]) && d.length <= 5;
    },
  },

  // ── 東急 5000系 ───────────────────────────────────────
  {
    id: '5000', name: '5000系', company: '東急', cars: 8,
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 7, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
    match:   d => d[0]==='5' && /[0-9]/.test(d[1]||'x') && /[12]/.test(d[2]||'x') && d.length===3,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '5') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      return /[12]/.test(d[2]) && d.length <= 3;
    },
  },
  {
    id: '5177', name: '5050系（5177f/78f）', company: '東急', cars: 8,
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      {car:1,door:4,type:'wheelchair'},{car:2,door:4,type:'wheelchair'},
      {car:3,door:1,type:'wheelchair'},{car:4,door:1,type:'wheelchair'},
      {car:5,door:1,type:'wheelchair'},{car:6,door:1,type:'wheelchair'},
      {car:7,door:1,type:'wheelchair'},{car:8,door:1,type:'wheelchair'},
    ],
    wheelchair_text: '1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
    match:   d => d[0]==='5' && /[0-9]/.test(d[1]||'x') && d[2]==='7' && /[78]/.test(d[3]||'x') && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '5') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      if (d[2] !== '7') return false;
      if (d.length === 3) return true;
      return /[78]/.test(d[3]) && d.length <= 4;
    },
  },
  {
    id: '5050_56', name: '5050系', company: '東急', cars: 8,
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 7, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
    match:   d => d[0]==='5' && /[0-9]/.test(d[1]||'x') && /[56]/.test(d[2]||'x') && d.length===3,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '5') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      return /[56]/.test(d[2]) && d.length <= 3;
    },
  },
  {
    id: '5050_70_6', name: '5050系', company: '東急', cars: 8,
    bandColor: '#e85d6a', bandNote: '赤・ピンク',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 7, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
    match:   d => d[0]==='5' && /[0-9]/.test(d[1]||'x') && d[2]==='7' && /[0-6]/.test(d[3]||'x') && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '5') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      if (d[2] !== '7') return false;
      if (d.length === 3) return true;
      return /[0-6]/.test(d[3]) && d.length <= 4;
    },
  },

  // ── 東武 ──────────────────────────────────────────────
  {
    id: '50070', name: '50070系', company: '東武', cars: 10,
    bandColor: '#E07320', bandNote: 'オレンジ',
    zones: null,
    wheelchair_text: '調査中',
    priority_text: '調査中',
    priority_doors: null,
    match:   d => d[0]==='5' && /[0-9]/.test(d[1]||'x') && d[2]==='0' && d[3]==='7' && d.length===4,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '5') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      if (d[2] !== '0') return false;
      if (d.length === 3) return true;
      return d[3] === '7' && d.length <= 4;
    },
  },
  {
    id: '6000', name: '6000系', company: '西武', cars: 10,
    bandColor: '#2E72B8', bandNote: '青',
    zones: [
      { car: 2, door: 4, type: 'wheelchair' },
      { car: 9, door: 1, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '奇数号車 4番ドア・偶数号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:1},{car:3,door:4},{car:4,door:1},{car:5,door:4},
      {car:6,door:1},{car:7,door:4},{car:8,door:1},{car:9,door:4},{car:10,door:1},
    ],
    match:   d => d[0]==='6' && d.length===1,
    partial: d => !d.length || (d.length===1 && d[0]==='6'),
  },
  {
    id: '9000', name: '9000系', company: '東武', cars: 10,
    bandColor: '#8B2A5C', bandNote: '赤紫',
    zones: [
      { car: 2, door: 1, type: 'wheelchair' },
      { car: 9, door: 4, type: 'wheelchair' },
    ],
    wheelchair_text: '2号車1番ドア・9号車4番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
    match:   d => d[0]==='9' && /[0-9]/.test(d[1]||'x') && d[2]==='0' && d.length===3,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '9') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      return d[2] === '0' && d.length <= 3;
    },
  },
  {
    id: '9050', name: '9050系', company: '東武', cars: 10,
    bandColor: '#8B2A5C', bandNote: '赤紫',
    zones: null,
    wheelchair_text: '調査中',
    priority_text: '調査中',
    priority_doors: null,
    match:   d => d[0]==='9' && /[0-9]/.test(d[1]||'x') && d[2]==='5' && d.length===3,
    partial: d => {
      if (!d.length) return true;
      if (d[0] !== '9') return false;
      if (d.length === 1) return true;
      if (!/[0-9]/.test(d[1])) return false;
      if (d.length === 2) return true;
      return d[2] === '5' && d.length <= 3;
    },
  },

  // ── ラッピング（見た目検索のみ）────────────────────────
  {
    id: 'aogaeru', name: '青ガエル', company: '東急', cars: 8, visualOnly: true,
    zones: [{car:2,door:4,type:'wheelchair'},{car:7,door:1,type:'wheelchair'}],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
  },
  {
    id: 'sdgs', name: 'SDGsトレイン', company: '東急', cars: 8, visualOnly: true,
    zones: [{car:2,door:4,type:'wheelchair'},{car:7,door:1,type:'wheelchair'}],
    wheelchair_text: '2号車4番ドア・7号車1番ドア',
    priority_text: '1〜7号車 4番ドア・8号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},
      {car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1},
    ],
  },
  {
    id: 'hito', name: '「人へ、街へ、未来へ。」彩を描く特別な電車', company: '東急', cars: 10, visualOnly: true,
    zones: [{car:2,door:4,type:'wheelchair'},{car:9,door:1,type:'wheelchair'}],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
  },
  {
    id: 'shinkansen', name: '新幹線デザイン', company: '東急', cars: 10, visualOnly: true,
    zones: [{car:2,door:4,type:'wheelchair'},{car:9,door:1,type:'wheelchair'}],
    wheelchair_text: '2号車4番ドア・9号車1番ドア',
    priority_text: '1〜9号車 4番ドア・10号車 1番ドア',
    priority_doors: [
      {car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},
      {car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1},
    ],
  },
  {
    id: 'ltrain', name: 'L-train', company: '西武', cars: 10, visualOnly: true,
    zones: [
      {car:1,door:4,type:'wheelchair'},{car:2,door:4,type:'wheelchair'},
      {car:3,door:1,type:'wheelchair'},{car:4,door:1,type:'wheelchair'},
      {car:5,door:1,type:'wheelchair'},{car:6,door:1,type:'wheelchair'},
      {car:7,door:1,type:'wheelchair'},{car:8,door:1,type:'wheelchair'},
      {car:9,door:1,type:'wheelchair'},{car:10,door:'partner',type:'wheelchair'},
    ],
    wheelchair_text: '1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン',
    priority_text: '全車両 車端部（編成端を除く）',
    priority_doors: 'all_end',
  },
];

// ── 丸ノ内線専用データ ────────────────────────────────────
const MARUNOUCHI = {
  name: '2000系', company: '東京メトロ', cars: 6, marunouchi: true,
  wheelchair_text: '1〜5号車：池袋寄り車端 フリースペース＋車いすスペース\n6号車：荻窪・方南町寄り車端 フリースペース＋車いすスペース',
  priority_text: '調査中',
  zones: [
    ...Array.from({ length: 5 }, (_, i) => ({ car: i+1, door: 'end_1',    type: 'wheelchair' })),
    { car: 6, door: 'end_last', type: 'wheelchair' },
  ],
};

// ── 見た目検索ツリー ──────────────────────────────────────
const VISUAL_8 = {
  q: '帯の色は？',
  opts: [
    { label: '赤・ピンク', color: '#e85d6a',
      next: { q: '特別なラッピングはありますか？',
        opts: [
          { label: '全面緑（青ガエル）', result: 'aogaeru' },
          { label: 'カラフル（SDGs）',   result: 'sdgs' },
          { label: '特になし',
            next: { q: '車両番号の3桁目（10の位）は？',
              opts: [
                { label: '5以上 → 5050系', result: '5050_56' },
                { label: '5未満 → 5000系', result: '5000'    },
              ],
            },
          },
        ],
      },
    },
    { label: 'ブラウン・ゴールド', color: '#8B6914', result: '17080' },
    { label: '青・黄色中心',       color: '#3A8CD4', result: 'y500'  },
  ],
};

const VISUAL_10 = {
  q: '帯の色は？',
  opts: [
    { label: '赤・ピンク', color: '#e85d6a',
      next: { q: '特別なラッピングはありますか？',
        opts: [
          { label: 'カラフル（人へ街へ未来へ）',   result: 'hito'        },
          { label: '白地に青線2本（新幹線）',       result: 'shinkansen'  },
          { label: '特になし → 4000番台',          result: '5050_4000_qno' },
        ],
      },
    },
    { label: 'ブラウン・ゴールド', color: '#8B6914',
      next: { q: '車体上部の形は？',
        opts: [
          { label: '丸みがある → 10000系',   result: '10000' },
          { label: '角ばっている → 17000系', result: '17000' },
        ],
      },
    },
    { label: '青',              color: '#2E72B8', result: '6000'  },
    { label: 'ドアのみカラフル', color: null,
      next: { q: 'Qシートの席数は？',
        opts: [
          { label: '6席 → 40000系', result: '40000' },
          { label: '7席 → 40050系', result: '40050' },
        ],
      },
    },
    { label: 'Lions柄',   result: 'ltrain' },
    { label: '赤紫',      color: '#8B2A5C',
      next: { q: '車両番号の3桁目（10の位）は？',
        opts: [
          { label: '0 → 9000系',    result: '9000' },
          { label: '5以上 → 9050系', result: '9050' },
        ],
      },
    },
    { label: 'オレンジ',   color: '#E07320', result: '50070' },
    { label: '全面濃い青', color: '#1A3A6B', result: '20000' },
  ],
};
