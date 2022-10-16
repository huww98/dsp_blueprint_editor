import sys
import json

def main():
    data = json.load(sys.stdin)['dataArray']
    sys.stdout.write(
"""import { Item } from './types';

export const items: Item[] = [
""")
    for d in data:
        icon = d['IconPath'].split('/')[-1]
        models = []
        modelIndex = d['ModelIndex']
        if modelIndex > 0:
            models = range(modelIndex, modelIndex + d['ModelCount'])
        models = ', '.join(str(m) for m in models)
        g = d['GridIndex']
        if g == 0:
            continue
        sys.stdout.write(f"    {{id: {d['ID']}, models: [{models}], name: '{d['Name']}', icon: '{icon}', grid: [{g // 1000}, {(g // 100) % 10}, {g % 100}]}},\n")
    sys.stdout.write('];\n')

if __name__ == '__main__':
    main()
