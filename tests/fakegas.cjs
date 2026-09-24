const fs = require('fs'); const vm = require('vm'); const crypto = require('crypto');
function lastNonEmpty(rows){ for(let i=rows.length-1;i>=0;i--) if(rows[i].some(v=>v!==''&&v!=null)) return i+1; return 0; }
class Sheet {
  constructor(name, headers, rows=[]) { this.name=name; this.data=[headers.slice(), ...rows.map(r=>r.slice())]; this.fmt=this.data.map(r=>r.map(()=> '0.###############')); this.maxRows=Math.max(1000,this.data.length); this.w=headers.length; this.failOn=null; }
  _row(i){ while(this.data.length<=i){ this.data.push(Array(this.w).fill('')); this.fmt.push(Array(this.w).fill('0.###############')); } return this.data[i]; }
  getLastRow(){ return lastNonEmpty(this.data); }
  getLastColumn(){ return this.w; }
  getMaxRows(){ return this.maxRows; }
  insertRowsAfter(a,n){ this.maxRows+=n; }
  insertRowsBefore(r,n){ for(let i=0;i<n;i++){ this.data.splice(r-1,0,Array(this.w).fill('')); this.fmt.splice(r-1,0,Array(this.w).fill('HEADER')); } this.maxRows+=n; }
  deleteRow(r){ this.deleteRows(r,1); }
  deleteRows(r,n){ if(this.failOn==='delete') throw new Error('delete failed'); this.data.splice(r-1,n); this.fmt.splice(r-1,n); }
  getRange(r,c,nr=1,nc=1){ const sh=this; return {
    getValues(){ return Array.from({length:nr},(_,i)=>{const row=sh.data[r-1+i]||[]; return Array.from({length:nc},(_,j)=> row[c-1+j]===undefined?'':row[c-1+j]);}); },
    copyFormatToRange(target,c1,c2,r1,r2){ const src=sh.fmt[r-1]; for(let rr=r1;rr<=r2;rr++){ sh._row(rr-1); for(let cc=c1;cc<=c2;cc++) sh.fmt[rr-1][cc-1]=src[cc-1]; } },
    getDisplayValues(){ return this.getValues().map(row=>row.map(v=> v instanceof Date? v.toISOString() : String(v))); },
    getNumberFormats(){ return Array.from({length:nr},(_,i)=>{sh._row(r-1+i); return Array.from({length:nc},(_,j)=>sh.fmt[r-1+i][c-1+j]);}); },
    setNumberFormats(f){ f.forEach((row,i)=>{sh._row(r-1+i); row.forEach((v,j)=>{ if(typeof v!=='string') throw new Error('bad fmt'); sh.fmt[r-1+i][c-1+j]=v;});}); return this; },
    setValues(v){ if(sh.failOn==='write') throw new Error('write failed'); if(v.length!==nr||v[0].length!==nc) throw new Error('dim mismatch'); v.forEach((row,i)=>{const R=sh._row(r-1+i); row.forEach((x,j)=>R[c-1+j]=x);}); return this; },
  }; }
}
function makeEnv(sheets, token='secret') {
  const ss = { getSheetByName: n => sheets[n]||null, getSpreadsheetTimeZone: ()=>'UTC' };
  const pad=n=>String(n).padStart(2,'0');
  const ctx = {
    __init: true,
    SpreadsheetApp: { getActiveSpreadsheet: ()=>ss, flush(){} },
    Utilities: { formatDate:(d)=>`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`, parseDate:(s)=>{const [y,m,d]=s.split('-').map(Number); return new (vm.runInContext('Date',ctx))(Date.UTC(y,m-1,d));}, getUuid:()=>crypto.randomUUID() },
    PropertiesService: { getScriptProperties: ()=>({ getProperty:()=>token, setProperty(){} }) },
    LockService: { getDocumentLock: ()=>({ tryLock:()=>true, releaseLock(){} }), getScriptLock: ()=>null },
    ContentService: { createTextOutput: s=>({ s, setMimeType(){ return this; } }), MimeType:{JSON:'json'} },
    Logger: { log(){} }, console,
  };
  vm.createContext(ctx);
  const CDate = vm.runInContext('Date', ctx);
  for (const sh of Object.values(sheets)) sh.data = sh.data.map(r=>r.map(v=> v instanceof Date ? new CDate(v.getTime()) : v));
  vm.runInContext(fs.readFileSync(require('path').join(__dirname, '..', 'Code.gs'),'utf8'), ctx);
  return { ctx, call: req => JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({token, ...req})}}).s), sheets };
}
const D = s => { const [y,m,d]=s.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); };
const PLAN_H = ['Tarih','Sıra','Blok','Tekrar','Mesafe','Stil','Tür','Açıklama','Hedef','Dinlen','Alet','Gerçek','Kulaç','Nabız','RPE','MSI','Not','Yığımlı Mesafe'];
const ESKI_H = ['Tarih','Sıra','Blok','Tekrar','Mesafe','Stil','Tür','Açıklama','Hedef','Dinlen','Alet','Gerçek','Kulaç','Nabız','RPE','MSI','Not'];
const SEANS_H = ['Tarih','Süre','Mesafe','Havuz','RPE','MSI','Açıklama'];
module.exports = { Sheet, makeEnv, D, PLAN_H, ESKI_H, SEANS_H };
