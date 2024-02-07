import { Color, Matrix4 } from 'three';

export interface BuildingMeta {
    color: Color;
    unitBoxTrans: Matrix4;
    selectUnitBoxTrans: Matrix4;
    iconTrans: Matrix4;
}

// 'box' from selectSize in SlotConfig
// 'offset' from selectCenter in SlotConfig
const buildingMetaRaw: [number, { color: number | null, box: [number, number, number], offset: [number, number, number] }][] = ([
    [ 35, { color: 0xE3A263, box: [0.64, 0.12, 0.64], offset: [0.0, 0.05, 0.0]}], // 低速传送带
    [ 36, { color: 0x51A896, box: [0.64, 0.12, 0.64], offset: [0.0, 0.05, 0.0]}], // 高速传送带
    [ 37, { color: 0x61A5D7, box: [0.64, 0.12, 0.64], offset: [0.0, 0.05, 0.0]}], // 极速传送带
    [ 41, { color: 0xE3A263, box: [1.0, 1.0, 1.0], offset: [0.0, 0.0, 0.0]}], // 低速分拣器
    [ 42, { color: 0x51A896, box: [1.0, 1.0, 1.0], offset: [0.0, 0.0, 0.0]}], // 高速分拣器
    [ 43, { color: 0x61A5D7, box: [1.0, 1.0, 1.0], offset: [0.0, 0.0, 0.0]}], // 极速分拣器
    [483, { color: 0x6E7070, box: [1.0, 1.0, 1.0], offset: [0.0, 0.0, 0.0]}], // 集装分拣器
    [ 38, { color: 0x3B5666, box: [2.7, 2.4, 2.7], offset: [0.0, 1.2, 0.0] }], // 四向分流器 a
    [ 39, { color: 0x3B5666, box: [1.5, 2.4, 2.7], offset: [0.0, 1.2, 0.0] }], // 四向分流器 b
    [ 40, { color: 0x3B5666, box: [2.7, 2.4, 2.7], offset: [0.0, 1.2, 0.0] }], // 四向分流器 c
    [257, { color: 0x42B4E7, box: [2.2, 2.0, 3.0], offset: [0.0, 1.0, 0.0] }], // 自动集装机
    [208, { color: 0x57FF8F, box: [1.3, 1.4, 2.3], offset: [0.0, 0.7, 0.05] }], // 流速监测器
    [120, { color: 0xFFDB00, box: [1.3, 2.5, 4.8], offset: [0.0, 1.25, -0.2] }], // 喷涂机
    [ 51, { color: 0xD4DEDF, box: [3.2, 2.67, 3.2], offset: [0.0, 1.33, 0.0] }], // 小型储物仓
    [ 52, { color: 0xD4DEDF, box: [6.2, 4.0, 4.2], offset: [0.0, 2.0, 0.0] }], // 大型储物仓
    [121, { color: 0x4696BB, box: [4.8, 4.0, 4.8], offset: [0.0, 2.0, 0.0] }], // 储液罐
    [ 65, { color: 0xEDAB5C, box: [4.2, 4.6, 4.2], offset: [0.0, 2.3, 0.0] }], // 制造台 Mk.I
    [ 66, { color: 0x38E5E1, box: [4.2, 4.6, 4.2], offset: [0.0, 2.3, 0.0] }], // 制造台 Mk.II
    [ 67, { color: 0x45C6E5, box: [4.2, 4.6, 4.2], offset: [0.0, 2.3, 0.0] }], // 制造台 Mk.III
    [456, { color: 0x365258, box: [4.2, 4.6, 4.2], offset: [0.0, 2.3, 0.0] }], // 制造台 Mk.IV
    [ 44, { color: 0xCCCCCC, box: [1.25, 6.0, 1.25], offset: [0.0, 3.0, 0.0] }], // 电力感应塔
    [ 71, { color: 0x17E1E5, box: [2.3, 9.2, 2.3], offset: [0.0, 4.6, 0.0] }], // 无线输电塔
    [ 68, { color: 0xDBE3E4, box: [3.5, 7.0, 3.5], offset: [0.0, 3.5, 0.0] }], // 卫星配电站
    [ 53, { color: 0xF1424F, box: [3.5, 7.4, 3.8], offset: [0.3, 3.7, 0.0] }], // 风力涡轮机
    [ 54, { color: 0xF73136, box: [4.8, 4.2, 9.0], offset: [-0.4, 2.1, 0.45] }], // 火力发电厂
    [118, { color: 0x2EA0FF, box: [4.8, 4.2, 9.0], offset: [-0.4, 2.1, 0.45] }], // 微型聚变发电站
    [255, { color: 0xDB6B4A, box: [6.0, 10.0, 8.0], offset: [0.0, 2.0, 0.0] }], // 地热发电站
    [ 57, { color: null,     box: [3.8, 3.6, 6.8], offset: [0.0, 1.8, 0.3] }], // 采矿机
    [256, { color: null,     box: [5.0, 16.0, 8.0], offset: [0.0, 8.0, -0.4] }], // 大型采矿机
    [ 60, { color: 0x00C1B6, box: [2.6, 6.0, 5.6], offset: [0.0, 3.0, 0.1] }], // 抽水站
    [ 62, { color: 0x739CE5, box: [3.2, 3.8, 3.2], offset: [0.0, 1.9, 0.0] }], // 电弧熔炉
    [194, { color: 0xC84F58, box: [3.2, 3.8, 3.2], offset: [0.0, 1.9, 0.0] }], // 位面熔炉
    [457, { color: 0x365258, box: [3.2, 3.8, 3.2], offset: [0.0, 1.9, 0.0] }], // 熔炉 Mk.III
    [ 61, { color: null,     box: [6.9, 11.6, 12.6], offset: [0.0, 5.8, 0.2] }], // 原油萃取站
    [ 63, { color: 0x354EA6, box: [4.2, 10.6, 7.4], offset: [0.0, 5.3, -0.32] }], // 原油精炼厂
    [ 64, { color: 0xECBB3E, box: [9.2, 6.3, 5.3], offset: [0.48, 3.15, 0.78] }], // 化工厂
    [376, { color: 0x62B5E5, box: [9.7, 6.3, 5.3], offset: [0.23, 3.15, 0.78] }], // 化工厂 Mk.II
    [119, { color: null,     box: [4.8, 9.4, 4.8], offset: [0.0, 4.7, 0.0] }], // 分馏塔
    [ 55, { color: 0x303656, box: [3.6, 4.0, 3.6], offset: [0.0, 2.0, 0.0] }], // 太阳能板
    [ 46, { color: null,     box: [3.27, 4.46, 2.98], offset: [0.0, 2.23, -0.09] }], // 蓄电器
    [ 72, { color: null,     box: [5.0, 6.0, 5.0], offset: [0.0, 3.0, 0.0] }], // 电磁轨道弹射器
    [ 73, { color: null,     box: [7.0, 10.0, 5.0], offset: [0.0, 5.0, 0.0] }], // 射线接收站
    [ 74, { color: null,     box: [15.0, 19.0, 18.2], offset: [0.0, 9.5, 0.0] }], // 垂直发射井
    [ 45, { color: null,     box: [8.3, 12.0, 8.3], offset: [0.0, 6.0, 0.0] }], // 能量枢纽
    [ 69, { color: 0x4C5E6E, box: [11.2, 13.0, 6.1], offset: [-0.7, 6.5, 0.0] }], // 微型粒子对撞机
    [ 56, { color: null,     box: [5.6, 10.2, 5.6], offset: [0.0, 5.1, 0.0] }], // 人造恒星
    [ 49, { color: 0xE0CFB0, box: [7.6, 25.0, 7.6], offset: [0.0, 12.5, 0.0] }], // 物流运输站
    [ 50, { color: 0xE0CFB0, box: [8.0, 34.0, 8.0], offset: [0.0, 17.0, 0.0] }], // 星际物流运输站
    [ 70, { color: 0xE5E8E8, box: [6.1, 3.1, 6.1], offset: [0.0, 1.55, 0.0] }], // 矩阵研究站
    [455, { color: 0x365258, box: [6.1, 3.1, 6.1], offset: [0.0, 1.55, 0.0] }], // 矩阵研究站 Mk.II
    [374, { color: null,     box: [4.5, 4.5, 4.5], offset: [0.0, 2.2, 0.0] }], // 高斯机枪塔
    [373, { color: null,     box: [5.2, 7.4, 5.5], offset: [0.0, 3.5, 0.25] }], // 高频激光塔
    [375, { color: null,     box: [5.8, 5.6, 7.2], offset: [0.0, 2.8, 0.0] }], // 聚爆加农炮
    [408, { color: null,     box: [8.0, 9.0, 8.0], offset: [0.0, 4.5, 0.0] }], // 磁化电浆炮
    [407, { color: null,     box: [7.0, 7.0, 7.5], offset: [0.0, 3.5, 0.3] }], // 导弹防御塔
    [403, { color: null,     box: [6.0, 16.0, 6.0], offset: [0.0, 7.8, 0.0] }], // 信标
    [402, { color: null,     box: [7.0, 14.2, 7.0], offset: [0.0, 7.0, 0.0] }], // 护盾发生器
    [453, { color: null,     box: [5.0, 8.0, 7.0], offset: [0.0, 4.0, 0.0] }], // 战场分析基站
    [482, { color: null,     box: [4.0, 7.0, 4.0], offset: [0.0, 4.0, 0.0] }], // 地面电浆炮
    [422, { color: null,     box: [5.0, 8.0, 7.0], offset: [0.0, 4.0, 0.0] }], // 干扰塔
    [371, { color: 0x718495, box: [3.0, 1.9, 3.2], offset: [0.0, 1.1, 0.0] }], // 物流配送器
])

export const buildingMeta = new Map<number, BuildingMeta>();

for (const [id, d] of buildingMetaRaw) {
    const unitBoxTrans = new Matrix4();
    const iconTrans = new Matrix4();
    const temp = new Matrix4();
    unitBoxTrans.makeTranslation(d.offset[0], d.offset[1], -d.offset[2]);
    unitBoxTrans.premultiply(temp.makeRotationX(Math.PI / 2));
    const selectUnitBoxTrans = unitBoxTrans.clone();

    unitBoxTrans.multiply(temp.makeScale(d.box[0] * 0.9, d.box[1] * 0.999, d.box[2] * 0.9));
    selectUnitBoxTrans.multiply(temp.makeScale(d.box[0], d.box[1], d.box[2]));

    const iconHeight = d.box[1] < 4.0 ? d.box[1] / 2.0 : d.box[1] - 2.0;
    iconTrans.makeScale(2., 2., 1.)
    iconTrans.premultiply(temp.makeTranslation(d.offset[0], d.offset[2], iconHeight));

    buildingMeta.set(id, {
        color: new Color(d.color ?? 0xdddddd),
        unitBoxTrans,
        selectUnitBoxTrans,
        iconTrans,
    });
}

export const noIconBuildings = new Set<number>([
    2020, // 四向分流器
    2040, // 自动集装机
    2030, // 流速监测器
    2313, // 喷涂机
    2201, // 电力感应塔
    2202, // 无线输电塔
])

export const stationSlotTrans = (function () {
    const o1 = 1.256, o2 = 2.7;
    const slots = [
        [ o1,  o2], [  0,  o2], [-o1,  o2],
        [-o2,  o1], [-o2,   0], [-o2, -o1],
        [-o1, -o2], [  0, -o2], [ o1, -o2],
        [ o2, -o1], [ o2,   0], [ o2,  o1],
    ] as const;
    return slots.map(s => new Matrix4().makeTranslation(s[0], s[1], 0.));
})();
