import argparse
from pathlib import Path
import json

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mono_behaviour', type=Path)
    parser.add_argument('locale', type=Path)
    parser.add_argument('-o', type=Path, required=True)
    args = parser.parse_args()

    # item recipe names are always required
    with open(args.mono_behaviour / 'ItemProtoSet.json', 'rb') as f:
        required_keys = set(i['Name'] for i in json.load(f)['dataArray'] if i['GridIndex'] != 0)
    with open(args.mono_behaviour / 'RecipeProtoSet.json', 'rb') as f:
        required_keys |= set(i['Name'] for i in json.load(f)['dataArray'])

    # load zh for additional required keys
    with open(args.o / 'zh.json', 'rb') as f:
        additional_keys = json.load(f).keys() - required_keys
    for k in additional_keys:
        print(f'Additional key: {k}')
    required_keys = sorted(required_keys)
    required_keys.extend(sorted(additional_keys))

    # get official zh, en translations
    def load_locale(path):
        result = {}
        for f_path in path.glob('*.txt'):
            with f_path.open('r', encoding='utf-16-le') as f:
                for line in f:
                    cells = line.strip().split('\t')
                    if len(cells) != 4:
                        continue
                    result[cells[0]] = cells[3]
        return result

    data = {
        'zh': load_locale(args.locale / '2052'),
        'en': load_locale(args.locale / '1033'),
    }

    def output_translation(lang):
        d = data[lang]
        trans = {k: d[k] for k in required_keys if d[k]}
        with open(args.o / f'{lang}.json', 'w', encoding='utf-8') as f:
            json.dump(trans, f, ensure_ascii=False, indent=4)

    output_translation('zh')
    output_translation('en')

if __name__ == '__main__':
    main()
