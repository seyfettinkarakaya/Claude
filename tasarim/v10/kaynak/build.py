import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import m2, m3

OUT = os.path.join(os.path.dirname(__file__), '..', 'mock', 'v10')
for tag, mod in (('m2', m2), ('m3', m3)):
    for name, fn in mod.PAGES.items():
        with open(os.path.join(OUT, f'{tag}-{name}.html'), 'w') as f:
            f.write(fn())
print('ok')
