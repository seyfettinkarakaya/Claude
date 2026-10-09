const assert = require('assert');
const { Sheet, makeEnv, D, PLAN_H, ESKI_H, SEANS_H } = require('./fakegas.cjs');
function fresh() {
  // Plan sütunları karışık sırada + fazladan sütun: başlığa göre bulunmalı.
  const H = ['Yığımlı Mesafe','Sıra','Tarih','Blok','Tekrar','Mesafe','Stil','Tür','Açıklama','Hedef','Dinlen','Alet','Gerçek','Kulaç','Nabız','RPE','MSI','Not'];
  const row = (t,s,b,tk,m,st,tur,a,h,d,al) => { const o={Tarih:D(t),'Sıra':s,Blok:b,Tekrar:tk,Mesafe:m,Stil:st,'Tür':tur,'Açıklama':a,Hedef:h,Dinlen:d,Alet:al}; return H.map(k=> k in o ? o[k] : (k==='Yığımlı Mesafe'? 999 : '')); };
  const plan = new Sheet('Plan', H, [
    row('2026-09-24',2,'PS',4,50,'FR','Drill','catch-up','00:50','00:15',''),
    row('2026-09-26',1,'WU',1,300,'FR','Swim','','06:00','',''),
    row('2026-09-24',1,'WU',1,200,'FR','Swim','Rahat, HR<140','04:45','00:30',''),
    row('2026-09-24',3,'MS',4,100,'FR','Pull','','01:30','00:20','Şamandıra'),
    row('2026-09-20',1,'WU',1,400,'FR','Swim','','','',''),
  ]);
  plan.data[2][2] = '26.09.2026'; // metin tarih
  return makeEnv({ Plan: plan, eski: new Sheet('eski', ESKI_H), seans: new Sheet('seans', SEANS_H) });
}
let env = fresh();
assert.deepStrictEqual(env.call({action:'getDates', token:'bad'}), {ok:false,error:'AUTH',message:'Geçersiz anahtar (token).'});
let r = env.call({action:'getDates'});
assert.ok(r.ok, JSON.stringify(r));
assert.deepStrictEqual(r.data.map(d => [d.tarih, d.setSayisi, d.toplamMesafe]), [
  ['2026-09-20',1,400], ['2026-09-24',3,800], ['2026-09-26',1,300]]);
// Gün kartı önizlemesi: setler Sıra'ya göre, set başına blok/mesafe/hedef süre
assert.deepStrictEqual(r.data[1].setler, [{blok:'WU',mesafe:200,sure:315},{blok:'PS',mesafe:200,sure:260},{blok:'MS',mesafe:400,sure:440}]);
assert.strictEqual(r.data[1].hedefSure, 1015);
r = env.call({action:'getPlan', tarih:'2026-09-24'});
assert.deepStrictEqual(r.data.setler.map(s=>s.sira), [1,2,3]);
assert.deepStrictEqual(r.data.setler[0], {sira:1,blok:'WU',tekrar:1,mesafe:200,stil:'FR',tur:'Swim',aciklama:'Rahat, HR<140',hedef:'04:45',dinlen:'00:30',alet:''});
const payload = { action:'finishSession', tarih:'2026-09-24',
  seans:{sure:'01:24:08',mesafe:600,havuz:25,rpe:8,msi:'sag omuz 1; bel 0.5',aciklama:'Ana set iyi'},
  setler:[ {sira:3,tamamlandi:true,gercek:'01:23.4',kulac:13,nabiz:148,rpe:'',msi:'',not:'Turlar: 01:23.0, 01:23.8'}, {sira:2,tamamlandi:false}, {sira:1,tamamlandi:true,gercek:'',kulac:'',nabiz:'',rpe:'',msi:'',not:''} ] };
// Yazma hatası → hiçbir şey kalıcı olmamalı
env.sheets.seans.failOn='write';
r = env.call(payload);
assert.strictEqual(r.error, 'SERVER'); assert.strictEqual(env.sheets.eski.getLastRow(), 1, 'eski geri alınmalı'); assert.strictEqual(env.sheets.Plan.getLastRow(), 6);
env.sheets.seans.failOn=null;
r = env.call(payload);
assert.ok(r.ok, JSON.stringify(r)); assert.deepStrictEqual(r.data, {yazilanSet:2, silinenSet:3}); // idmanSK 13.2: arşiv yok
assert.ok(!env.sheets.arsiv, 'arsiv sayfası açılmaz');
const eski = env.sheets.eski.data;
assert.strictEqual(eski.length, 3);
assert.deepStrictEqual(eski.slice(1).map(x=>[x[1], x[2]]), [['','WU'],['','MS']], 'orijinal Sıra sırası; Sıra sütunu boş (tablo doldurur)');
assert.strictEqual(eski[2][10], 'Şamandıra');
assert.ok(Math.abs(eski[2][11]*86400 - 83.4) < 1e-6); assert.strictEqual(env.sheets.eski.fmt[2][11], '[h]:mm:ss.0'); // 13.2: ölçülen süre saat haneli, ondalıklı
assert.strictEqual(eski[2][12], 13); assert.strictEqual(eski[2][16], 'Turlar: 01:23.0, 01:23.8'); assert.strictEqual(env.sheets.eski.fmt[2][16], '@');
assert.strictEqual(eski[1][11], '');
const seans = env.sheets.seans.data; assert.strictEqual(seans.length, 2);
assert.ok(Math.abs(seans[1][1]*86400 - 5048) < 1e-6); assert.strictEqual(seans[1][5], 'sag omuz 1; bel 0.5'); assert.strictEqual(seans[1][3], 25); assert.strictEqual(seans[1][4], 8);
assert.strictEqual(env.sheets.Plan.getLastRow(), 3);
// İkinci gönderim → DUPLICATE, veri bozulmaz
r = env.call(payload); assert.strictEqual(r.error, 'DUPLICATE'); assert.strictEqual(env.sheets.eski.data.length, 3); assert.strictEqual(env.sheets.seans.data.length, 2);
// Hiç set tamamlanmadan kapatılan seans ve tekrar gönderim
r = env.call({action:'finishSession', tarih:'2026-09-26', seans:{sure:'00:10:00',mesafe:0,havuz:50,rpe:'',msi:'',aciklama:''}, setler:[{sira:1,tamamlandi:false}]});
assert.deepStrictEqual(r.data, {yazilanSet:0, silinenSet:1});
r = env.call({action:'finishSession', tarih:'2026-09-26', seans:{}, setler:[]}); assert.strictEqual(r.error, 'DUPLICATE');
// Plan'da olmayan sıra
env = fresh(); r = env.call({...payload, setler:[{sira:9,tamamlandi:true}]}); assert.strictEqual(r.error,'PLAN_MISMATCH'); assert.strictEqual(env.sheets.eski.getLastRow(),1);
// Olmayan tarih
r = env.call({...payload, tarih:'2027-01-01'}); assert.strictEqual(r.error,'NOT_FOUND');
// Silme hatası → yine ok (seans kaydedildi), uyarı; plan satırları yerinde
env.sheets.Plan.failOn='delete'; r = env.call(payload); assert.ok(r.ok && /silinemedi/.test(r.data.uyari), JSON.stringify(r));
assert.strictEqual(r.data.silinenSet, 0); assert.strictEqual(env.sheets.seans.getLastRow(), 2);
// Beklenmeyen hata ayrıntısı istemciye gitmez
env = fresh(); env.sheets.seans.failOn = 'write'; r = env.call(payload);
assert.strictEqual(r.error, 'SERVER'); assert.ok(!/write failed/.test(r.message) && /başvuru/.test(r.message), r.message);
// Eksik zorunlu sütun
env = fresh(); env.sheets.Plan.data[0][1]='Sira '; r = env.call({action:'getPlan',tarih:'2026-09-24'}); assert.ok(r.ok, 'normalize edilmiş başlık');
env.sheets.Plan.data[0][1]='X'; r = env.call({action:'getPlan',tarih:'2026-09-24'}); assert.strictEqual(r.error,'MISSING_COLUMN');
// eski: yeni seans 2. satırdan itibaren en üste, set sırası korunur, biçim veri satırından
env = fresh();
const E = env.sheets.eski;
E.data.push(['eski-satir', 9, 'CD', 1, 100, 'FR', 'Swim', '', '', '', '', '', '', '', '', '', '']);
E.fmt.push(E.data[1].map(() => 'VERI'));
r = env.call(payload); assert.ok(r.ok, JSON.stringify(r));
assert.deepStrictEqual(E.data.slice(1).map(x => x[2]), ['WU', 'MS', 'CD'], 'yeni setler üstte, Sıra sırasıyla');
assert.ok(!E.fmt[1].includes('HEADER') && E.fmt[1][12] === 'VERI', 'biçim başlıktan değil ilk veri satırından');
// seans yazımı başarısız → üste eklenen blok tamamen kalkar, tepede boş satır kalmaz
env = fresh(); const E2 = env.sheets.eski;
E2.data.push(['eski-satir', 9, 'CD', 1, 100, 'FR', 'Swim', '', '', '', '', '', '', '', '', '', '']); E2.fmt.push(E2.data[1].map(() => 'VERI'));
env.sheets.seans.failOn = 'write';
r = env.call(payload); assert.strictEqual(r.error, 'SERVER');
assert.deepStrictEqual(E2.data.slice(1).filter(x => x.some(v => v !== '')).map(x => x[0]), ['eski-satir']);
assert.strictEqual(E2.data[1][0], 'eski-satir', 'tepede boş satır kalmamalı');
// İdman anında düzenleme: değişen alanlar eski'ye yazılır; eklenen set (Sıra yok) arkasına
// eklendiği setin hemen arkasına; Set Mesafe/Set Süre boş (tablo hesaplar).
env = fresh();
env.sheets.eski = new Sheet('eski', [...ESKI_H, 'Set Mesafe', 'Set Süre']);
r = env.call({ action: 'finishSession', tarih: '2026-09-24', seans: { sure: '00:40:00', mesafe: 900, havuz: 25, rpe: 7, msi: '', aciklama: '' }, setler: [
  { sira: 1, tamamlandi: true, gercek: '', not: '' },
  { sira: null, eklendi: true, tamamlandi: true, gercek: '00:45.0', not: 'idmanda eklendi', plan: { blok: 'PS', tekrar: 2, mesafe: 50, stil: 'BK', tur: 'Kick', aciklama: 'yeni', hedef: '01:00', dinlen: '00:15', alet: 'Finn' } },
  { sira: 2, tamamlandi: false },
  { sira: 3, tamamlandi: true, gercek: '01:25.0', not: 'Plan: 4×100 → 6×100, Hedef 1:30 → 1:25', plan: { tekrar: 6, hedef: '01:25' } },
  { sira: null, eklendi: true, tamamlandi: false, plan: { tekrar: 1, mesafe: 100 } },
] });
assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(r.data.yazilanSet, 3);
{
  const X = env.sheets.eski; const xh = (k) => X.data[0].indexOf(k);
  const rows = X.data.slice(1).map((x) => [x[xh('Sıra')], x[xh('Blok')], x[xh('Tekrar')], x[xh('Mesafe')], x[xh('Stil')], x[xh('Tür')], x[xh('Alet')], x[xh('Not')], x[xh('Set Mesafe')]]);
  assert.deepStrictEqual(rows, [
    ['', 'WU', 1, 200, 'FR', 'Swim', '', '', ''],
    ['', 'PS', 2, 50, 'BK', 'Kick', 'Finn', 'idmanda eklendi', ''],
    ['', 'MS', 6, 100, 'FR', 'Pull', 'Şamandıra', 'Plan: 4×100 → 6×100, Hedef 1:30 → 1:25', ''],
  ]);
  assert.ok(Object.prototype.toString.call(X.data[2][xh('Tarih')]) === '[object Date]', 'eklenen sette tarih');
  assert.ok(Math.abs(X.data[3][xh('Hedef')] * 86400 - 85) < 1e-6);
  assert.ok(Math.abs(X.data[2][xh('Dinlen')] * 86400 - 15) < 1e-6);
  assert.ok(!env.sheets.arsiv);
}
// Eklenen set tamamlanmadıysa yazılmaz; plan alanı dışındaki anahtarlar yok sayılır
env = fresh();
r = env.call({ action: 'finishSession', tarih: '2026-09-24', seans: { sure: '00:10:00', mesafe: 200, havuz: 25, rpe: '', msi: '', aciklama: '' }, setler: [
  { sira: 1, tamamlandi: true, plan: { gercek: 'x', Tarih: 'y', tekrar: 1 } },
  { sira: null, eklendi: true, tamamlandi: false, plan: { tekrar: 1, mesafe: 100 } },
] });
assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(env.sheets.eski.getLastRow(), 2);
assert.ok(Object.prototype.toString.call(env.sheets.eski.data[1][0]) === '[object Date]');
// 13.2: tablonun hesapladığı sütunlar (Sıra, Set Mesafe, Set Süre, Hafta…) — komşu satırdaki formül yeni satırlara kopyalanır,
// değer yazılmaz; diğer sütunlar kaymaz; idmanda değişen Hedef [h]:mm:ss biçiminde
env = fresh();
{
  const X = new Sheet('eski', [...ESKI_H, 'Set Mesafe', 'Set Süre', 'Hafta']);
  X.data.push(ESKI_H.map(() => '').concat(['', '', '']));
  X.fmt.push(X.data[1].map(() => '0.###############'));
  X.data[1][0] = new (env.CDate)(Date.UTC(2026, 8, 20)); X.data[1][2] = 'WU';
  X.getRange(2, 18, 1, 3).setFormulasR1C1([['=RC4*RC5', '=RC4*(RC9+RC10)', '=WEEKNUM(RC1)']]);
  env.sheets.eski = X;
  r = env.call({ action: 'finishSession', tarih: '2026-09-24', seans: { sure: '00:40:00', mesafe: 900, havuz: 25, rpe: 7, msi: '', aciklama: '' }, setler: [
    { sira: 1, tamamlandi: true, gercek: '04:01.5', not: '' },
    { sira: 3, tamamlandi: true, gercek: '01:25.0', not: '', plan: { hedef: '01:25' } },
  ] });
  assert.ok(r.ok, JSON.stringify(r));
  const xh = (k) => X.data[0].indexOf(k);
  assert.deepStrictEqual(X.formulas[`2,${xh('Set Mesafe') + 1}`], '=RC4*RC5', 'yeni satıra formül');
  assert.deepStrictEqual(X.formulas[`3,${xh('Hafta') + 1}`], '=WEEKNUM(RC1)');
  assert.strictEqual(X.data[3][xh('Blok')], 'WU', 'eski satır yerinde, kaymadı');
  assert.strictEqual(X.data[1][xh('Blok')], 'WU'); assert.strictEqual(X.data[2][xh('Blok')], 'MS');
  assert.strictEqual(X.fmt[2][xh('Hedef')], '[h]:mm:ss', 'idmanda değişen hedef saat haneli');
  assert.strictEqual(X.fmt[1][xh('Gerçek')], '[h]:mm:ss.0');
  assert.strictEqual(env.sheets.seans.fmt[1][1], '[h]:mm:ss.0', 'seans süresi ölçülen');
}
console.log('idman.gs (yüzme) testleri: TAMAM');
