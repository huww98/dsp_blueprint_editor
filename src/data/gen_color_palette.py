import sys
import json

def main():
    data = json.load(sys.stdin)['colorPalette256']
    sys.stdout.write(
"""export const colorPalette256: readonly string[] = [
""")
    for d in data:
        components = [d['r'], d['g'], d['b']]
        if d['a'] != 1.0:
            components.append(d['a'])
        components = ''.join(f'{int(round(c * 255)):02X}' for c in components)
        sys.stdout.write(f"    '#{components}',\n")
    sys.stdout.write("];\n")

if __name__ == '__main__':
    main()
