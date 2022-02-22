import { isSplitter } from "@/data/items";
import { BlueprintBuilding, IODir } from "./parser";

export interface SplitterInfo {
    slots: { dir: IODir, beltIndex: number }[];
}

export class BuildingInfo {
    splitterInfo = new Map<number, SplitterInfo>();
    constructor(buildings: BlueprintBuilding[]) {
        for (const b of buildings) {
            if (isSplitter(b.itemId)) {
                const info = {
                    slots: new Array(4),
                }
                for (let i = 0; i < 4; i++)
                    info.slots[i] = { dir: IODir.None, beltIndex: -1 }
                this.splitterInfo.set(b.index, info);
            }
        }
        for (const b of buildings) {
            if (b.outputObjIdx >= 0) {
                const si = this.splitterInfo.get(b.outputObjIdx)
                if (si !== undefined) {
                    const slot = si.slots[b.outputToSlot];
                    slot.beltIndex = b.index;
                    slot.dir = IODir.Input;
                }
            }
            if (b.inputObjIdx >= 0) {
                const si = this.splitterInfo.get(b.inputObjIdx)
                if (si !== undefined) {
                    const slot = si.slots[b.inputFromSlot];
                    slot.beltIndex = b.index;
                    slot.dir = IODir.Output;
                }
            }
        }
    }
}
