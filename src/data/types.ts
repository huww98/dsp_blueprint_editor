export interface Item {
    id: number;
    models: number[];
    name: string;
    icon: string;
    /** page, row, column */
    grid: [number, number, number];
    productive?: boolean;
}

export interface ItemStack {
    item: Item;
    count: number;
}

export interface Recipe {
    id: number;
    name: string;
    icon?: string;
    /** in 1/60 sec */
    time: number;
    from: ItemStack[];
    to: ItemStack[];
    /** page, row, column */
    grid: [number, number, number];
    nonProductive?: boolean;
}

export interface Tech {
    id: number;
}

export interface Signal {
    id: number;
    gridPos: [row: number, column: number];
}

export interface MIDI {
    id: number;
    isInstrument: boolean;
    pitchRange: [number, number];
}
