import sys
import json

def main():
    data = json.load(sys.stdin)['dataArray']
    sys.stdout.write(
"""import { Tech } from "./types";

export const tech: Tech[] = [
""")
    for d in data:
        if not d['Published']:
            continue
        sys.stdout.write(f"    {{id: {d['ID']}}},\n")
    sys.stdout.write('];\n')

if __name__ == '__main__':
    main()
