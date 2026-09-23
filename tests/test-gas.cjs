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
assert.deepStrictEqual(r.data, [
  {tarih:'2026-09-20',setSayisi:1,toplamMesafe:400},
  {tarih:'2026-09-24',setSayisi:3,toplamMesafe:800},
  {tarih:'2026-09-26',setSayisi:1,toplamMesafe:300}]);
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
assert.ok(r.ok, JSON.stringify(r)); assert.deepStrictEqual(r.data, {yazilanSet:2, silinenSet:3});
const eski = env.sheets.eski.data;
assert.strictEqual(eski.length, 3);
assert.deepStrictEqual(eski.slice(1).map(x=>x[1]), [1,3], 'orijinal Sıra sırası');
assert.strictEqual(eski[2][10], 'Şamandıra');
assert.ok(Math.abs(eski[2][11]*86400 - 83.4) < 1e-6); assert.strictEqual(env.sheets.eski.fmt[2][11], '[mm]:ss.0');
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
// Silme hatası → yine ok, uyarı
env.sheets.Plan.failOn='delete'; r = env.call(payload); assert.ok(r.ok && r.data.uyari, JSON.stringify(r));
// Eksik zorunlu sütun
env = fresh(); env.sheets.Plan.data[0][1]='Sira '; r = env.call({action:'getPlan',tarih:'2026-09-24'}); assert.ok(r.ok, 'normalize edilmiş başlık');
env.sheets.Plan.data[0][1]='X'; r = env.call({action:'getPlan',tarih:'2026-09-24'}); assert.strictEqual(r.error,'MISSING_COLUMN');
console.log('Code.gs testleri: TAMAM');
