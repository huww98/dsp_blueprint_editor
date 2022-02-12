import { BlueprintArea } from "./parser";

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

interface AreaPos {
    longitude: number;
    latitude: number;
}

export function findPosForAreas(areas: BlueprintArea[]): AreaPos[] {
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

    const pos = areas.map(() => ({ longitude: NaN, latitude: NaN } as AreaPos));
    const findLongitude = () => {
        const validateArea = (i: number, longitude: number) => {
            for (const j of adjList[i]) {
                const a2 = areas[j];
                const anchor = longitude + a2.tropicAnchor * gridSize[i];
                if (anchor % gridSize[j] !== 0 ||
                    !validateArea(j, anchor - a2.anchorLocalOffset.x * gridSize[j]))
                    return false
            }
            pos[i].longitude = longitude / gridSize[i];
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
        const planetAreaInfo = planetAreaByLongitudeSegment(a1.areaSegments);
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
        // let maxHeight = planetAreaInfo.latitudeSeg * GRID_PER_SEGMENT;
        // if (planetAreaInfo.minLatitudeSeg < 0) // cross the equator
        //     maxHeight++;
        // if (onTopTropic && onBottomTropic && a1.size.y !== maxHeight)
        //     throw new Error(`Area ${i} height ${a1.size.y} does not match height ${maxHeight} on planet`);
        if (!inPositiveHemisphere && inNegativeHemisphere)
            latitude = -latitude - a1.size.y + 1;
        return latitude;
    }
    pos[root].latitude = findRootLatitude()
    const calcChildAreaLatitude = (i: number) => {
        for (const j of adjList[i]) {
            pos[j].latitude = pos[i].latitude + areas[j].anchorLocalOffset.y;
            calcChildAreaLatitude(j)
        }
    }
    calcChildAreaLatitude(root);

    return pos;
}
