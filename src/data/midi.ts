import { MIDI } from './types';

export const midi: readonly MIDI[] = [
    {id: 1, isInstrument: true, pitchRange: [6, 101]},
    {id: 2, isInstrument: true, pitchRange: [6, 101]},
    {id: 3, isInstrument: true, pitchRange: [6, 101]},
    {id: 4, isInstrument: true, pitchRange: [6, 101]},
    {id: 5, isInstrument: true, pitchRange: [6, 101]},
    {id: 6, isInstrument: true, pitchRange: [6, 101]},
    {id: 7, isInstrument: true, pitchRange: [6, 101]},
    {id: 8, isInstrument: true, pitchRange: [6, 101]},
    {id: 9, isInstrument: true, pitchRange: [6, 101]},
    {id: 10, isInstrument: true, pitchRange: [6, 101]},
    {id: 11, isInstrument: true, pitchRange: [6, 101]},
    {id: 12, isInstrument: true, pitchRange: [6, 101]},
    {id: 13, isInstrument: true, pitchRange: [6, 101]},
    {id: 14, isInstrument: true, pitchRange: [6, 101]},
    {id: 15, isInstrument: true, pitchRange: [6, 101]},
    {id: 16, isInstrument: true, pitchRange: [6, 101]},
    {id: 17, isInstrument: true, pitchRange: [6, 101]},
    {id: 18, isInstrument: true, pitchRange: [24, 101]},
    {id: 19, isInstrument: true, pitchRange: [1, 108]},
    {id: 20, isInstrument: false, pitchRange: [23, 47]},
    {id: 21, isInstrument: false, pitchRange: [28, 52]},
    {id: 22, isInstrument: false, pitchRange: [35, 59]},
    {id: 23, isInstrument: false, pitchRange: [35, 59]},
    {id: 24, isInstrument: false, pitchRange: [40, 64]},
];

export const midiMap = new Map<number, MIDI>();
for (const m of midi)
    midiMap.set(m.id, m);
