import { findPosForAreas } from '@/blueprint/planet';
import { BlueprintArea } from '@/blueprint/parser';

describe('findPosForAreas', () => {
    test('1 area', () => {
        const areas: BlueprintArea[] = [{
            index: 0,
            parentIndex: -1,
            tropicAnchor: 0,
            areaSegments: 160,
            anchorLocalOffset: { x: 0, y: 0 },
            size: { x: 1, y: 1 },
        }];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([{
            latitude: 105,
            longitude: 0,
        }]);
    });
    test('1 area cross the equator', () => {
        const areas: BlueprintArea[] = [{
            index: 0,
            parentIndex: -1,
            tropicAnchor: 0,
            areaSegments: 200,
            anchorLocalOffset: { x: 0, y: 0 },
            size: { x: 1, y: 1 },
        }];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([{
            latitude: 0,
            longitude: 0,
        }]);
    });
    test('root at high positive cross the equator', () => {
        const areas: BlueprintArea[] = [
            {
                index: 0,
                parentIndex: -1,
                tropicAnchor: 0,
                areaSegments: 200,
                anchorLocalOffset: { x: 0, y: 0 },
                size: { x: 1, y: 4 },
            }, {
                index: 1,
                parentIndex: 0,
                tropicAnchor: 0,
                areaSegments: 160,
                anchorLocalOffset: { x: 0, y: 4 },
                size: { x: 9, y: 30 },
            }
        ];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([
            { latitude: 77, longitude: 0 },
            { latitude: 81, longitude: 0 },
        ]);
    });
    test('root at high positive', () => {
        const areas: BlueprintArea[] = [
            {
                index: 0,
                parentIndex: -1,
                tropicAnchor: 0,
                areaSegments: 160,
                anchorLocalOffset: { x: 0, y: 0 },
                size: { x: 1, y: 4 },
            }, {
                index: 1,
                parentIndex: 0,
                tropicAnchor: 0,
                areaSegments: 120,
                anchorLocalOffset: { x: 0, y: 4 },
                size: { x: 9, y: 30 },
            }
        ];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([
            { latitude: 127, longitude: 0 },
            { latitude: 131, longitude: 0 },
        ]);
    });
    test('root at low positive', () => {
        const areas: BlueprintArea[] = [
            {
                index: 0,
                parentIndex: 1,
                tropicAnchor: 0,
                areaSegments: 160,
                anchorLocalOffset: { x: 0, y: -4 },
                size: { x: 1, y: 4 },
            }, {
                index: 1,
                parentIndex: -1,
                tropicAnchor: 0,
                areaSegments: 120,
                anchorLocalOffset: { x: 0, y: 0 },
                size: { x: 9, y: 30 },
            },
        ];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([
            { latitude: 127, longitude: 0 },
            { latitude: 131, longitude: 0 },
        ]);
    });
    test('root at negative', () => {
        const areas: BlueprintArea[] = [
            {
                index: 0,
                parentIndex: 1,
                tropicAnchor: 0,
                areaSegments: 120,
                anchorLocalOffset: { x: 0, y: -30 },
                size: { x: 9, y: 30 },
            }, {
                index: 1,
                parentIndex: -1,
                tropicAnchor: 0,
                areaSegments: 160,
                anchorLocalOffset: { x: 0, y: 0 },
                size: { x: 1, y: 4 },
            }
        ];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([
            { latitude: -160, longitude: 0 },
            { latitude: -130, longitude: 0 },
        ]);
    });
    test('multiple area cross the equator', () => {
        const areas: BlueprintArea[] = [
            {
                index: 0,
                parentIndex: 1,
                tropicAnchor: 4,
                areaSegments: 100,
                anchorLocalOffset: { x: 4, y: -3 },
                size: { x: 6, y: 3 },
            }, {
                index: 1,
                parentIndex: 2,
                tropicAnchor: 2,
                areaSegments: 120,
                anchorLocalOffset: { x: 1, y: -25 },
                size: { x: 6, y: 25 },
            }, {
                index: 2,
                parentIndex: 3,
                tropicAnchor: 2,
                areaSegments: 160,
                anchorLocalOffset: { x: 2, y: -50 },
                size: { x: 9, y: 50 },
            }, {
                index: 3,
                parentIndex: -1,
                tropicAnchor: 0,
                areaSegments: 200,
                anchorLocalOffset: { x: 0, y: 0 },
                size: { x: 10, y: 161 },
            }, {
                index: 4,
                parentIndex: 3,
                tropicAnchor: 2,
                areaSegments: 160,
                anchorLocalOffset: { x: 2, y: 161 },
                size: { x: 9, y: 6 },
            }
        ];
        const pos = findPosForAreas(areas);
        expect(pos).toEqual([
            { latitude: -158, longitude: 1 },
            { latitude: -155, longitude: 2 },
            { latitude: -130, longitude: 2 },
            { latitude: - 80, longitude: 3 },
            { latitude:   81, longitude: 2 },
        ]);
    })
});
