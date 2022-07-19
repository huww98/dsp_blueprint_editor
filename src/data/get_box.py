import json
from pathlib import Path
import re
import logging

logging.FileHandler

game_objects = {}
game_object_filename_re = re.compile(r'^(.+)-resources\.assets-(\d+)-GameObject\.json$')
for p in Path(R'/mnt/d/Users/huww/Pictures/DSP/game_object').glob('*-resources.assets-*-GameObject.json'):
    m = game_object_filename_re.match(p.name)
    game_objects[int(m.group(2))] = m.group(1)

all_cfg = {}
for p in Path(R'/mnt/d/Users/huww/Pictures/DSP/AS/MonoBehaviour').glob('SlotConfig*.json'):
    cfg = json.load(p.open(encoding='utf8'))
    all_cfg[game_objects[cfg['m_GameObject']['m_PathID']]] = cfg

print(all_cfg.keys())

while True:
    game_object_name = input()
    cfg = all_cfg[game_object_name]
    s = cfg['selectSize']
    o = cfg['selectCenter']
    print(f'box: [{s["x"]}, {s["y"]}, {s["z"]}], origin: [{o["x"]}, {o["y"]}, {o["z"]}]')
