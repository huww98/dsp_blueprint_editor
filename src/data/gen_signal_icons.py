import sys
import json

def main():
    data = json.load(sys.stdin)['dataArray']
    sys.stdout.write(
"""export const signal: Signal[] = [
""")
    for d in data:
        grid_index = d['GridIndex'] - 1101
        page = grid_index // 1000
        assert page == 2
        row = (grid_index % 1000) // 100
        column = grid_index % 100
        sys.stdout.write(f"    {{id: {d['ID']}, gridPos: [{row}, {column}]}},\n")
    sys.stdout.write('];\n')

if __name__ == '__main__':
    main()
