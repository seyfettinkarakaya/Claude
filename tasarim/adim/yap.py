# adimlar.js üretir: exercises-dataset (hasaneyldrm, MIT — yalnızca metin; animasyonlar KULLANILMAZ) Türkçe adımları,
# uygulamadaki hareket adlarına eşlenmiş olarak.   python3 tasarim/adim/yap.py <exercises.json>
import json, os, sys
kok = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = {e['name']: e for e in json.load(open(sys.argv[1], encoding='utf-8'))}
# Uygulamadaki ad (SalonTakip) → veri setindeki ad (birebir ya da çok yakın; yakınlar notla)
ESLE = {
    'Standard Pull-up': 'pull up (neutral grip)', 'DB Goblet Squat': 'dumbbell goblet squat', 'Deadbug': 'dead bug',
    'Band Seated Row': 'resistance band seated straight back row', 'Band Lat Pulldown': 'band underhand pulldown',
    'Band Bent Over Row': 'band standing rear delt row', 'Plank (Standard)': 'weighted front plank', 'Russian Twist': 'russian twist',
    'Russian Twist (DB)': 'weighted russian twist', 'Flat DB Bench Press': 'dumbbell bench press', 'DB Pullover (Lat focus)': 'dumbbell pullover',
    'DB Pullover (Lat Focus)': 'dumbbell pullover', 'Band Glute Bridge': 'low glute bridge on floor', 'Band Pallof Press': 'band horizontal pallof press',
    'DB Lateral Raise (Standing)': 'dumbbell lateral raise', 'Seated DB Shoulder Press': 'dumbbell seated shoulder press',
    'DB Hammer Curl': 'dumbbell hammer curl', 'Lying Leg Raise': 'lying leg raise flat bench', 'Lying DB Triceps Extension': 'dumbbell lying triceps extension',
    'Push-up (Standard)': 'push-up', 'Wide Grip Push-up': 'push-up', 'Decline Push-up': 'decline push-up', 'DB Biceps Curl': 'dumbbell biceps curl',
    'Weighted Glute Bridge': 'barbell glute bridge', 'DB Rear Delt Fly': 'dumbbell rear delt raise', 'Flat DB Fly': 'dumbbell fly',
    'DB RDL (Romanian)': 'dumbbell romanian deadlift', 'Band Y-Raise': 'band y-raise', 'DB Side Bend': 'dumbbell side bend',
    'Wrist Curl (Palms Up)': 'band wrist curl', 'Chin-up (Underhand)': 'chin-up', 'Incline DB Biceps Curl': 'dumbbell incline curl',
    'Concentration Curl': 'band concentration curl', 'Two Arm DB Row (Neutral)': 'kettlebell two arm row', 'Hip Flexor Stretch': 'intermediate hip flexor and quad stretch',
    'Lat Stretch (Wall/Overhead)': 'kneeling lat stretch', 'Band External Rot (0°)': 'cable standing shoulder external rotation',
    'Overhead DB Triceps Extension': 'barbell seated overhead triceps extension', 'Standing DB Calf Raise': 'band two legs calf raise - (band under both legs) v. 2',
}
YAKIN = {'Band Bent Over Row', 'Band Lat Pulldown', 'Plank (Standard)', 'Weighted Glute Bridge', 'Wrist Curl (Palms Up)', 'Concentration Curl',
         'Two Arm DB Row (Neutral)', 'Lat Stretch (Wall/Overhead)', 'Band External Rot (0°)', 'Overhead DB Triceps Extension', 'Standing DB Calf Raise',
         'Wide Grip Push-up', 'Standard Pull-up', 'Band Glute Bridge'}
out = {}
for ad, en in ESLE.items():
    e = d.get(en)
    if not e or not e['instruction_steps'].get('tr'): print('YOK', ad, en); continue
    out[ad] = {'en': en, 'yakin': ad in YAKIN, 'adim': [s.replace('​', '') for s in e['instruction_steps']['tr']],
               'hedef': e['target'], 'yardimci': e.get('secondary_muscles') or [], 'ekipman': e['equipment']}
s = ('// Türkçe hareket adımları: exercises-dataset (hasaneyldrm, MIT lisansı — yalnızca metin ve gruplama; animasyonlar kullanılmaz).\n'
     '// Üretilmiş dosya — elle düzenleme. Üretici: tasarim/adim/yap.py. yakin: veri setindeki karşılık birebir değil (ekipman/duruş farkı).\n'
     '// MIT License — Copyright (c) 2026 Hasan Emir Yıldırım\n'
     'export const ADIMLAR = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(kok, 'adimlar.js'), 'w', encoding='utf-8').write(s)
print(len(out), 'hareket ·', os.path.getsize(os.path.join(kok, 'adimlar.js')) // 1024, 'KB')
