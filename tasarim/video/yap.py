# videolar.js üretir: tasarim/video/liste.csv (hareket → YouTube videosu) → uygulamaya gömülü liste.
#   python3 tasarim/video/yap.py
# Satır: ad → [video kimliği, biçim ('s' = Shorts dikey, 'w' = yatay), kaynak, başlangıç sn, bitiş sn]
import csv, json, os, re
kok = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out = {}
for r in csv.DictReader(open(os.path.join(kok, 'tasarim/video/liste.csv'), encoding='utf-8')):
    u = r['Video'].strip()
    m = re.search(r'(?:v=|shorts/|youtu\.be/|embed/)([A-Za-z0-9_-]{11})', u)
    if not m: continue
    bas = int(r.get('Başla') or 0) if (r.get('Başla') or '').strip().isdigit() else 0
    bit = int(r.get('Bitir') or 0) if (r.get('Bitir') or '').strip().isdigit() else 0
    kaynak = 'OPEX' if r['Kaynak'].startswith('OPEX') else ''
    out[r['Hareket'].strip()] = [m.group(1), 's' if '/shorts/' in u else 'w', kaynak, bas, bit]
s = ('// Hareket videoları (YouTube; dosya uygulamada durmaz, YouTube oynatıcısıyla gösterilir). Üretilmiş dosya — elle düzenleme.\n'
     '// Kaynak: tasarim/video/liste.csv · üretici: tasarim/video/yap.py\n'
     '// ad → [video kimliği, biçim (s: Shorts dikey, w: yatay), kaynak, başlangıç sn, bitiş sn]\n'
     'export const VIDEOLAR = ' + json.dumps(out, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
open(os.path.join(kok, 'videolar.js'), 'w', encoding='utf-8').write(s)
print(len(out), 'video')
