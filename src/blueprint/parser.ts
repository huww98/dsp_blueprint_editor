import { Base64 } from 'js-base64';
import pako from 'pako';

export interface BlueprintArea {
    index: number;
    parentIndex: number;
    tropicAnchor: number;
    areaSegments: number;
    anchorLocalOffset: {
        x: number;
        y: number;
    };
    size: {
        x: number;
        y: number;
    };
}

interface XYZ {
    x: number, y: number, z: number,
}
interface BlueprintBuilding {
    index: number,
    areaIndex: number,
    localOffset: [ XYZ, XYZ ],
    yaw: [ number, number ],
    itemId: number,
    modelIndex: number,
    outputObjIdx: number,
    inputObjIdx: number,
    outputToSlot: number,
    inputFromSlot: number,
    outputFromSlot: number,
    inputToSlot: number,
    outputOffset: number,
    inputOffset: number,
    recipeId: number,
    filterId: number,
    parameters: number[],
}

interface BlueprintData {
    header: {
        layout: number;
        icons: number[];
        time: Date;
        gameVersion: string;
        shortDesc: string;
        desc: string;
    };
    version: number;
    cursorOffset: { x: number, y: number };
    cursorTargetArea: number;
    dragBoxSize: { x: number, y: number };
    primaryAreaIdx: number;
    areas: BlueprintArea[];
    buildings: BlueprintBuilding[];
}

class BufferReader {
    private pos = 0;
    constructor(private view: DataView) {}

    private _get(func: (this: DataView, byteOffset: number, littleEndian: boolean) => number, size: number) {
        const v = func.call(this.view, this.pos, true);
        this.pos += size;
        return v;
    }

    getUint8() { return this._get(this.view.getUint8, 1); }
    getInt8()  { return this._get(this.view.getInt8,  1); }
    getInt16() { return this._get(this.view.getInt16, 2); }
    getInt32() { return this._get(this.view.getInt32, 4); }

    getFloat32() { return this._get(this.view.getFloat32, 4); }
}

function importArea(r: BufferReader): BlueprintArea {
    return {
        index: r.getInt8(),
        parentIndex: r.getInt8(),
        tropicAnchor: r.getInt16(),
        areaSegments: r.getInt16(),
        anchorLocalOffset: {
            x: r.getInt16(),
            y: r.getInt16(),
        },
        size: {
            x: r.getInt16(),
            y: r.getInt16(),
        },
    }
}

function importBuilding(r: BufferReader): BlueprintBuilding {
    function readXYZ() {
        return {
            x: r.getFloat32(),
            y: r.getFloat32(),
            z: r.getFloat32(),
        }
    }
    const b: BlueprintBuilding = {
        index: r.getInt32(),
        areaIndex: r.getInt8(),
        localOffset: [readXYZ(), readXYZ()],
        yaw: [r.getFloat32(), r.getFloat32()],
        itemId: r.getInt16(),
        modelIndex: r.getInt16(),
        outputObjIdx: r.getInt32(),
        inputObjIdx: r.getInt32(),
        outputToSlot: r.getInt8(),
        inputFromSlot: r.getInt8(),
        outputFromSlot: r.getInt8(),
        inputToSlot: r.getInt8(),
        outputOffset: r.getInt8(),
        inputOffset: r.getInt8(),
        recipeId: r.getInt16(),
        filterId: r.getInt16(),
        parameters: [],
    };
    const length = r.getInt16();
    for (let i = 0; i < length; i++)
        b.parameters.push(r.getInt32());
    return b;
}

const START = 'BLUEPRINT:';
const TIME_BASE = (new Date('0001-01-01T00:00:00.000Z')).getTime();

export function fromStr(strData: string): BlueprintData {
    if (!strData.startsWith(START))
        throw Error('Invalid start');

    const cells = strData.substring(START.length, strData.indexOf('"', START.length)).split(',');
    if (cells.length < 12)
        throw Error('Header too short');
    const header = {
        layout: parseInt(cells[1]),
        icons: cells.slice(2, 7).map(s => parseInt(s)),
        time: new Date(TIME_BASE + parseInt(cells[8]) / 10000),
        gameVersion: cells[9],
        shortDesc: decodeURIComponent(cells[10]),
        desc: decodeURIComponent(cells[11]),
    }

    const encoded = strData.match(/"(.+)"/);
    if (!encoded)
        throw Error('Content not found')
    const decoded = pako.inflate(Base64.toUint8Array(encoded[1]));
    const reader = new BufferReader(new DataView(decoded.buffer));

    const meta = {
        version: reader.getInt32(),
        cursorOffset: {
            x: reader.getInt32(),
            y: reader.getInt32(),
        },
        cursorTargetArea: reader.getInt32(),
        dragBoxSize: {
            x: reader.getInt32(),
            y: reader.getInt32(),
        },
        primaryAreaIdx: reader.getInt32(),
    };

    const numAreas = reader.getUint8();
    const areas: Array<BlueprintArea> = [];
    for (let i = 0; i < numAreas; i++)
        areas.push(importArea(reader));

    const numBuildings = reader.getInt32();
    const buildings: Array<BlueprintBuilding> = [];
    for (let i = 0; i < numBuildings; i++)
        buildings.push(importBuilding(reader));

    return {
        header,
        ...meta,
        areas,
        buildings,
    };
}
