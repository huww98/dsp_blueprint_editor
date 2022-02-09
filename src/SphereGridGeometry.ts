import { BufferGeometry } from 'three';
import { Float32BufferAttribute } from 'three';

interface SphereGeometryParameters {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart?: number;
    phiLength?: number;
    thetaStart?: number;
    thetaLength?: number;
}

class SphereBaseGridGeometry extends BufferGeometry {
    type = 'SphereBaseGridGeometry'
    constructor({ radius, widthSegments, heightSegments, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI }: SphereGeometryParameters) {
        super();

        const vertices = [];

        // generate vertices
        for (let iy = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments;

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;

                const x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                const y = radius * Math.cos(thetaStart + v * thetaLength);
                const z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

                vertices.push(x, y, z);
            }
        }

        this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    }
}

export class SphereLatitudeGridGeometry extends SphereBaseGridGeometry {
    type = 'SphereLatitudeGridGeometry';
    constructor(params: SphereGeometryParameters) {
        super(params);
        const { widthSegments, heightSegments, thetaStart = 0 } = params;

        const indices = [];

        const w = widthSegments + 1;
        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = iy * w + ix + 1;
                const b = iy * w + ix;

                if (iy !== 0 || thetaStart > 0)
                    indices.push(a, b);
            }
        }

        this.setIndex(indices);
    }
}

export class SphereLongitudeGridGeometry extends SphereBaseGridGeometry {
    type = 'SphereLongitudeGridGeometry';
    constructor(params: SphereGeometryParameters) {
        super(params);
        const { widthSegments, heightSegments } = params;

        const indices = [];

        const w = widthSegments + 1;
        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const b = iy * w + ix;
                const c = (iy + 1) * w + ix;

                indices.push(b, c);
            }
        }

        this.setIndex(indices);
    }
}
