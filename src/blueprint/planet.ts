import { Euler, Matrix4 } from "three";
import { BlueprintArea, BlueprintBuilding } from "./parser";

const segmentArr: [number, number][] = [
	[0, 1],
	[1, 4],
	[8, 8],
	[16, 16],
	[20, 20],
	[28, 32],
	[40, 40],
	[54, 60],
	[73, 80],
	[91, 100],
	[114, 120],
	[140, 160],
	[177, 200],
	[Infinity, Infinity],
];

const segmentMap = new Map<number, number>();

for (let i = 0; i < segmentArr.length - 1; i++) {
    segmentMap.set(segmentArr[i][1], i);
}

const GRID_PER_SEGMENT = 5;

function calcLatitudeSeg(seg: number, maxSegment = 200) {
	const latitude = Math.acos(seg / maxSegment);
	const radPerSeg = 2 * Math.PI / maxSegment;
	return Math.ceil(latitude / radPerSeg);
}

function planetAreaByIndex(i: number, segment = 200) {
    const [minSeg, longitudeSeg] = segmentArr[i];
    const maxSeg = segmentArr[i + 1][0]
    const maxLatitudeSeg = calcLatitudeSeg(minSeg, segment);
    const minLatitudeSeg = maxSeg >= segment ? -maxLatitudeSeg : calcLatitudeSeg(maxSeg, segment);
    const latitudeSeg = maxLatitudeSeg - minLatitudeSeg;
    return {
        minLatitudeSeg,
        latitudeSeg,
        longitudeSeg,
    };
}

export function* gridAreas(segment = 200) {
    for (let i = 1; i < segmentArr.length - 1; i++) {
        const seg = planetAreaByIndex(i, segment);
        yield seg;
        if (seg.minLatitudeSeg > 0) { // cross the equator
            yield {
                minLatitudeSeg: -seg.minLatitudeSeg,
                latitudeSeg: -seg.latitudeSeg,
                longitudeSeg: seg.longitudeSeg,
            }
        }

    }
}

function planetAreaByLongitudeSegment(segment: number, maxSegment = 200) {
    const idx = segmentMap.get(segment);
    if (idx === undefined)
        throw new Error(`Area with ${segment} segments not found on a ${maxSegment} segments planet.`)
    return planetAreaByIndex(idx, maxSegment);
}

function gcd(a: number, b: number) {
    while (b !== 0) {
        const c = a % b;
        a = b;
        b = c;
    }
    return a;
}

function lcm(a: number, b: number) {
    return a * b / gcd(a, b);
}

export interface PositionedBlueprint {
    segment: number;
    areas: {
        longitude: number;
        latitude: number;
        segment: number;
    }[];
}

export function findPosForAreas(areas: BlueprintArea[], segment = 200): PositionedBlueprint {
    let root = -1;
    const adjList = areas.map(() => [] as number[]);
    for (let i = 0; i < areas.length; i++) {
        const a = areas[i];
        if (a.parentIndex >= 0) {
            adjList[a.parentIndex].push(i);
        } else {
            root = i;
        }
    }
    if (root === -1)
        throw new Error('No root area found.')

    const gridCount = areas.map(a => a.areaSegments * GRID_PER_SEGMENT)
    const longitudeBase = gridCount.reduce(lcm);
    const gridSize = gridCount.map(c => longitudeBase / c)
    const period = gridSize.reduce(lcm);

    const pos: PositionedBlueprint = {
        segment: segment,
        areas:  areas.map(a => ({ longitude: NaN, latitude: NaN, segment: a.areaSegments }))
    };
    const findLongitude = () => {
        const validateArea = (i: number, longitude: number) => {
            for (const j of adjList[i]) {
                const a2 = areas[j];
                const anchor = longitude + a2.tropicAnchor * gridSize[i];
                if (anchor % gridSize[j] !== 0 ||
                    !validateArea(j, anchor - a2.anchorLocalOffset.x * gridSize[j]))
                    return false
            }
            pos.areas[i].longitude = longitude / gridSize[i];
            return true;
        }
        for (let l = 0; l < period; l += gridSize[root]) {
            if (validateArea(root, l))
                return;
        }
        throw new Error('No suitable longitude found.')
    }
    findLongitude();

    const findRootLatitude = () => {
        let onHighTropic = false,
            onLowTropic = false,
            inPositiveHemisphere = false,
            inNegativeHemisphere = false;
        const a1 = areas[root];
        const planetAreaInfo = planetAreaByLongitudeSegment(a1.areaSegments, segment);
        for (const j of adjList[root]) {
            const a2 = areas[j];
            if (a2.areaSegments === a1.areaSegments)
                throw new Error(`Area ${j} has the same segments as its parent`)
            if (a2.anchorLocalOffset.y === 0)
                throw new Error(`Area ${j} unexpected anchorLocalOffsetY == 0`);

            if (a2.areaSegments < a1.areaSegments) {
                onHighTropic = true;
                if (a2.anchorLocalOffset.y > 0)
                    inPositiveHemisphere = true;
                else
                    inNegativeHemisphere = true;
            } else {
                onLowTropic = true
                if (a2.anchorLocalOffset.y < 0)
                    inPositiveHemisphere = true;
                else
                    inNegativeHemisphere = true;
            }
        }
        let latitude = NaN;
        if (onLowTropic)  // Should not be possible in current game version
            latitude = planetAreaInfo.minLatitudeSeg * GRID_PER_SEGMENT + 1;
        else if (onHighTropic)
            latitude = (planetAreaInfo.minLatitudeSeg + planetAreaInfo.latitudeSeg) * GRID_PER_SEGMENT - a1.size.y + 1;
        else
            latitude = Math.ceil((planetAreaInfo.minLatitudeSeg + planetAreaInfo.latitudeSeg / 2) * GRID_PER_SEGMENT - a1.size.y / 2) | 0;

        if (!inPositiveHemisphere && inNegativeHemisphere)
            latitude = -latitude - a1.size.y + 1;
        return latitude;
    }
    pos.areas[root].latitude = findRootLatitude()
    const calcChildAreaLatitude = (i: number) => {
        for (const j of adjList[i]) {
            pos.areas[j].latitude = pos.areas[i].latitude + areas[j].anchorLocalOffset.y;
            calcChildAreaLatitude(j)
        }
    }
    calcChildAreaLatitude(root);

    return pos;
}

const HEIGHT_GRID_SIZE = 4 / 3;

const temp = new Matrix4();
const rotation = new Euler();
export function calcBuildingTrans(R: number, pos: PositionedBlueprint, building: BlueprintBuilding) {
    const area = pos.areas[building.areaIndex];
    const longitudeGridSize = 2 * Math.PI / area.segment / GRID_PER_SEGMENT;
    const latitudeGridSize = 2 * Math.PI / pos.segment / GRID_PER_SEGMENT;

    const partTrans = (i: number) => {
        const longitude = (area.longitude + building.localOffset[i].x) * longitudeGridSize;
        const latitude = (area.latitude + building.localOffset[i].y) * latitudeGridSize;
        const height = R + building.localOffset[i].z * HEIGHT_GRID_SIZE;

        rotation.set(latitude, longitude, building.yaw[i] / 180.0 * Math.PI, 'YXZ')
        const trans = new Matrix4();
        trans.makeTranslation(0, 0, height);
        trans.premultiply(temp.makeRotationFromEuler(rotation));
        return trans
    }

    return building.localOffset.map((_v, i) => partTrans(i));
}
