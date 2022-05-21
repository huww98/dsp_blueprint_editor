import sys
import json

def main():
    data = json.load(sys.stdin)['dataArray']
    sys.stdout.write(
"""import { Recipe } from './types';
import { itemsMap } from './items';

export const recipes: Recipe[] = [
""")
    for d in data:
        sys.stdout.write( "    {\n")
        sys.stdout.write(f"        id: {d['ID']}, name: '{d['Name']}', time: {d['TimeSpend']},\n")
        sys.stdout.write( "        from: [\n")
        for i, c in zip(d['Items'], d['ItemCounts']):
            sys.stdout.write(f"            {{item: itemsMap.get({i})!, count: {c}}},\n")
        sys.stdout.write( "        ],\n")
        sys.stdout.write( "        to: [\n")
        for i, c in zip(d['Results'], d['ResultCounts']):
            sys.stdout.write(f"            {{item: itemsMap.get({i})!, count: {c}}},\n")
        sys.stdout.write( "        ],\n")
        g = d['GridIndex']
        sys.stdout.write(f"        grid: [{g // 1000}, {(g // 100) % 10}, {g % 100}],\n")
        if d['IconPath']:
            icon = d['IconPath'].split('/')[-1]
            sys.stdout.write(f"        icon: '{icon}',\n")
        sys.stdout.write( "    },\n")
    sys.stdout.write('];\n')

if __name__ == '__main__':
    main()
