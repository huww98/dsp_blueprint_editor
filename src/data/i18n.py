import argparse
from pathlib import Path
import json

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mono_behaviour', type=Path)
    parser.add_argument('-o', type=Path, required=True)
    args = parser.parse_args()

    # load zh for required keys
    with open(args.o / 'zh.json', 'rb') as f:
        required_keys = json.load(f).keys()

    # item recipe names are always required
    with open(args.mono_behaviour / 'ItemProtoSet.json', 'rb') as f:
        required_keys |= set(i['Name'] for i in json.load(f)['dataArray'] if i['GridIndex'] != 0)
    with open(args.mono_behaviour / 'RecipeProtoSet.json', 'rb') as f:
        required_keys |= set(i['Name'] for i in json.load(f)['dataArray'])

    # get official zh, en, fr translations
    with open(args.mono_behaviour / 'StringProtoSet.json', 'rb') as f:
        data = {i['Name']: i for i in json.load(f)['dataArray']}

    required_keys = sorted(required_keys)
    def output_translation(lang, offical_name):
        with open(args.o / f'{lang}.json', 'w', encoding='utf-8') as f:
            json.dump({k: data[k][offical_name] for k in required_keys}, f, ensure_ascii=False, indent=4)

    output_translation('zh', 'ZHCN')
    output_translation('en', 'ENUS')
    output_translation('fr', 'FRFR')

if __name__ == '__main__':
    main()
