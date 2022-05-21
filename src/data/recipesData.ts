import { Recipe } from './types';
import { itemsMap } from './items';

export const recipes: Recipe[] = [
    {
        id: 1, name: '铁块', time: 60,
        from: [
            {item: itemsMap.get(1001)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1101)!, count: 1},
        ],
        grid: [1, 1, 1],
    },
    {
        id: 2, name: '磁铁', time: 90,
        from: [
            {item: itemsMap.get(1001)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1102)!, count: 1},
        ],
        grid: [1, 2, 1],
    },
    {
        id: 3, name: '铜块', time: 60,
        from: [
            {item: itemsMap.get(1002)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1104)!, count: 1},
        ],
        grid: [1, 1, 2],
    },
    {
        id: 4, name: '石材', time: 60,
        from: [
            {item: itemsMap.get(1005)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1108)!, count: 1},
        ],
        grid: [1, 1, 5],
    },
    {
        id: 5, name: '齿轮', time: 60,
        from: [
            {item: itemsMap.get(1101)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1201)!, count: 1},
        ],
        grid: [1, 4, 1],
    },
    {
        id: 6, name: '磁线圈', time: 60,
        from: [
            {item: itemsMap.get(1102)!, count: 2},
            {item: itemsMap.get(1104)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1202)!, count: 2},
        ],
        grid: [1, 2, 2],
    },
    {
        id: 7, name: '风力涡轮机', time: 240,
        from: [
            {item: itemsMap.get(1101)!, count: 6},
            {item: itemsMap.get(1201)!, count: 1},
            {item: itemsMap.get(1202)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(2203)!, count: 1},
        ],
        grid: [2, 1, 4],
    },
    {
        id: 8, name: '电力感应塔', time: 60,
        from: [
            {item: itemsMap.get(1101)!, count: 2},
            {item: itemsMap.get(1202)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2201)!, count: 1},
        ],
        grid: [2, 1, 1],
    },
    {
        id: 9, name: '电磁矩阵', time: 180,
        from: [
            {item: itemsMap.get(1202)!, count: 1},
            {item: itemsMap.get(1301)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(6001)!, count: 1},
        ],
        grid: [1, 7, 1],
    },
    {
        id: 10, name: '矩阵研究站', time: 180,
        from: [
            {item: itemsMap.get(1101)!, count: 8},
            {item: itemsMap.get(1110)!, count: 4},
            {item: itemsMap.get(1301)!, count: 4},
            {item: itemsMap.get(1202)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2901)!, count: 1},
        ],
        grid: [2, 4, 8],
    },
    {
        id: 11, name: '棱镜', time: 120,
        from: [
            {item: itemsMap.get(1110)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(1111)!, count: 2},
        ],
        grid: [1, 3, 5],
    },
    {
        id: 12, name: '电浆激发器', time: 120,
        from: [
            {item: itemsMap.get(1202)!, count: 4},
            {item: itemsMap.get(1111)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1401)!, count: 1},
        ],
        grid: [1, 5, 1],
    },
    {
        id: 13, name: '无线输电塔', time: 180,
        from: [
            {item: itemsMap.get(2201)!, count: 1},
            {item: itemsMap.get(1401)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(2202)!, count: 1},
        ],
        grid: [2, 1, 2],
    },
    {
        id: 14, name: '原油萃取站', time: 480,
        from: [
            {item: itemsMap.get(1103)!, count: 12},
            {item: itemsMap.get(1108)!, count: 12},
            {item: itemsMap.get(1301)!, count: 6},
            {item: itemsMap.get(1401)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2307)!, count: 1},
        ],
        grid: [2, 3, 7],
    },
    {
        id: 15, name: '原油精炼厂', time: 360,
        from: [
            {item: itemsMap.get(1103)!, count: 10},
            {item: itemsMap.get(1108)!, count: 10},
            {item: itemsMap.get(1301)!, count: 6},
            {item: itemsMap.get(1401)!, count: 6},
        ],
        to: [
            {item: itemsMap.get(2308)!, count: 1},
        ],
        grid: [2, 3, 8],
    },
    {
        id: 16, name: '等离子精炼', time: 240,
        from: [
            {item: itemsMap.get(1007)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1120)!, count: 1},
            {item: itemsMap.get(1114)!, count: 2},
        ],
        grid: [1, 1, 7],
        icon: 'plasma-refining',
    },
    {
        id: 17, name: '高能石墨', time: 120,
        from: [
            {item: itemsMap.get(1006)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1109)!, count: 1},
        ],
        grid: [1, 1, 6],
    },
    {
        id: 18, name: '能量矩阵', time: 360,
        from: [
            {item: itemsMap.get(1109)!, count: 2},
            {item: itemsMap.get(1120)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(6002)!, count: 1},
        ],
        grid: [1, 7, 2],
    },
    {
        id: 19, name: '氢燃料棒', time: 360,
        from: [
            {item: itemsMap.get(1106)!, count: 1},
            {item: itemsMap.get(1120)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(1801)!, count: 2},
        ],
        grid: [1, 2, 10],
    },
    {
        id: 20, name: '推进器', time: 240,
        from: [
            {item: itemsMap.get(1103)!, count: 2},
            {item: itemsMap.get(1104)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(1405)!, count: 1},
        ],
        grid: [1, 3, 10],
    },
    {
        id: 21, name: '加力推进器', time: 360,
        from: [
            {item: itemsMap.get(1107)!, count: 5},
            {item: itemsMap.get(1204)!, count: 5},
        ],
        to: [
            {item: itemsMap.get(1406)!, count: 1},
        ],
        grid: [1, 3, 11],
    },
    {
        id: 22, name: '化工厂', time: 300,
        from: [
            {item: itemsMap.get(1103)!, count: 8},
            {item: itemsMap.get(1108)!, count: 8},
            {item: itemsMap.get(1110)!, count: 8},
            {item: itemsMap.get(1301)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2309)!, count: 1},
        ],
        grid: [2, 4, 7],
    },
    {
        id: 23, name: '塑料', time: 180,
        from: [
            {item: itemsMap.get(1114)!, count: 2},
            {item: itemsMap.get(1109)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1115)!, count: 1},
        ],
        grid: [1, 1, 8],
    },
    {
        id: 24, name: '硫酸', time: 360,
        from: [
            {item: itemsMap.get(1114)!, count: 6},
            {item: itemsMap.get(1005)!, count: 8},
            {item: itemsMap.get(1000)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(1116)!, count: 4},
        ],
        grid: [1, 4, 6],
    },
    {
        id: 25, name: '有机晶体', time: 360,
        from: [
            {item: itemsMap.get(1115)!, count: 2},
            {item: itemsMap.get(1114)!, count: 1},
            {item: itemsMap.get(1000)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1117)!, count: 1},
        ],
        grid: [1, 2, 8],
    },
    {
        id: 26, name: '钛晶石', time: 240,
        from: [
            {item: itemsMap.get(1117)!, count: 1},
            {item: itemsMap.get(1106)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(1118)!, count: 1},
        ],
        grid: [1, 3, 9],
    },
    {
        id: 27, name: '结构矩阵', time: 480,
        from: [
            {item: itemsMap.get(1112)!, count: 1},
            {item: itemsMap.get(1118)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(6003)!, count: 1},
        ],
        grid: [1, 7, 3],
    },
    {
        id: 28, name: '卡西米尔晶体', time: 240,
        from: [
            {item: itemsMap.get(1118)!, count: 1},
            {item: itemsMap.get(1123)!, count: 2},
            {item: itemsMap.get(1120)!, count: 12},
        ],
        to: [
            {item: itemsMap.get(1126)!, count: 1},
        ],
        grid: [1, 5, 5],
    },
    {
        id: 29, name: '卡西米尔晶体（高效）', time: 240,
        from: [
            {item: itemsMap.get(1014)!, count: 4},
            {item: itemsMap.get(1123)!, count: 2},
            {item: itemsMap.get(1120)!, count: 12},
        ],
        to: [
            {item: itemsMap.get(1126)!, count: 1},
        ],
        grid: [1, 6, 5],
        icon: 'casimir-crystal-lv2',
    },
    {
        id: 30, name: '钛化玻璃', time: 300,
        from: [
            {item: itemsMap.get(1110)!, count: 2},
            {item: itemsMap.get(1106)!, count: 2},
            {item: itemsMap.get(1000)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1119)!, count: 2},
        ],
        grid: [1, 3, 4],
    },
    {
        id: 31, name: '石墨烯', time: 180,
        from: [
            {item: itemsMap.get(1109)!, count: 3},
            {item: itemsMap.get(1116)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1123)!, count: 2},
        ],
        grid: [1, 1, 9],
    },
    {
        id: 32, name: '石墨烯（高效）', time: 120,
        from: [
            {item: itemsMap.get(1011)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1123)!, count: 2},
            {item: itemsMap.get(1120)!, count: 1},
        ],
        grid: [1, 2, 9],
        icon: 'graphene-lv2',
    },
    {
        id: 33, name: '碳纳米管', time: 240,
        from: [
            {item: itemsMap.get(1123)!, count: 3},
            {item: itemsMap.get(1106)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1124)!, count: 2},
        ],
        grid: [1, 4, 9],
    },
    {
        id: 34, name: '硅石', time: 600,
        from: [
            {item: itemsMap.get(1005)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(1003)!, count: 1},
        ],
        grid: [1, 4, 3],
    },
    {
        id: 35, name: '碳纳米管（高效）', time: 240,
        from: [
            {item: itemsMap.get(1015)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1124)!, count: 2},
        ],
        grid: [1, 5, 9],
        icon: 'nanotube-lv2',
    },
    {
        id: 36, name: '粒子宽带', time: 480,
        from: [
            {item: itemsMap.get(1124)!, count: 2},
            {item: itemsMap.get(1113)!, count: 2},
            {item: itemsMap.get(1115)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1402)!, count: 1},
        ],
        grid: [1, 5, 3],
    },
    {
        id: 37, name: '晶格硅', time: 120,
        from: [
            {item: itemsMap.get(1105)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1113)!, count: 1},
        ],
        grid: [1, 2, 3],
    },
    {
        id: 38, name: '位面过滤器', time: 720,
        from: [
            {item: itemsMap.get(1126)!, count: 1},
            {item: itemsMap.get(1119)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1304)!, count: 1},
        ],
        grid: [1, 4, 8],
    },
    {
        id: 39, name: '微型粒子对撞机', time: 900,
        from: [
            {item: itemsMap.get(1107)!, count: 20},
            {item: itemsMap.get(1125)!, count: 20},
            {item: itemsMap.get(1205)!, count: 50},
            {item: itemsMap.get(1123)!, count: 10},
            {item: itemsMap.get(1303)!, count: 8},
        ],
        to: [
            {item: itemsMap.get(2310)!, count: 1},
        ],
        grid: [2, 3, 10],
    },
    {
        id: 40, name: '重氢', time: 150,
        from: [
            {item: itemsMap.get(1120)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(1121)!, count: 5},
        ],
        grid: [1, 4, 7],
    },
    {
        id: 41, name: '氘核燃料棒', time: 720,
        from: [
            {item: itemsMap.get(1107)!, count: 1},
            {item: itemsMap.get(1121)!, count: 20},
            {item: itemsMap.get(1205)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1802)!, count: 2},
        ],
        grid: [1, 2, 11],
    },
    {
        id: 42, name: '湮灭约束球', time: 1200,
        from: [
            {item: itemsMap.get(1206)!, count: 1},
            {item: itemsMap.get(1303)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1403)!, count: 1},
        ],
        grid: [1, 5, 8],
    },
    {
        id: 43, name: '人造恒星', time: 1800,
        from: [
            {item: itemsMap.get(1107)!, count: 20},
            {item: itemsMap.get(1125)!, count: 20},
            {item: itemsMap.get(1403)!, count: 10},
            {item: itemsMap.get(1305)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(2210)!, count: 1},
        ],
        grid: [2, 1, 12],
    },
    {
        id: 44, name: '反物质燃料棒', time: 1440,
        from: [
            {item: itemsMap.get(1122)!, count: 12},
            {item: itemsMap.get(1120)!, count: 12},
            {item: itemsMap.get(1403)!, count: 1},
            {item: itemsMap.get(1107)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1803)!, count: 2},
        ],
        grid: [1, 2, 12],
    },
    {
        id: 45, name: '制造台 Mk.I', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 4},
            {item: itemsMap.get(1201)!, count: 8},
            {item: itemsMap.get(1301)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2303)!, count: 1},
        ],
        grid: [2, 4, 1],
    },
    {
        id: 46, name: '制造台 Mk.II', time: 180,
        from: [
            {item: itemsMap.get(2303)!, count: 1},
            {item: itemsMap.get(1123)!, count: 8},
            {item: itemsMap.get(1303)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2304)!, count: 1},
        ],
        grid: [2, 4, 2],
    },
    {
        id: 47, name: '制造台 Mk.III', time: 240,
        from: [
            {item: itemsMap.get(2304)!, count: 1},
            {item: itemsMap.get(1402)!, count: 8},
            {item: itemsMap.get(1305)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2305)!, count: 1},
        ],
        grid: [2, 4, 3],
    },
    {
        id: 48, name: '采矿机', time: 180,
        from: [
            {item: itemsMap.get(1101)!, count: 4},
            {item: itemsMap.get(1301)!, count: 2},
            {item: itemsMap.get(1202)!, count: 2},
            {item: itemsMap.get(1201)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2301)!, count: 1},
        ],
        grid: [2, 3, 4],
    },
    {
        id: 49, name: '抽水站', time: 240,
        from: [
            {item: itemsMap.get(1101)!, count: 8},
            {item: itemsMap.get(1108)!, count: 4},
            {item: itemsMap.get(1203)!, count: 4},
            {item: itemsMap.get(1301)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2306)!, count: 1},
        ],
        grid: [2, 3, 6],
    },
    {
        id: 50, name: '电路板', time: 60,
        from: [
            {item: itemsMap.get(1101)!, count: 2},
            {item: itemsMap.get(1104)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1301)!, count: 2},
        ],
        grid: [1, 4, 4],
    },
    {
        id: 51, name: '处理器', time: 180,
        from: [
            {item: itemsMap.get(1301)!, count: 2},
            {item: itemsMap.get(1302)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1303)!, count: 1},
        ],
        grid: [1, 5, 4],
    },
    {
        id: 52, name: '量子芯片', time: 360,
        from: [
            {item: itemsMap.get(1303)!, count: 2},
            {item: itemsMap.get(1304)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1305)!, count: 1},
        ],
        grid: [1, 6, 4],
    },
    {
        id: 53, name: '微晶元件', time: 120,
        from: [
            {item: itemsMap.get(1105)!, count: 2},
            {item: itemsMap.get(1104)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1302)!, count: 1},
        ],
        grid: [1, 6, 3],
    },
    {
        id: 54, name: '有机晶体（原始）', time: 360,
        from: [
            {item: itemsMap.get(1030)!, count: 20},
            {item: itemsMap.get(1031)!, count: 30},
            {item: itemsMap.get(1000)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(1117)!, count: 1},
        ],
        grid: [1, 3, 8],
        icon: 'crystal-rubber-lv0',
    },
    {
        id: 55, name: '信息矩阵', time: 600,
        from: [
            {item: itemsMap.get(1303)!, count: 2},
            {item: itemsMap.get(1402)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(6004)!, count: 1},
        ],
        grid: [1, 7, 4],
    },
    {
        id: 56, name: '电弧熔炉', time: 180,
        from: [
            {item: itemsMap.get(1101)!, count: 4},
            {item: itemsMap.get(1108)!, count: 2},
            {item: itemsMap.get(1301)!, count: 4},
            {item: itemsMap.get(1202)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2302)!, count: 1},
        ],
        grid: [2, 4, 4],
    },
    {
        id: 57, name: '玻璃', time: 120,
        from: [
            {item: itemsMap.get(1005)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1110)!, count: 1},
        ],
        grid: [1, 2, 5],
    },
    {
        id: 58, name: 'X射线裂解', time: 240,
        from: [
            {item: itemsMap.get(1114)!, count: 1},
            {item: itemsMap.get(1120)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1120)!, count: 3},
            {item: itemsMap.get(1109)!, count: 1},
        ],
        grid: [1, 2, 7],
        icon: 'X-ray',
    },
    {
        id: 59, name: '高纯硅块', time: 120,
        from: [
            {item: itemsMap.get(1003)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1105)!, count: 1},
        ],
        grid: [1, 1, 3],
    },
    {
        id: 60, name: '金刚石', time: 120,
        from: [
            {item: itemsMap.get(1109)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1112)!, count: 1},
        ],
        grid: [1, 2, 6],
    },
    {
        id: 61, name: '金刚石（高效）', time: 90,
        from: [
            {item: itemsMap.get(1012)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1112)!, count: 2},
        ],
        grid: [1, 3, 6],
        icon: 'diamond-lv2',
    },
    {
        id: 62, name: '晶格硅（高效）', time: 90,
        from: [
            {item: itemsMap.get(1013)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1113)!, count: 2},
        ],
        grid: [1, 3, 3],
        icon: 'silicium-high-purity-lv2',
    },
    {
        id: 63, name: '钢材', time: 180,
        from: [
            {item: itemsMap.get(1101)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(1103)!, count: 1},
        ],
        grid: [1, 3, 1],
    },
    {
        id: 64, name: '火力发电厂', time: 300,
        from: [
            {item: itemsMap.get(1101)!, count: 10},
            {item: itemsMap.get(1108)!, count: 4},
            {item: itemsMap.get(1201)!, count: 4},
            {item: itemsMap.get(1202)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2204)!, count: 1},
        ],
        grid: [2, 1, 5],
    },
    {
        id: 65, name: '钛块', time: 120,
        from: [
            {item: itemsMap.get(1004)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1106)!, count: 1},
        ],
        grid: [1, 1, 4],
    },
    {
        id: 66, name: '钛合金', time: 720,
        from: [
            {item: itemsMap.get(1106)!, count: 4},
            {item: itemsMap.get(1103)!, count: 4},
            {item: itemsMap.get(1116)!, count: 8},
        ],
        to: [
            {item: itemsMap.get(1107)!, count: 4},
        ],
        grid: [1, 2, 4],
    },
    {
        id: 67, name: '太阳能板', time: 360,
        from: [
            {item: itemsMap.get(1104)!, count: 10},
            {item: itemsMap.get(1105)!, count: 10},
            {item: itemsMap.get(1301)!, count: 5},
        ],
        to: [
            {item: itemsMap.get(2205)!, count: 1},
        ],
        grid: [2, 1, 6],
    },
    {
        id: 68, name: '光子合并器', time: 180,
        from: [
            {item: itemsMap.get(1111)!, count: 2},
            {item: itemsMap.get(1301)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1404)!, count: 1},
        ],
        grid: [1, 6, 1],
    },
    {
        id: 69, name: '光子合并器（高效）', time: 180,
        from: [
            {item: itemsMap.get(1014)!, count: 1},
            {item: itemsMap.get(1301)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1404)!, count: 1},
        ],
        grid: [1, 6, 2],
        icon: 'photo-shifter-lv2',
    },
    {
        id: 70, name: '太阳帆', time: 240,
        from: [
            {item: itemsMap.get(1123)!, count: 1},
            {item: itemsMap.get(1404)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1501)!, count: 2},
        ],
        grid: [1, 5, 10],
    },
    {
        id: 71, name: '电磁轨道弹射器', time: 360,
        from: [
            {item: itemsMap.get(1103)!, count: 20},
            {item: itemsMap.get(1201)!, count: 20},
            {item: itemsMap.get(1303)!, count: 5},
            {item: itemsMap.get(1205)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(2311)!, count: 1},
        ],
        grid: [2, 3, 11],
    },
    {
        id: 72, name: '射线接收站', time: 480,
        from: [
            {item: itemsMap.get(1103)!, count: 20},
            {item: itemsMap.get(1105)!, count: 20},
            {item: itemsMap.get(1404)!, count: 10},
            {item: itemsMap.get(1303)!, count: 5},
            {item: itemsMap.get(1205)!, count: 20},
        ],
        to: [
            {item: itemsMap.get(2208)!, count: 1},
        ],
        grid: [2, 1, 11],
    },
    {
        id: 73, name: '卫星配电站', time: 300,
        from: [
            {item: itemsMap.get(2202)!, count: 1},
            {item: itemsMap.get(1205)!, count: 10},
            {item: itemsMap.get(1125)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2212)!, count: 1},
        ],
        grid: [2, 1, 3],
    },
    {
        id: 74, name: '光子物质化', time: 120,
        from: [
            {item: itemsMap.get(1208)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1122)!, count: 2},
            {item: itemsMap.get(1120)!, count: 2},
        ],
        grid: [1, 6, 8],
        icon: 'photon-formula',
    },
    {
        id: 75, name: '宇宙矩阵', time: 900,
        from: [
            {item: itemsMap.get(6001)!, count: 1},
            {item: itemsMap.get(6002)!, count: 1},
            {item: itemsMap.get(6003)!, count: 1},
            {item: itemsMap.get(6004)!, count: 1},
            {item: itemsMap.get(6005)!, count: 1},
            {item: itemsMap.get(1122)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(6006)!, count: 1},
        ],
        grid: [1, 7, 6],
    },
    {
        id: 76, name: '蓄电器', time: 300,
        from: [
            {item: itemsMap.get(1101)!, count: 6},
            {item: itemsMap.get(1205)!, count: 1},
            {item: itemsMap.get(1113)!, count: 6},
        ],
        to: [
            {item: itemsMap.get(2206)!, count: 1},
        ],
        grid: [2, 1, 7],
    },
    {
        id: 77, name: '能量枢纽', time: 900,
        from: [
            {item: itemsMap.get(1107)!, count: 40},
            {item: itemsMap.get(1103)!, count: 40},
            {item: itemsMap.get(1303)!, count: 40},
            {item: itemsMap.get(1206)!, count: 8},
        ],
        to: [
            {item: itemsMap.get(2209)!, count: 1},
        ],
        grid: [2, 1, 10],
    },
    {
        id: 78, name: '空间翘曲器', time: 600,
        from: [
            {item: itemsMap.get(1209)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1210)!, count: 1},
        ],
        grid: [1, 5, 7],
    },
    {
        id: 79, name: '空间翘曲器（高级）', time: 600,
        from: [
            {item: itemsMap.get(6005)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1210)!, count: 8},
        ],
        grid: [1, 6, 7],
        icon: 'space-warper-lv2',
    },
    {
        id: 80, name: '框架材料', time: 360,
        from: [
            {item: itemsMap.get(1124)!, count: 4},
            {item: itemsMap.get(1107)!, count: 1},
            {item: itemsMap.get(1105)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1125)!, count: 1},
        ],
        grid: [1, 5, 11],
    },
    {
        id: 81, name: '戴森球组件', time: 480,
        from: [
            {item: itemsMap.get(1125)!, count: 3},
            {item: itemsMap.get(1501)!, count: 3},
            {item: itemsMap.get(1303)!, count: 3},
        ],
        to: [
            {item: itemsMap.get(1502)!, count: 1},
        ],
        grid: [1, 5, 12],
    },
    {
        id: 82, name: '垂直发射井', time: 1800,
        from: [
            {item: itemsMap.get(1107)!, count: 80},
            {item: itemsMap.get(1125)!, count: 30},
            {item: itemsMap.get(1209)!, count: 20},
            {item: itemsMap.get(1305)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(2312)!, count: 1},
        ],
        grid: [2, 3, 12],
    },
    {
        id: 83, name: '小型运载火箭', time: 360,
        from: [
            {item: itemsMap.get(1502)!, count: 2},
            {item: itemsMap.get(1802)!, count: 4},
            {item: itemsMap.get(1305)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1503)!, count: 1},
        ],
        grid: [1, 4, 12],
    },
    {
        id: 84, name: '低速传送带', time: 60,
        from: [
            {item: itemsMap.get(1101)!, count: 2},
            {item: itemsMap.get(1201)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2001)!, count: 3},
        ],
        grid: [2, 2, 1],
    },
    {
        id: 85, name: '低速分拣器', time: 60,
        from: [
            {item: itemsMap.get(1101)!, count: 1},
            {item: itemsMap.get(1301)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2011)!, count: 1},
        ],
        grid: [2, 3, 1],
    },
    {
        id: 86, name: '小型储物仓', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 4},
            {item: itemsMap.get(1108)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2101)!, count: 1},
        ],
        grid: [2, 2, 7],
    },
    {
        id: 87, name: '四向分流器', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 3},
            {item: itemsMap.get(1201)!, count: 2},
            {item: itemsMap.get(1301)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2020)!, count: 1},
        ],
        grid: [2, 2, 4],
    },
    {
        id: 88, name: '高速分拣器', time: 60,
        from: [
            {item: itemsMap.get(2011)!, count: 2},
            {item: itemsMap.get(1203)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2012)!, count: 2},
        ],
        grid: [2, 3, 2],
    },
    {
        id: 89, name: '高速传送带', time: 60,
        from: [
            {item: itemsMap.get(2001)!, count: 3},
            {item: itemsMap.get(1204)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2002)!, count: 3},
        ],
        grid: [2, 2, 2],
    },
    {
        id: 90, name: '极速分拣器', time: 60,
        from: [
            {item: itemsMap.get(2012)!, count: 2},
            {item: itemsMap.get(1204)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2013)!, count: 2},
        ],
        grid: [2, 3, 3],
    },
    {
        id: 91, name: '大型储物仓', time: 240,
        from: [
            {item: itemsMap.get(1103)!, count: 8},
            {item: itemsMap.get(1108)!, count: 8},
        ],
        to: [
            {item: itemsMap.get(2102)!, count: 1},
        ],
        grid: [2, 2, 8],
    },
    {
        id: 92, name: '极速传送带', time: 60,
        from: [
            {item: itemsMap.get(2002)!, count: 3},
            {item: itemsMap.get(1205)!, count: 1},
            {item: itemsMap.get(1123)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2003)!, count: 3},
        ],
        grid: [2, 2, 3],
    },
    {
        id: 93, name: '物流运输站', time: 1200,
        from: [
            {item: itemsMap.get(1103)!, count: 40},
            {item: itemsMap.get(1106)!, count: 40},
            {item: itemsMap.get(1303)!, count: 40},
            {item: itemsMap.get(1206)!, count: 20},
        ],
        to: [
            {item: itemsMap.get(2103)!, count: 1},
        ],
        grid: [2, 2, 10],
    },
    {
        id: 94, name: '物流运输机', time: 240,
        from: [
            {item: itemsMap.get(1101)!, count: 5},
            {item: itemsMap.get(1303)!, count: 2},
            {item: itemsMap.get(1405)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(5001)!, count: 1},
        ],
        grid: [1, 4, 10],
    },
    {
        id: 95, name: '星际物流运输站', time: 1800,
        from: [
            {item: itemsMap.get(2103)!, count: 1},
            {item: itemsMap.get(1107)!, count: 40},
            {item: itemsMap.get(1206)!, count: 20},
        ],
        to: [
            {item: itemsMap.get(2104)!, count: 1},
        ],
        grid: [2, 2, 11],
    },
    {
        id: 96, name: '星际物流运输船', time: 360,
        from: [
            {item: itemsMap.get(1107)!, count: 10},
            {item: itemsMap.get(1303)!, count: 10},
            {item: itemsMap.get(1406)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(5002)!, count: 1},
        ],
        grid: [1, 4, 11],
    },
    {
        id: 97, name: '电动机', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 2},
            {item: itemsMap.get(1201)!, count: 1},
            {item: itemsMap.get(1202)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1203)!, count: 1},
        ],
        grid: [1, 3, 2],
    },
    {
        id: 98, name: '电磁涡轮', time: 120,
        from: [
            {item: itemsMap.get(1203)!, count: 2},
            {item: itemsMap.get(1202)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1204)!, count: 1},
        ],
        grid: [1, 4, 2],
    },
    {
        id: 99, name: '粒子容器', time: 240,
        from: [
            {item: itemsMap.get(1204)!, count: 2},
            {item: itemsMap.get(1104)!, count: 2},
            {item: itemsMap.get(1123)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1206)!, count: 1},
        ],
        grid: [1, 5, 6],
    },
    {
        id: 100, name: '粒子容器（高效）', time: 240,
        from: [
            {item: itemsMap.get(1016)!, count: 10},
            {item: itemsMap.get(1104)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(1206)!, count: 1},
        ],
        grid: [1, 6, 6],
        icon: 'partical-capacitor-lv2',
    },
    {
        id: 101, name: '引力透镜', time: 360,
        from: [
            {item: itemsMap.get(1112)!, count: 4},
            {item: itemsMap.get(1127)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1209)!, count: 1},
        ],
        grid: [1, 4, 5],
    },
    {
        id: 102, name: '引力矩阵', time: 1440,
        from: [
            {item: itemsMap.get(1209)!, count: 1},
            {item: itemsMap.get(1305)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(6005)!, count: 2},
        ],
        grid: [1, 7, 5],
    },
    {
        id: 103, name: '超级磁场环', time: 180,
        from: [
            {item: itemsMap.get(1204)!, count: 2},
            {item: itemsMap.get(1102)!, count: 3},
            {item: itemsMap.get(1109)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1205)!, count: 1},
        ],
        grid: [1, 5, 2],
    },
    {
        id: 104, name: '奇异物质', time: 480,
        from: [
            {item: itemsMap.get(1206)!, count: 2},
            {item: itemsMap.get(1101)!, count: 2},
            {item: itemsMap.get(1121)!, count: 10},
        ],
        to: [
            {item: itemsMap.get(1127)!, count: 1},
        ],
        grid: [1, 3, 12],
    },
    {
        id: 106, name: '增产剂 Mk.I', time: 30,
        from: [
            {item: itemsMap.get(1006)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1141)!, count: 1},
        ],
        grid: [1, 1, 10],
    },
    {
        id: 107, name: '增产剂 Mk.II', time: 60,
        from: [
            {item: itemsMap.get(1141)!, count: 2},
            {item: itemsMap.get(1112)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1142)!, count: 1},
        ],
        grid: [1, 1, 11],
    },
    {
        id: 108, name: '增产剂 Mk.III', time: 120,
        from: [
            {item: itemsMap.get(1142)!, count: 2},
            {item: itemsMap.get(1124)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1143)!, count: 1},
        ],
        grid: [1, 1, 12],
    },
    {
        id: 109, name: '喷涂机', time: 180,
        from: [
            {item: itemsMap.get(1103)!, count: 4},
            {item: itemsMap.get(1401)!, count: 2},
            {item: itemsMap.get(1301)!, count: 2},
            {item: itemsMap.get(1302)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2313)!, count: 1},
        ],
        grid: [2, 4, 6],
    },
    {
        id: 110, name: '分馏塔', time: 180,
        from: [
            {item: itemsMap.get(1103)!, count: 8},
            {item: itemsMap.get(1108)!, count: 4},
            {item: itemsMap.get(1110)!, count: 4},
            {item: itemsMap.get(1303)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2314)!, count: 1},
        ],
        grid: [2, 3, 9],
    },
    {
        id: 111, name: '轨道采集器', time: 1800,
        from: [
            {item: itemsMap.get(2104)!, count: 1},
            {item: itemsMap.get(1205)!, count: 50},
            {item: itemsMap.get(1406)!, count: 20},
            {item: itemsMap.get(2207)!, count: 20},
        ],
        to: [
            {item: itemsMap.get(2105)!, count: 1},
        ],
        grid: [2, 2, 12],
    },
    {
        id: 112, name: '地基', time: 60,
        from: [
            {item: itemsMap.get(1108)!, count: 3},
            {item: itemsMap.get(1103)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(1131)!, count: 1},
        ],
        grid: [1, 7, 12],
    },
    {
        id: 113, name: '微型聚变发电站', time: 600,
        from: [
            {item: itemsMap.get(1107)!, count: 12},
            {item: itemsMap.get(1205)!, count: 10},
            {item: itemsMap.get(1124)!, count: 8},
            {item: itemsMap.get(1303)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2211)!, count: 1},
        ],
        grid: [2, 1, 9],
    },
    {
        id: 114, name: '储液罐', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 8},
            {item: itemsMap.get(1108)!, count: 4},
            {item: itemsMap.get(1110)!, count: 4},
        ],
        to: [
            {item: itemsMap.get(2106)!, count: 1},
        ],
        grid: [2, 2, 9],
    },
    {
        id: 115, name: '重氢分馏', time: 1,
        from: [
            {item: itemsMap.get(1120)!, count: 100},
        ],
        to: [
            {item: itemsMap.get(1121)!, count: 1},
        ],
        grid: [1, 3, 7],
        icon: 'deuterium-formula',
    },
    {
        id: 116, name: '位面熔炉', time: 300,
        from: [
            {item: itemsMap.get(2302)!, count: 1},
            {item: itemsMap.get(1125)!, count: 5},
            {item: itemsMap.get(1304)!, count: 4},
            {item: itemsMap.get(1016)!, count: 15},
        ],
        to: [
            {item: itemsMap.get(2315)!, count: 1},
        ],
        grid: [2, 4, 5],
    },
    {
        id: 117, name: '流速监测器', time: 120,
        from: [
            {item: itemsMap.get(1101)!, count: 3},
            {item: itemsMap.get(1201)!, count: 2},
            {item: itemsMap.get(1110)!, count: 1},
            {item: itemsMap.get(1301)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2030)!, count: 1},
        ],
        grid: [2, 2, 6],
    },
    {
        id: 118, name: '地热发电站', time: 360,
        from: [
            {item: itemsMap.get(1103)!, count: 15},
            {item: itemsMap.get(1104)!, count: 20},
            {item: itemsMap.get(1404)!, count: 4},
            {item: itemsMap.get(1205)!, count: 1},
        ],
        to: [
            {item: itemsMap.get(2213)!, count: 1},
        ],
        grid: [2, 1, 8],
    },
    {
        id: 119, name: '大型采矿机', time: 1200,
        from: [
            {item: itemsMap.get(1107)!, count: 20},
            {item: itemsMap.get(1125)!, count: 10},
            {item: itemsMap.get(1205)!, count: 10},
            {item: itemsMap.get(1305)!, count: 4},
            {item: itemsMap.get(1014)!, count: 40},
        ],
        to: [
            {item: itemsMap.get(2316)!, count: 1},
        ],
        grid: [2, 3, 5],
    },
    {
        id: 120, name: '自动集装机', time: 240,
        from: [
            {item: itemsMap.get(1103)!, count: 3},
            {item: itemsMap.get(1201)!, count: 4},
            {item: itemsMap.get(1205)!, count: 1},
            {item: itemsMap.get(1303)!, count: 2},
        ],
        to: [
            {item: itemsMap.get(2040)!, count: 1},
        ],
        grid: [2, 2, 5],
    },
];
