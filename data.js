// ═══════════════════════════════════════════════════════
// 車両データ定義
//
// zones[]: 各スペースの位置
//   { car, door, side, type }
//   door: 1-4 (ドア番号)
//   side: 'top' | 'bottom' (進行方向左=top / 右=bottom)
//   type: 'wheelchair' | 'partner' | 'toilet'
//
// priority_zones[]: 優先席の位置
//   { car, door, side }
//
// diagram_note: 図の下に出す補足
// service_note: 結果画面に出す運用注記
// ═══════════════════════════════════════════════════════

function allPriority(cars) {
  const r = [];
  for (let c = 1; c <= cars; c++)
    for (let d = 1; d <= 4; d++)
      for (const s of ['top','bottom']) {
        if (c === 1 && d === 1) continue;
        if (c === cars && d === 4) continue;
        r.push({ car: c, door: d, side: s });
      }
  return r;
}

function doorPriority(list) {
  return list.flatMap(({ car, door }) => [
    { car, door, side: 'top' },
    { car, door, side: 'bottom' },
  ]);
}

const TRAINS = [
  // ── 横浜高速鉄道 Y500系 ───────────────────────────────
  { id:'y500', name:'Y500系', company:'横浜高速鉄道', cars:8,
    bandColor:'#3A8CD4', bandNote:'青・黄色中心',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='Y' && d.length===1,
    partial: d => !d.length || (d.length===1 && d[0]==='Y') },

  // ── 東京メトロ 10000系 ────────────────────────────────
  { id:'10000', name:'10000系', company:'東京メトロ', cars:10,
    bandColor:'#8B6914', bandNote:'ブラウン・ゴールド',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d => d[0]==='1' && d[1]==='0' && d.length===2,
    partial: d => { if(!d.length)return true; if(d[0]!=='1')return false; if(d.length===1)return true; return d[1]==='0'&&d.length<=2; } },

  // ── 東京メトロ 17000系 ────────────────────────────────
  { id:'17000', name:'17000系', company:'東京メトロ', cars:10,
    bandColor:'#8B6914', bandNote:'ブラウン・ゴールド',
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
           {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:8},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜10号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d => d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='0'&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='1')return false; if(d.length===1)return true; if(d[1]!=='7')return false; if(d.length===2)return true; if(!/[0-9]/.test(d[2]))return false; if(d.length===3)return true; return d[3]==='0'&&d.length<=4; } },

  // ── 東京メトロ 17080系（〜第9編成：4桁目8）─────────────
  { id:'17080', name:'17080系', company:'東京メトロ', cars:8,
    bandColor:'#8B6914', bandNote:'ブラウン・ゴールド',
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
           {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: allPriority(8),
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d => d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='8'&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='1')return false; if(d.length===1)return true; if(d[1]!=='7')return false; if(d.length===2)return true; if(!/[0-9]/.test(d[2]))return false; if(d.length===3)return true; return d[3]==='8'&&d.length<=4; } },

  // ── 東京メトロ 17080系（第10編成〜：4桁目9）────────────
  { id:'17090', name:'17080系', company:'東京メトロ', cars:8,
    bandColor:'#8B6914', bandNote:'ブラウン・ゴールド',
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
           {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: allPriority(8),
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d => d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='9'&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='1')return false; if(d.length===1)return true; if(d[1]!=='7')return false; if(d.length===2)return true; if(!/[0-9]/.test(d[2]))return false; if(d.length===3)return true; return d[3]==='9'&&d.length<=4; } },

  // ── 相鉄 20000系 ──────────────────────────────────────
  { id:'20000', name:'20000系', company:'相鉄', cars:10,
    bandColor:'#1A3A6B', bandNote:'全面濃い青',
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:9},(_,i)=>[{car:i+2,door:1,side:'top',type:'wheelchair'},{car:i+2,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: allPriority(10),
    wheelchair_text:'1号車は4番ドア、2〜10号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d => d[0]==='2'&&d.length===1,
    partial: d => !d.length||(d.length===1&&d[0]==='2') },

  // ── 東急 5050系4000番台（4桁目0〜：Qシートなし）─────────
  { id:'5050_4000_qno', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートなし',
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    // 1桁目4, 2桁目0-9, 3桁目0, 4桁目0-9
    match:   d => d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&/[0-9]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='4')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='0')return false; if(d.length===3)return true; return /[0-9]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5050系4000番台（4桁目0,1：Qシートなし）──────────
  { id:'5050_4000_qno2', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートなし',
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    // 1桁目4, 2桁目0-9, 3桁目1, 4桁目0,1
    match:   d => d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='1'&&/[01]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='4')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='1')return false; if(d.length===3)return true; return /[01]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5050系4000番台（4桁目2〜5：Qシートあり）──────────
  { id:'5050_4000_q', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートあり',
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    service_note:'この車両の4号車は一部時間帯有料着席保証サービス「Q SEAT」に使用されます。Q SEAT運用時は4号車にはご乗車になれません。',
    match:   d => d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='1'&&/[2-5]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='4')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='1')return false; if(d.length===3)return true; return /[2-5]/.test(d[3])&&d.length<=4; } },

  // ── 西武 40000系 ──────────────────────────────────────
  { id:'40000', name:'40000系', company:'西武', cars:10,
    bandColor:null, bandNote:'ドアのみカラフル',
    zones:[
      {car:1, door:1,side:'top',   type:'wheelchair'},{car:1,door:1,side:'bottom',type:'wheelchair'},
      {car:2, door:4,side:'top',   type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      {car:4, door:4,side:'top',   type:'wheelchair'},   // 進行左=車いす
      {car:4, door:4,side:'bottom',type:'toilet'},        // 進行右=多機能トイレ
      {car:9, door:1,side:'top',   type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'},
      {car:10,door:3,side:'top',   type:'partner'},{car:10,door:3,side:'bottom',type:'partner'},
      {car:10,door:4,side:'top',   type:'partner'},{car:10,door:4,side:'bottom',type:'partner'},
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1号車1番ドア・2号車4番ドア・4号車4番ドア（進行左側）・9号車1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    diagram_note:'4号車4番ドア：進行左側が車いすスペース、進行右側が多機能トイレ',
    service_note:'この車両は有料座席指定列車「S-TRAIN」に使用されます。S-TRAIN運用時には指定された座席をご利用ください。',
    // 1桁目4, 2桁目0, 3桁目0-9, 4桁目0-4（40000〜40049）
    match:   d => d[0]==='4'&&d[1]==='0'&&/[0-9]/.test(d[2]||'x')&&/[0-4]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='4')return false; if(d.length===1)return true; if(d[1]!=='0')return false; if(d.length===2)return true; if(!/[0-9]/.test(d[2]))return false; if(d.length===3)return true; return /[0-4]/.test(d[3])&&d.length<=4; } },

  // ── 西武 40050系 ──────────────────────────────────────
  { id:'40050', name:'40050系', company:'西武', cars:10,
    bandColor:null, bandNote:'ドアのみカラフル',
    zones:[
      {car:1, door:4,side:'top',   type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2, door:4,side:'top',   type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:8},(_,i)=>[
        {car:i+3,door:1,side:'top',   type:i+3===10?'partner':'wheelchair'},
        {car:i+3,door:1,side:'bottom',type:i+3===10?'partner':'wheelchair'},
      ]).flat(),
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン',
    priority_text:'全車両 車端部（編成端を除く）',
    // 1桁目4, 2桁目0, 3桁目0-9, 4桁目5,6
    match:   d => d[0]==='4'&&d[1]==='0'&&/[0-9]/.test(d[2]||'x')&&/[56]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='4')return false; if(d.length===1)return true; if(d[1]!=='0')return false; if(d.length===2)return true; if(!/[0-9]/.test(d[2]))return false; if(d.length===3)return true; return /[56]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5000系 5118f/5122f ───────────────────────────
  { id:'5118', name:'5000系（5118f/22f）', company:'東急', cars:8,
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='1'&&/[28]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[1-8]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='1')return false; if(d.length===3)return true; return /[28]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5000系 5119f/5121f ───────────────────────────
  { id:'5119', name:'5000系（5119f/21f）', company:'東急', cars:8,
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:5},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・3〜7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='1'&&/[19]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[1-8]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='1')return false; if(d.length===3)return true; return /[19]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5050系（5177f/78f）──────────────────────────
  { id:'5177', name:'5050系（5177f/78f）', company:'東急', cars:8,
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
           {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat()],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='7'&&/[78]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[1-8]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='7')return false; if(d.length===3)return true; return /[78]/.test(d[3])&&d.length<=4; } },

  // ── 東急 5050系（3桁目5-6）───────────────────────────
  { id:'5050_56', name:'5050系', company:'東急', cars:8,
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&/[56]/.test(d[2]||'x')&&d.length===3,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[1-8]/.test(d[1]))return false; if(d.length===2)return true; return /[56]/.test(d[2])&&d.length<=3; } },

  // ── 東急 5050系（3桁目7・4桁目0-6）──────────────────
  { id:'5050_70_6', name:'5050系', company:'東急', cars:8,
    bandColor:'#e85d6a', bandNote:'赤・ピンク',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d => d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='7'&&/[0-6]/.test(d[3]||'x')&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[1-8]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='7')return false; if(d.length===3)return true; return /[0-6]/.test(d[3])&&d.length<=4; } },

  // ── 東武 50070系 ──────────────────────────────────────
  { id:'50070', name:'50070系', company:'東武', cars:10,
    bandColor:'#E07320', bandNote:'オレンジ',
    zones:[{car:2,door:1,side:'top',type:'wheelchair'},{car:2,door:1,side:'bottom',type:'wheelchair'},
           {car:9,door:4,side:'top',type:'wheelchair'},{car:9,door:4,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車1番ドア・9号車4番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d => d[0]==='5'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&d[3]==='7'&&d.length===4,
    partial: d => { if(!d.length)return true; if(d[0]!=='5')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; if(d[2]!=='0')return false; if(d.length===3)return true; return d[3]==='7'&&d.length<=4; } },

  // ── 西武 6000系 ───────────────────────────────────────
  { id:'6000', name:'6000系', company:'西武', cars:10,
    bandColor:'#2E72B8', bandNote:'青',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:1},{car:3,door:4},{car:4,door:1},{car:5,door:4},{car:6,door:1},{car:7,door:4},{car:8,door:1},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'奇数号車 4番ドア・偶数号車 1番ドア',
    match:   d => d[0]==='6'&&d.length===1,
    partial: d => !d.length||(d.length===1&&d[0]==='6') },

  // ── 東武 9000系 ───────────────────────────────────────
  { id:'9000', name:'9000系', company:'東武', cars:10,
    bandColor:'#8B2A5C', bandNote:'赤紫',
    zones:[{car:2,door:1,side:'top',type:'wheelchair'},{car:2,door:1,side:'bottom',type:'wheelchair'},
           {car:9,door:4,side:'top',type:'wheelchair'},{car:9,door:4,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車1番ドア・9号車4番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d => d[0]==='9'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&d.length===3,
    partial: d => { if(!d.length)return true; if(d[0]!=='9')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; return d[2]==='0'&&d.length<=3; } },

  // ── 東武 9050系 ───────────────────────────────────────
  { id:'9050', name:'9050系', company:'東武', cars:10,
    bandColor:'#8B2A5C', bandNote:'赤紫',
    zones:null, priority_zones:null,
    wheelchair_text:'調査中', priority_text:'調査中',
    match:   d => d[0]==='9'&&/[0-9]/.test(d[1]||'x')&&d[2]==='5'&&d.length===3,
    partial: d => { if(!d.length)return true; if(d[0]!=='9')return false; if(d.length===1)return true; if(!/[0-9]/.test(d[1]))return false; if(d.length===2)return true; return d[2]==='5'&&d.length<=3; } },

  // ── ラッピング（見た目検索のみ）────────────────────────
  { id:'aogaeru', name:'青ガエルラッピング（5050系）', company:'東急', cars:8, visualOnly:true,
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア', priority_text:'1〜7号車 4番ドア・8号車 1番ドア' },
  { id:'sdgs', name:'SDGsトレイン（5050系）', company:'東急', cars:8, visualOnly:true,
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]),
    wheelchair_text:'2号車4番ドア・7号車1番ドア', priority_text:'1〜7号車 4番ドア・8号車 1番ドア' },
  { id:'hito', name:'「人へ、街へ、未来へ。」彩を描く特別な電車', company:'東急', cars:10, visualOnly:true,
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'hikarie', name:'5050系4000番台 Shibuya Hikarie号', company:'東急', cars:10, visualOnly:true,
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'shinkansen', name:'新幹線ラッピング（5050系4000番台）', company:'東急', cars:10, visualOnly:true,
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'ltrain', name:'4代目L-train', company:'西武', cars:10, visualOnly:true,
    zones:[{car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
           ...Array.from({length:7},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
           {car:10,door:1,side:'top',type:'partner'},{car:10,door:1,side:'bottom',type:'partner'}],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン', priority_text:'全車両 車端部（編成端を除く）' },
  { id:'5050_4000_q_visual', name:'5050系4000番台', company:'東急', cars:10, visualOnly:true, note:'Qシートあり',
    zones:[{car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},{car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'}],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    service_note:'この車両の4号車は一部時間帯有料着席保証サービス「Q SEAT」に使用されます。Q SEAT運用時は4号車にはご乗車になれません。' },
];

// ── 丸ノ内線専用 ───────────────────────────────────────
const MARUNOUCHI = {
  name:'2000系', company:'東京メトロ', cars:6, marunouchi:true,
  zones:[
    ...Array.from({length:5},(_,i)=>[{car:i+1,door:1,side:'top',type:'wheelchair'},{car:i+1,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    {car:6,door:4,side:'top',type:'wheelchair'},{car:6,door:4,side:'bottom',type:'wheelchair'},
  ],
  priority_zones:[
    ...Array.from({length:5},(_,i)=>[2,3,4].map(door=>[{car:i+1,door,side:'top'},{car:i+1,door,side:'bottom'}])).flat(2),
    ...[1,2,3].map(door=>[{car:6,door,side:'top'},{car:6,door,side:'bottom'}]).flat(),
  ],
  wheelchair_text:'1〜5号車：池袋寄り（1番ドア側）車端\n6号車：荻窪・方南町寄り（4番ドア側）車端',
  priority_text:'車いすスペース以外の各車両車端部（編成端を除く）',
};

// ── 見た目検索ツリー ───────────────────────────────────
const VISUAL_8 = {
  q:'帯の色は？',
  opts:[
    { label:'赤・ピンク', color:'#e85d6a',
      next:{ q:'車両番号の3桁目（10の位）は？',
        opts:[
          { label:'5か6', result:'5050_56' },
          { label:'7かつ4桁目が0〜6', result:'5050_70_6' },
          { label:'7かつ4桁目が7か8', result:'5177' },
          { label:'1か2', result:'5118' },
        ]}},
    { label:'ブラウン・ゴールド', color:'#8B6914', result:'17080' },
    { label:'帯なし・その他',
      next:{ q:'車両の外観は？',
        opts:[
          { label:'全面緑', result:'aogaeru' },
          { label:'カラフル', result:'sdgs' },
          { label:'青・黄色中心', color:'#3A8CD4', result:'y500' },
        ]}},
  ],
};

const VISUAL_10 = {
  q:'帯の色は？',
  opts:[
    { label:'赤・ピンク', color:'#e85d6a',
      next:{ q:'車両の特徴は？',
        opts:[
          { label:'編成中央に全面赤の車両がある', result:'5050_4000_q_visual' },
          { label:'カラフル', result:'hito' },
          { label:'通常（4000番台）', result:'5050_4000_qno' },
        ]}},
    { label:'ブラウン・ゴールド', color:'#8B6914',
      next:{ q:'車体上部の形は？',
        opts:[
          { label:'丸みがある', result:'10000' },
          { label:'角ばっている', result:'17000' },
        ]}},
    { label:'青', color:'#2E72B8',
      next:{ q:'車体の地の色は？',
        opts:[
          { label:'白地', result:'shinkansen' },
          { label:'グレー地', result:'6000' },
        ]}},
    { label:'ドアのみカラフル',
      next:{ q:'ロングシート部分の席数は？',
        opts:[
          { label:'6席', result:'40000' },
          { label:'7席', result:'40050' },
        ]}},
    { label:'オレンジ', color:'#E07320', result:'50070' },
    { label:'赤紫', color:'#8B2A5C',
      next:{ q:'車両番号の3桁目（10の位）は？',
        opts:[
          { label:'0', result:'9000' },
          { label:'5以上', result:'9050' },
        ]}},
    { label:'帯なし・その他',
      next:{ q:'車両の外観は？',
        opts:[
          { label:'カラフル（人へ街へ未来へ）', result:'hito' },
          { label:'黄色（Hikarie号）', result:'hikarie' },
          { label:'Lions柄', result:'ltrain' },
          { label:'全面ヨコハマネイビーブルー', result:'20000' },
        ]}},
  ],
};
