#!/usr/bin/env python3
Download Three.js r128 into Android assets and rewrite index.html to local reference.
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'app' / 'src' / 'main' / 'assets'
HTML = ASSETS / 'index.html'
THREE = ASSETS / 'three.min.js'
URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

print(f'Downloading {URL}')
THREE.write_bytes(urllib.request.urlopen(URL, timeout=60).read())
text = HTML.read_text(encoding='utf-8')
text = text.replace(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
    '<script src="three.min.js"></script>'
)
HTML.write_text(text, encoding='utf-8')
print(f'Wrote {THREE}')
print('Rewrote index.html to use local three.min.js')
