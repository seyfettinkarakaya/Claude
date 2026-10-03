from body import *
G = {'Sırt': '#60A5FA', 'Göğüs': '#F87171', 'Omuz': '#F5A524', 'Kol': '#FB923C', 'Gövde': '#A78BFA', 'Kalça': '#2DD4BF', 'Bacak': '#34D399'}
load = {'Sırt': .95, 'Göğüs': .3, 'Omuz': .4, 'Kol': .37, 'Gövde': .24, 'Kalça': .16, 'Bacak': .13}
prio = {'Gövde': 2, 'Sırt': 1, 'Bacak': 1}
svg = f'<svg width="820" height="900" viewBox="0 0 410 450" style="background:#0B0F14">{DEFS}{figure("on", load, prio, 0, 20, 1, colors=G)}{figure("arka", load, prio, 205, 20, 1, colors=G)}</svg>'
open('t.html', 'w').write(f'<body style="margin:0;background:#0B0F14">{svg}</body>')
