import { BlueprintBuilding, BlueprintData } from "@/blueprint/parser";
import { onUnmounted, onMounted, ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventDispatcher<TArgs extends Array<any>> {
    private callbacks = new Set<(...args: TArgs) => void>();
    on(callback: (...args: TArgs) => void) {
        this.callbacks.add(callback);
    }
    onMounted(callback: (...args: TArgs) => void) {
        onMounted(() => this.callbacks.add(callback));
        onUnmounted(() => this.callbacks.delete(callback));
    }
    dispatch(...args: TArgs) {
        for (const cb of this.callbacks) {
            cb(...args);
        }
    }
}


export class Updater {
    updateBuildingIcon = new EventDispatcher<[b: BlueprintBuilding]>();
    updateBeltIcon = new EventDispatcher<[b: BlueprintBuilding]>();
    updateBeltIconSubscript = new EventDispatcher<[b: BlueprintBuilding]>();
    updateSorterIcon = new EventDispatcher<[b: BlueprintBuilding]>();

    updateStationInfo = new EventDispatcher<[b: BlueprintBuilding]>();
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

    private readonly stateVersion = ref(0);
    public readonly execVersion = ref(0);
    public readonly updater;
    constructor(public readonly data: BlueprintData) {
        this.updater = new Updater();
    }

    // commands:         c1 c2 c3
    // currentPosition: 0  1  2  3
    private commands: Command[] = [];
    private currentPosition = 0;

    private trim() {
        if (this.maxSize < this.commands.length) {
            const n = Math.min(this.commands.length - this.maxSize, this.currentPosition);
            this.commands.splice(0, n);
            this.currentPosition -= n;
            this.stateVersion.value++;
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
        this.stateVersion.value++;
        this.execVersion.value++;
    }

    public canUndo() {
        this.stateVersion.value;
        return this.currentPosition > 0;
    }

    public undo() {
        if (!this.canUndo())
            return false;
        this.commands[--this.currentPosition].undo(this.data, this.updater);
        this.stateVersion.value++;
        this.execVersion.value++;
        return true;
    }

    public canRedo() {
        this.stateVersion.value;
        return this.currentPosition < this.commands.length;
    }

    public redo() {
        if (!this.canRedo())
            return false;
        this.commands[this.currentPosition++].do(this.data, this.updater);
        this.stateVersion.value++;
        this.execVersion.value++;
        return true;
    }
}
