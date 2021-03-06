import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from "three";
import { BVH } from "./bvh";

export class BVHHelper extends LineSegments {
    constructor(bvh: BVH, color = 0x00ff00) {
        const vertices: number[] = [];
        const traverse = (node: typeof bvh.root) => {
            const min = node.bounding.min;
            const max = node.bounding.max;

            vertices.push(max.x, max.y, max.z); vertices.push(min.x, max.y, max.z); // 0, 1
            vertices.push(min.x, max.y, max.z); vertices.push(min.x, min.y, max.z); // 1, 2
            vertices.push(min.x, min.y, max.z); vertices.push(max.x, min.y, max.z); // 2, 3
            vertices.push(max.x, min.y, max.z); vertices.push(max.x, max.y, max.z); // 3, 0

            vertices.push(max.x, max.y, min.z); vertices.push(min.x, max.y, min.z); // 4, 5
            vertices.push(min.x, max.y, min.z); vertices.push(min.x, min.y, min.z); // 5, 6
            vertices.push(min.x, min.y, min.z); vertices.push(max.x, min.y, min.z); // 6, 7
            vertices.push(max.x, min.y, min.z); vertices.push(max.x, max.y, min.z); // 7, 4

            vertices.push(max.x, max.y, max.z); vertices.push(max.x, max.y, min.z); // 0, 4
            vertices.push(min.x, max.y, max.z); vertices.push(min.x, max.y, min.z); // 1, 5
            vertices.push(min.x, min.y, max.z); vertices.push(min.x, min.y, min.z); // 2, 6
            vertices.push(max.x, min.y, max.z); vertices.push(max.x, min.y, min.z); // 3, 7

            for (const n of node.children)
                traverse(n);
        }
        traverse(bvh.root);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

        super(geometry, new LineBasicMaterial({ color: color, toneMapped: false }));
    }
}
