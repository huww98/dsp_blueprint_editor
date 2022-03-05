import sys
import json

def main():
    data = json.load(sys.stdin)['dataArray']
    sys.stdout.write(
"""import { MIDI } from './types';

export const midi: readonly MIDI[] = [
""")
    for d in data:
        sys.stdout.write(f"    {{id: {d['ID']}, isInstrument: {'true' if d['Instrument'] else 'false'}, pitchRange: {d['PitchRange']}}},\n")
    sys.stdout.write("""];

export const midiMap = new Map<number, MIDI>();
for (const m of midi)
    midiMap.set(m.id, m);
""")

if __name__ == '__main__':
    main()
