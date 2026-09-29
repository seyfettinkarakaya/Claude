# Ortak örnek veri ve yardımcılar (Model 2 / Model 3 maketleri)
BLOK = {'WU': ('#3B82F6', 'ISINMA'), 'PS': ('#8B5CF6', 'HAZIRLIK'), 'MS': ('#FF8A3D', 'ANA SET'),
        'AS': ('#FACC15', 'EK SET'), 'CD': ('#2DD4BF', 'SOĞUMA')}
# (blok, tekrar, mesafe, stil, tür, açıklama, hedef, dinlen, alet, yığımlı süre, gerçek)
SETS = [
  ('WU', 1, 200, 'FR', 'Swim', 'Rahat, uzun kulaç', '4:00', '0:20', '', '4:20', '3:58.2'),
  ('PS', 4, 50, 'FR', 'Drill', 'Catch-up, tek kol', '1:05', '0:15', '', '9:40', '1:04.1'),
  ('MS', 4, 100, 'FR', 'Swim', 'Eşik temposu, dönüşlerde 3 dolfin vuruşu', '1:55', '0:20', '', '18:40', '1:53.8'),
  ('MS', 2, 300, 'FR', 'Pull', 'Uzun çekiş, nefes 3-5', '6:00', '0:30', 'Şamandıra', '31:40', '5:56.0'),
  ('AS', 4, 50, 'BK', 'Swim', 'Sırtüstü, dönüş çalış', '1:00', '0:20', '', '37:00', '0:59.4'),
  ('CD', 1, 200, 'FR', 'Swim', 'Gevşek', '4:30', '', '', '41:30', '4:21.0'),
]
DIST = [s[1] * s[2] for s in SETS]
FONT = '<link rel="stylesheet" href="fonts.css">'

PATHS = {
  'gear': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  'back': '<path d="M15 5l-7 7 7 7"/>',
  'refresh': '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  'lock': '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  'watch': '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M18.5 6l1.5-1.5"/>',
  'check': '<path d="M4.5 12.5l5 5L19.5 7"/>',
  'flag': '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'x': '<path d="M6 6l12 12M18 6L6 18"/>',
  'reset': '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>',
  'save': '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
  'stop': '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
  'play': '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  'link': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  'sound': '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  'pace': '<circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M9 2h6"/>',
  'list': '<path d="M4 6h16M4 12h16M4 18h10"/>',
  'gym': '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  'swim': '<circle cx="16.5" cy="6" r="1.8"/><path d="M5 11l4-3 3 2.5 3-3"/><path d="M3 15c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/><path d="M3 19c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
  'trash': '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
}


def ic(name, size=24, sw=2.2):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{PATHS[name]}</svg>')


def page(css, body):
    return (f'<!doctype html><html lang="tr"><head><meta charset="utf-8">{FONT}<style>{css}</style></head>'
            f'<body><div class="phone">{body}</div></body></html>')


def title(s):
    return f'{s[1]} × {s[2]}'
