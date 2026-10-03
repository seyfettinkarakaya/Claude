from body import body_svg
G = {'Sırt': '#60A5FA', 'Göğüs': '#F87171', 'Omuz': '#F5A524', 'Kol': '#FB923C', 'Gövde': '#A78BFA', 'Kalça': '#2DD4BF', 'Bacak': '#34D399'}
load = {'Sırt': .95, 'Göğüs': .3, 'Omuz': .4, 'Kol': .37, 'Gövde': .24, 'Kalça': .16, 'Bacak': .13}
prio = {'Gövde': 2, 'Sırt': 1, 'Bacak': 1}
open('yakin.html', 'w').write(f'<body style="margin:0;background:#0B0F14">{body_svg(760, 700, "both", load, prio, G)}</body>')
