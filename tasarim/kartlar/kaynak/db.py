# hareketdb.js üretir: free-exercise-db dizini (anlatım İngilizce) + Türkçe anlatımlar + uygulamada gömülü fotoğraflar.
#   python3 tasarim/kartlar/kaynak/db.py <exercises.json yolu>
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tr import TR
src = json.load(open(sys.argv[1]))
yerel = sorted({f.rsplit('_', 1)[0] for f in os.listdir('img/hareket') if f.endswith('.webp')})
db = [[x['id'], x['name'], x.get('equipment') or '', x['primaryMuscles'], x['secondaryMuscles'], x['instructions']] for x in src]
out = ['// Hareket bilgi kartları: free-exercise-db (yuhonas, Unlicense / kamu malı), üretilmiş dosya — elle düzenleme.',
       '// Üretici: tasarim/kartlar/kaynak/db.py. Türkçe anlatımlar uygulamaya özel (tasarim/kartlar/kaynak/tr.py).',
       '// DB satırı: [kimlik, ad, ekipman, birincil kaslar, ikincil kaslar, İngilizce adımlar]',
       'export const DB = ' + json.dumps(db, ensure_ascii=False, separators=(',', ':')) + ';',
       '/** Fotoğrafı uygulamada (img/hareket/) olan hareketler. */',
       'export const YEREL = new Set(' + json.dumps(yerel) + ');',
       'export const TR = ' + json.dumps(TR, ensure_ascii=False, separators=(',', ':')) + ';', '']
open('hareketdb.js', 'w').write('\n'.join(out))
print(len(db), 'hareket ·', len(yerel), 'yerel fotoğraf ·', len(TR), 'Türkçe ·', os.path.getsize('hareketdb.js') // 1024, 'KB')
missing = [k for k in TR if k not in yerel]
print('Türkçe ama fotoğrafsız:', missing)
