// ═══════════════════════════════════════════════════════
// 車両データ定義
// zones[].type: 'wheelchair' | 'partner' | 'toilet'
// priority_zones: [{car,door,side}] | null
// dir_left / dir_right: 方面表示文字列
// ═══════════════════════════════════════════════════════

// 車端部優先席：各号車のドア1列目とドア4列目のみ、編成端（1号車1番・最終号車4番）を除く
function allPriority(cars) {
  const r = [];
  for (let c = 1; c <= cars; c++) {
    for (const s of ['top','bottom']) {
      // 1番ドア側（編成端の1号車1番は除く）
      if (!(c===1)) r.push({car:c,door:1,side:s});
      // 4番ドア側（編成端の最終号車4番は除く）
      if (!(c===cars)) r.push({car:c,door:4,side:s});
    }
  }
  return r;
}
function doorPriority(list) {
  return list.flatMap(({car,door})=>[{car,door,side:'top'},{car,door,side:'bottom'}]);
}

// ── 共通ゾーン定義 ────────────────────────────────────
const WC_2_4_7_1 = [
  {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
  {car:7,door:1,side:'top',type:'wheelchair'},{car:7,door:1,side:'bottom',type:'wheelchair'},
];
const WC_2_4_9_1 = [
  {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
  {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'},
];
const PRI_8_STD  = doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:1}]);
const PRI_10_STD = doorPriority([{car:1,door:4},{car:2,door:4},{car:3,door:4},{car:4,door:4},{car:5,door:4},{car:6,door:4},{car:7,door:4},{car:8,door:4},{car:9,door:4},{car:10,door:1}]);

const TRAINS = [

  // ── Y500系 ─────────────────────────────────────────
  { id:'y500', name:'Y500系', company:'横浜高速鉄道', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1,
    priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d=>d[0]==='Y'&&d.length===1,
    partial: d=>!d.length||(d.length===1&&d[0]==='Y') },

  // ── 10000系 ────────────────────────────────────────
  { id:'10000', name:'10000系', company:'東京メトロ', cars:10,
    dir_left:'小手指・飯能/和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/新木場方面',
    zones: WC_2_4_9_1,
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d=>d[0]==='1'&&d[1]==='0'&&d.length===2,
    partial: d=>{if(!d.length)return true;if(d[0]!=='1')return false;if(d.length===1)return true;return d[1]==='0'&&d.length<=2;} },

  // ── 17000系 ────────────────────────────────────────
  { id:'17000', name:'17000系', company:'東京メトロ', cars:10,
    dir_left:'小手指・飯能/和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/新木場方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:8},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜10号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d=>d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='0'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='1')return false;if(d.length===1)return true;if(d[1]!=='7')return false;if(d.length===2)return true;if(!/[0-9]/.test(d[2]))return false;if(d.length===3)return true;return d[3]==='0'&&d.length<=4;} },

  // ── 17080系（〜第9編成、4桁目8）────────────────────
  { id:'17080', name:'17080系', company:'東京メトロ', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: allPriority(8),
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d=>d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='8'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='1')return false;if(d.length===1)return true;if(d[1]!=='7')return false;if(d.length===2)return true;if(!/[0-9]/.test(d[2]))return false;if(d.length===3)return true;return d[3]==='8'&&d.length<=4;} },

  // ── 17080系（第10編成〜、4桁目9）────────────────────
  { id:'17090', name:'17080系', company:'東京メトロ', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: allPriority(8),
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d=>d[0]==='1'&&d[1]==='7'&&/[0-9]/.test(d[2]||'x')&&d[3]==='9'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='1')return false;if(d.length===1)return true;if(d[1]!=='7')return false;if(d.length===2)return true;if(!/[0-9]/.test(d[2]))return false;if(d.length===3)return true;return d[3]==='9'&&d.length<=4;} },

  // ── 20000系 ────────────────────────────────────────
  { id:'20000', name:'20000系', company:'相鉄', cars:10,
    dir_left:'小竹向原・和光市方面',
    dir_right:'新横浜・湘南台・海老名方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:9},(_,i)=>[{car:i+2,door:1,side:'top',type:'wheelchair'},{car:i+2,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1号車は4番ドア、2〜10号車は1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    match:   d=>d[0]==='2'&&d.length===1,
    partial: d=>!d.length||(d.length===1&&d[0]==='2') },

  // ── 5050系4000番台（3桁目0、Qシートなし）────────────
  // 1桁目4, 2桁目0-9, 3桁目0, 4桁目0-9, 5桁目Y
  { id:'5050_4000_qno', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートなし',
    dir_left:'海老名・湘南台/元町・中華街方面',
    dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1,
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    // 1桁目4, 2桁目0-9, 3桁目0, 4桁目1-9 で4桁確定
    match:   d=>d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&/[1-9]/.test(d[3]||'x')&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='4')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='0')return false;if(d.length===3)return true;return /[1-9]/.test(d[3])&&d.length<=4;} },

  // ── 5050系4000番台（3桁目1・4桁目0,1、Qシートなし）──
  { id:'5050_4000_qno2', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートなし',
    dir_left:'海老名・湘南台/元町・中華街方面',
    dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1,
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d=>d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='1'&&/[01]/.test(d[3]||'x')&&d[4]==='Y'&&d.length===5,
    partial: d=>{if(!d.length)return true;if(d[0]!=='4')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='1')return false;if(d.length===3)return true;if(!/[01]/.test(d[3]))return false;if(d.length===4)return true;return d[4]==='Y'&&d.length<=5;} },

  // ── 5050系4000番台（3桁目1・4桁目2-5、Qシートあり）──
  { id:'5050_4000_q', name:'5050系4000番台', company:'東急', cars:10, note:'Qシートあり',
    dir_left:'海老名・湘南台/元町・中華街方面',
    dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1,
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    service_note:'この車両の4号車は一部時間帯有料着席保証サービス「Q SEAT」に使用されます。Q SEAT運用時は4号車にはご乗車になれません。',
    match:   d=>d[0]==='4'&&/[0-9]/.test(d[1]||'x')&&d[2]==='1'&&/[2-5]/.test(d[3]||'x')&&d[4]==='Y'&&d.length===5,
    partial: d=>{if(!d.length)return true;if(d[0]!=='4')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='1')return false;if(d.length===3)return true;if(!/[2-5]/.test(d[3]))return false;if(d.length===4)return true;return d[4]==='Y'&&d.length<=5;} },

  // ── 40000系（3桁目0-9、4桁目1-6）────────────────────
  { id:'40000', name:'40000系', company:'西武', cars:10,
    dir_left:'小手指・飯能・西武秩父方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:1, door:1,side:'top',   type:'wheelchair'},{car:1,door:1,side:'bottom',type:'wheelchair'},
      {car:2, door:4,side:'top',   type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      {car:4, door:4,side:'top',   type:'wheelchair'},
      {car:4, door:4,side:'bottom',type:'toilet'},
      {car:9, door:1,side:'top',   type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'},
      {car:10,door:3,side:'top',   type:'partner'},{car:10,door:3,side:'bottom',type:'partner'},
      {car:10,door:4,side:'top',   type:'partner'},{car:10,door:4,side:'bottom',type:'partner'},
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1号車1番ドア・2号車4番ドア・4号車4番ドア（進行左側）・9号車1番ドア',
    priority_text:'全車両 車端部（編成端を除く）',
    diagram_note:'4号車4番ドア：進行左側が車いすスペース、進行右側が多機能トイレ',
    service_note:'この車両は有料座席指定列車「S-TRAIN」に使用されます。S-TRAIN運用時には指定された座席をご利用ください。',
    // 1桁目4, 2桁目0, 3桁目0-9, 4桁目0 で4桁確定
    match:   d=>d[0]==='4'&&d[1]==='0'&&/[0-9]/.test(d[2]||'x')&&d[3]==='0'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='4')return false;if(d.length===1)return true;if(d[1]!=='0')return false;if(d.length===2)return true;if(!/[0-9]/.test(d[2]))return false;if(d.length===3)return true;return d[3]==='0'&&d.length<=4;} },

  // ── 40050系（3桁目0-9、4桁目5,6）────────────────────
  { id:'40050', name:'40050系', company:'西武', cars:10,
    dir_left:'小手指・飯能/和光市方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:1, door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2, door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:8},(_,i)=>[
        {car:i+3,door:1,side:'top',   type:i+3===10?'partner':'wheelchair'},
        {car:i+3,door:1,side:'bottom',type:i+3===10?'partner':'wheelchair'},
      ]).flat(),
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン',
    priority_text:'全車両 車端部（編成端を除く）',
    // 1桁目4, 2桁目0, 3桁目0-9, 4桁目5,6, 5桁目1-9 で5桁確定
    match:   d=>d[0]==='4'&&d[1]==='0'&&/[0-9]/.test(d[2]||'x')&&/[56]/.test(d[3]||'x')&&/[1-9]/.test(d[4]||'x')&&d.length===5,
    partial: d=>{if(!d.length)return true;if(d[0]!=='4')return false;if(d.length===1)return true;if(d[1]!=='0')return false;if(d.length===2)return true;if(!/[0-9]/.test(d[2]))return false;if(d.length===3)return true;if(!/[56]/.test(d[3]))return false;if(d.length===4)return true;return /[1-9]/.test(d[4])&&d.length<=5;} },

  // ── 5000系 5118f/5122f ────────────────────────────
  { id:'5118', name:'5000系（5118f/22f）', company:'東急', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1,
    priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    // 下2桁が18または22（3桁目1、4桁目8か2）
    match:   d=>d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='1'&&/[28]/.test(d[3]||'x')&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='5')return false;if(d.length===1)return true;if(!/[1-8]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='1')return false;if(d.length===3)return true;return /[28]/.test(d[3])&&d.length<=4;} },

  // ── 5000系 5119f/5121f ────────────────────────────
  { id:'5119', name:'5000系（5119f/21f）', company:'東急', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones:[
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:5},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・3〜7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    // 下2桁が19または21（3桁目1かつ4桁目9、または3桁目2かつ4桁目1）
    match:   d=>d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&((d[2]==='1'&&d[3]==='9')||(d[2]==='2'&&d[3]==='1'))&&d.length===4,
    partial: d=>{
      if(!d.length)return true;
      if(d[0]!=='5')return false;
      if(d.length===1)return true;
      if(!/[1-8]/.test(d[1]))return false;
      if(d.length===2)return true;
      if(d[2]!=='1'&&d[2]!=='2')return false;
      if(d.length===3)return true;
      if(d[2]==='1'&&d[3]!=='9')return false;
      if(d[2]==='2'&&d[3]!=='1')return false;
      return d.length<=4;
    } },

  // ── 5050系（5177f/78f）────────────────────────────
  { id:'5177', name:'5050系（5177f/78f）', company:'東急', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:6},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
    ],
    priority_zones: PRI_8_STD,
    wheelchair_text:'1・2号車は4番ドア、3〜8号車は1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d=>d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='7'&&/[78]/.test(d[3]||'x')&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='5')return false;if(d.length===1)return true;if(!/[1-8]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='7')return false;if(d.length===3)return true;return /[78]/.test(d[3])&&d.length<=4;} },

  // ── 5050系（3桁目5-6）────────────────────────────
  { id:'5050_56', name:'5050系', company:'東急', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1,
    priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d=>d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&/[56]/.test(d[2]||'x')&&d.length===3,
    partial: d=>{if(!d.length)return true;if(d[0]!=='5')return false;if(d.length===1)return true;if(!/[1-8]/.test(d[1]))return false;if(d.length===2)return true;return /[56]/.test(d[2])&&d.length<=3;} },

  // ── 5050系（3桁目7・4桁目0-6）────────────────────
  { id:'5050_70_6', name:'5050系', company:'東急', cars:8,
    dir_left:'小手指・飯能/和光市・志木方面',
    dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1,
    priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア',
    priority_text:'1〜7号車 4番ドア・8号車 1番ドア',
    match:   d=>d[0]==='5'&&/[1-8]/.test(d[1]||'x')&&d[2]==='7'&&/[0-6]/.test(d[3]||'x')&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='5')return false;if(d.length===1)return true;if(!/[1-8]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='7')return false;if(d.length===3)return true;return /[0-6]/.test(d[3])&&d.length<=4;} },

  // ── 50070系 ────────────────────────────────────────
  { id:'50070', name:'50070系', company:'東武', cars:10,
    dir_left:'和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:2,door:1,side:'top',type:'wheelchair'},{car:2,door:1,side:'bottom',type:'wheelchair'},
      {car:9,door:4,side:'top',type:'wheelchair'},{car:9,door:4,side:'bottom',type:'wheelchair'},
    ],
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車1番ドア・9号車4番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d=>d[0]==='5'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&d[3]==='7'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='5')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='0')return false;if(d.length===3)return true;return d[3]==='7'&&d.length<=4;} },

  // ── 6000系 ─────────────────────────────────────────
  { id:'6000', name:'6000系', company:'西武', cars:10,
    dir_left:'小手指・飯能/和光市方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      {car:9,door:1,side:'top',type:'wheelchair'},{car:9,door:1,side:'bottom',type:'wheelchair'},
    ],
    priority_zones: doorPriority([{car:1,door:4},{car:2,door:1},{car:3,door:4},{car:4,door:1},{car:5,door:4},{car:6,door:1},{car:7,door:4},{car:8,door:1},{car:9,door:4},{car:10,door:1}]),
    wheelchair_text:'2号車4番ドア・9号車1番ドア',
    priority_text:'奇数号車 4番ドア・偶数号車 1番ドア',
    match:   d=>d[0]==='6'&&d.length===1,
    partial: d=>!d.length||(d.length===1&&d[0]==='6') },

  // ── 9000系（4桁目2-8）─────────────────────────────
  { id:'9000', name:'9000系', company:'東武', cars:10,
    dir_left:'和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:2,door:1,side:'top',type:'wheelchair'},{car:2,door:1,side:'bottom',type:'wheelchair'},
      {car:9,door:4,side:'top',type:'wheelchair'},{car:9,door:4,side:'bottom',type:'wheelchair'},
    ],
    priority_zones: PRI_10_STD,
    wheelchair_text:'2号車1番ドア・9号車4番ドア',
    priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    match:   d=>d[0]==='9'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&/[2-8]/.test(d[3]||'x')&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='9')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='0')return false;if(d.length===3)return true;return /[2-8]/.test(d[3])&&d.length<=4;} },

  // ── 90000系（4桁目0）──────────────────────────────
  { id:'90000', name:'90000系', company:'東武', cars:10,
    dir_left:'和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones: null, priority_zones: null,
    wheelchair_text:'調査中', priority_text:'調査中',
    match:   d=>d[0]==='9'&&/[0-9]/.test(d[1]||'x')&&d[2]==='0'&&d[3]==='0'&&d.length===4,
    partial: d=>{if(!d.length)return true;if(d[0]!=='9')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;if(d[2]!=='0')return false;if(d.length===3)return true;return d[3]==='0'&&d.length<=4;} },

  // ── 9050系（3桁目5）───────────────────────────────
  { id:'9050', name:'9050系', company:'東武', cars:10,
    dir_left:'和光市・川越市・森林公園方面',
    dir_right:'元町・中華街/豊洲・新木場方面',
    zones: null, priority_zones: null,
    wheelchair_text:'調査中', priority_text:'調査中',
    match:   d=>d[0]==='9'&&/[0-9]/.test(d[1]||'x')&&d[2]==='5'&&d.length===3,
    partial: d=>{if(!d.length)return true;if(d[0]!=='9')return false;if(d.length===1)return true;if(!/[0-9]/.test(d[1]))return false;if(d.length===2)return true;return d[2]==='5'&&d.length<=3;} },

  // ── ラッピング（見た目検索のみ）────────────────────
  { id:'aogaeru', name:'青ガエルラッピング（5050系）', company:'東急', cars:8, visualOnly:true,
    dir_left:'小手指・飯能/和光市・志木方面', dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1, priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア', priority_text:'1〜7号車 4番ドア・8号車 1番ドア' },
  { id:'sdgs', name:'SDGsトレイン（5050系）', company:'東急', cars:8, visualOnly:true,
    dir_left:'小手指・飯能/和光市・志木方面', dir_right:'元町・中華街方面',
    zones: WC_2_4_7_1, priority_zones: PRI_8_STD,
    wheelchair_text:'2号車4番ドア・7号車1番ドア', priority_text:'1〜7号車 4番ドア・8号車 1番ドア' },
  { id:'hito', name:'「人へ、街へ、未来へ。」彩を描く特別な電車', company:'東急', cars:10, visualOnly:true,
    dir_left:'海老名・湘南台/元町・中華街方面', dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1, priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'hikarie', name:'5050系4000番台 Shibuya Hikarie号', company:'東急', cars:10, visualOnly:true,
    dir_left:'海老名・湘南台/元町・中華街方面', dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1, priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'shinkansen', name:'新幹線ラッピング（5050系4000番台）', company:'東急', cars:10, visualOnly:true,
    dir_left:'海老名・湘南台/元町・中華街方面', dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1, priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア' },
  { id:'ltrain', name:'4代目L-train', company:'西武', cars:10, visualOnly:true,
    dir_left:'小手指・飯能/和光市方面', dir_right:'元町・中華街/豊洲・新木場方面',
    zones:[
      {car:1,door:4,side:'top',type:'wheelchair'},{car:1,door:4,side:'bottom',type:'wheelchair'},
      {car:2,door:4,side:'top',type:'wheelchair'},{car:2,door:4,side:'bottom',type:'wheelchair'},
      ...Array.from({length:7},(_,i)=>[{car:i+3,door:1,side:'top',type:'wheelchair'},{car:i+3,door:1,side:'bottom',type:'wheelchair'}]).flat(),
      {car:10,door:1,side:'top',type:'partner'},{car:10,door:1,side:'bottom',type:'partner'},
    ],
    priority_zones: allPriority(10),
    wheelchair_text:'1・2号車は4番ドア、3〜9号車は1番ドア、10号車はパートナーゾーン',
    priority_text:'全車両 車端部（編成端を除く）' },
  { id:'5050_4000_q_visual', name:'5050系4000番台', company:'東急', cars:10, visualOnly:true, note:'Qシートあり',
    dir_left:'海老名・湘南台/元町・中華街方面', dir_right:'小手指・飯能/和光市・川越市・森林公園方面',
    zones: WC_2_4_9_1, priority_zones: PRI_10_STD,
    wheelchair_text:'2号車4番ドア・9号車1番ドア', priority_text:'1〜9号車 4番ドア・10号車 1番ドア',
    service_note:'この車両の4号車は一部時間帯有料着席保証サービス「Q SEAT」に使用されます。Q SEAT運用時は4号車にはご乗車になれません。' },
];

// ── 丸ノ内線 ───────────────────────────────────────────
const MARUNOUCHI = {
  name:'2000系', company:'東京メトロ', cars:6, marunouchi:true, doors:3,
  dir_left:'池袋方面',
  dir_right:'荻窪・方南町方面',
  zones:[
    // 1号車1番ドアは編成端なので除外、2〜5号車の1番ドアのみ
    ...Array.from({length:4},(_,i)=>[
      {car:i+2,door:1,side:'top',   type:'wheelchair'},
      {car:i+2,door:1,side:'bottom',type:'wheelchair'},
    ]).flat(),
    // 6号車3番ドアは編成端なので除外、6号車の2番ドアのみ
    {car:6,door:2,side:'top',   type:'wheelchair'},
    {car:6,door:2,side:'bottom',type:'wheelchair'},
  ],
  priority_zones:[
    ...Array.from({length:5},(_,i)=>[
      {car:i+1,door:3,side:'top'},
      {car:i+1,door:3,side:'bottom'},
    ]).flat(),
    {car:6,door:1,side:'top'},
    {car:6,door:1,side:'bottom'},
  ],
  wheelchair_text:'1〜5号車：池袋寄り（1番ドア側）車端\n6号車：荻窪・方南町寄り（3番ドア側）車端',
  priority_text:'車いすスペース以外の各車両車端部（編成端を除く）',
};

// ── 見た目検索ツリー ───────────────────────────────────
// 条件分岐は表の通り、帯色の順番のみ変更可
const VISUAL_8 = {
  q:'帯の色・外観は？',
  opts:[
    { label:'赤・ピンク', color:'#e85d6a',
      next:{ q:'車両番号の下2桁は？',
        opts:[
          { label:'18 または 22', result:'5118'     },
          { label:'19 または 21', result:'5119'     },
          { label:'77 または 78', result:'5177'     },
          { label:'上記以外',     result:'5050_56'  },
        ]}},
    { label:'ブラウン・ゴールド', color:'#8B6914', result:'17080' },
    { label:'全面緑', result:'aogaeru' },
    { label:'全面カラフル', result:'sdgs' },
    { label:'黄・青中心（帯なし）', color:'#3A8CD4', result:'y500' },
  ],
};

const VISUAL_10 = {
  q:'帯の色・外観は？',
  opts:[
    { label:'赤・ピンク', color:'#e85d6a',
      next:{ q:'編成中央に全面赤の車両（Qシート）はある？',
        opts:[
          { label:'ある', result:'5050_4000_q_visual' },
          { label:'ない', result:'5050_4000_qno'      },
        ]}},
    { label:'全面カラフル（人へ街へ未来へ）', result:'hito' },
    { label:'白地に青線（新幹線デザイン）', result:'shinkansen' },
    { label:'ブラウン・ゴールド', color:'#8B6914',
      next:{ q:'車体上部の形は？',
        opts:[
          { label:'丸い',      result:'10000' },
          { label:'角張っている', result:'17000' },
        ]}},
    { label:'ドアだけカラフル',
      next:{ q:'ロングシート部分の席数は？',
        opts:[
          { label:'6席', result:'40000' },
          { label:'7席', result:'40050' },
        ]}},
    { label:'Lions柄', result:'ltrain' },
    { label:'青（銀またはグレー地）', color:'#2E72B8', result:'6000' },
    { label:'全面ヨコハマネイビーブルー', color:'#1A3A6B', result:'20000' },
    { label:'オレンジ', color:'#E07320', result:'50070' },
    { label:'赤紫', color:'#8B2A5C',
      next:{ q:'車号の3桁目は？',
        opts:[
          { label:'0', result:'9000' },
          { label:'5', result:'9050' },
        ]}},
    { label:'ドアだけ青', result:'90000' },
  ],
};
