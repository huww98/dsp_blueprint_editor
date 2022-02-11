export interface Item {
    id: number;
    name: string;
    icon: string;
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
}
