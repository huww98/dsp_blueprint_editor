import { BlueprintBuilding, BlueprintData } from "@/blueprint/parser";

export interface Updater {
    updateBuildingIcon(building: BlueprintBuilding): void;
    updateBeltIcon(building: BlueprintBuilding): void;
    updateBeltIconSubscript(building: BlueprintBuilding): void;
    updateSorterIcon(building: BlueprintBuilding): void;
}

export interface Command {
    do(data: BlueprintData, updater: Updater): void;
    undo(data: BlueprintData, updater: Updater): void;
    merge(c: Command): boolean;
}

export class CommandQueue {
    private _maxSize = 256;
    public get maxSize() {
        return this._maxSize;
    }
    public set maxSize(value) {
        this._maxSize = value;
        this.trim()
    }

    constructor(private data: BlueprintData, private updater: Updater) {}

    // commands:         c1 c2 c3
    // currentPosition: 0  1  2  3
    private commands: Command[] = [];
    private currentPosition = 0;

    private trim() {
        if (this.maxSize < this.commands.length) {
            const n = this.commands.length - this.maxSize;
            this.commands.splice(0, n);
            this.currentPosition -= n;
        }
    }

    public push(c: Command) {
        this.commands.splice(this.currentPosition)
        c.do(this.data, this.updater);
        if (this.currentPosition > 0 && this.commands[this.currentPosition - 1].merge(c))
            return;
        this.commands.push(c);
        this.currentPosition++;
        this.trim();
    }

    public undo() {
        if (this.currentPosition === 0)
            return false;
        this.commands[--this.currentPosition].undo(this.data, this.updater);
        return true;
    }

    public redo() {
        if (this.currentPosition === this.commands.length)
            return false;
        this.commands[this.currentPosition++].do(this.data, this.updater);
        return true;
    }
}
