import { Vector3, Matrix4, InstancedBufferGeometry, InterleavedBuffer, InterleavedBufferAttribute, Uint16BufferAttribute, ShaderMaterial, ShaderLib, Mesh, RGBAFormat, FloatType, DataTexture } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { BezierCurve } from "./bezierCurve";

function projAndMirror(a: Vector3, up: Vector3) {
    const proj = a.clone().projectOnPlane(up);
    return proj.subVectors(up, proj);
}

export class BeltCurve {
    curve: BezierCurve<Vector3>;
    constructor(prev: Vector3 | null, cur: Vector3, next: Vector3 | null) {
        if (prev === null && next === null) {
            throw new Error("prev and next cannot both be null");
        } else {
            if (prev === null)
                prev = projAndMirror(next!, cur);
            if (next === null)
                next = projAndMirror(prev, cur);
        }

        const a = prev.clone().add(cur).multiplyScalar(0.5);
        const b = prev.clone().lerp(cur, 2/3)
        const c = next.clone().lerp(cur, 2/3);
        const d = next.clone().add(cur).multiplyScalar(0.5);
        this.curve = new BezierCurve(a, b, c, d);
    }

    numSegments() {
        let n = 1;
        const prevToCur = this.curve.a_b;
        const curToNext = this.curve.c_d;
        const angle =  prevToCur.angleTo(curToNext);
        if (angle < degToRad(10))
            n = 1;
        else if (angle < degToRad(30))
            n = 2;
        else if (angle < degToRad(60))
            n = 4;
        else
            n = 8;

        return n;
    }

    getSegments(buffer: Float32Array, offset: number, nSeg: number) {
        const ZERO = new Vector3();
        const pos = new Vector3();
        const dir = new Vector3();
        const trans = new Matrix4();

        for (let i = 0; i <= nSeg; i++) {
            const t = i / nSeg;
            this.curve.getPoint(t, pos, dir);
            trans.lookAt(ZERO, dir, pos).setPosition(pos);
            trans.toArray(buffer, offset + i * 16);
        }
        return buffer;
    }
}

export class BeltGemotry extends InstancedBufferGeometry {
    constructor(numSegments: number, thickness = 0.1, width = 0.5) {
        super();

        // 4 plane, 2(n + 1) vertices per plane, 8 * 4 bytes per vertex (pos, normal, uv)
        const stride = 8 * 4;
        const buffer = new ArrayBuffer(4 * 2 * (numSegments + 1) * stride);
        const view = new DataView(buffer);
        const indices = new Uint16Array(4 * 6 * numSegments);

        const h = width / 2;
        const t = thickness;
        buildPlane(0, [-h, h],  t, [0.0, 0.6], 0); // top
        buildPlane(1, [ t, 0],  h, [0.6, 0.7], 1); // right
        buildPlane(0, [ h,-h],  0, [0.7, 0.9], 2); // bottom
        buildPlane(1, [ 0, t], -h, [0.9, 1.0], 3); // left

        const interleavedBuffer = new InterleavedBuffer(new Float32Array(buffer), 8);
        this.setAttribute("position", new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
        this.setAttribute("normal"  , new InterleavedBufferAttribute(interleavedBuffer, 3, 3, false));
        this.setAttribute("uv"      , new InterleavedBufferAttribute(interleavedBuffer, 2, 6, false));
        this.setIndex(new Uint16BufferAttribute(indices, 1));

        function buildPlane(x: 0|1, xvalue: [number, number], yvalue: number, v: [number, number], iPlane: number) {
            const y = 1 - x;
            const vOffsetBytes = iPlane * 2 * (numSegments + 1) * stride;
            const normal = new Vector3();
            if (x === 0)
                normal.y = Math.sign(xvalue[1] - xvalue[0]);
            else
                normal.x = Math.sign(xvalue[0] - xvalue[1]);

            // generate vertices
            for (let i = 0; i <= numSegments; i++) {
                const u = i / numSegments;
                for (let j = 0; j < 2; j++) {
                    const off = vOffsetBytes + (2*i + j) * stride;
                    view.setFloat32(off +4*x, xvalue[j], true);
                    view.setFloat32(off +4*y, yvalue   , true);
                    view.setFloat32(off +  8, i        , true); // use z component to store segment index
                    view.setFloat32(off + 12, normal.x , true);
                    view.setFloat32(off + 16, normal.y , true);
                    view.setFloat32(off + 20, normal.z , true);
                    view.setFloat32(off + 24, u        , true);
                    view.setFloat32(off + 28, v[j]     , true);
                }
            }

            // generate indices
            const iOffset = iPlane * 6 * numSegments;
            const iBase = iPlane * 2 * (numSegments + 1);
            for (let i = 0; i < numSegments; i++) {
                const off = iOffset + i * 6;
                const i0 = iBase + i * 2;
                const i1 = i0 + 1;
                const i2 = i0 + 2;
                const i3 = i0 + 3;
                indices[off + 0] = i0;
                indices[off + 1] = i1;
                indices[off + 2] = i2;
                indices[off + 3] = i2;
                indices[off + 4] = i1;
                indices[off + 5] = i3;
            }
        }
    }
}

const BELT_VERTEX_SHADER = `
#define STANDARD

varying vec3 vViewPosition;

uniform sampler2D segmentTransTexture;
uniform int numSegments;

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

mat4 segmentTrans(int segmentIndex) {
    int texWidth = textureSize(segmentTransTexture, 0).x;
    int offset = segmentIndex * 4;
    int x = offset % texWidth;
    int y = offset / texWidth;
    mat4 segMat;
    segMat[0] = texelFetch(segmentTransTexture, ivec2(x + 0, y), 0);
    segMat[1] = texelFetch(segmentTransTexture, ivec2(x + 1, y), 0);
    segMat[2] = texelFetch(segmentTransTexture, ivec2(x + 2, y), 0);
    segMat[3] = texelFetch(segmentTransTexture, ivec2(x + 3, y), 0);
    return segMat;
}

void main() {

    #include <uv_vertex>
    #include <color_vertex>

    int segmentIndex = int(position.z) + gl_InstanceID * (numSegments + 1);
    mat4 segMat = segmentTrans(segmentIndex);
    mat3 segMatNormal = mat3(segMat);

    #include <beginnormal_vertex>

    objectNormal = segMatNormal * objectNormal;
    #ifdef USE_TANGENT
        vec3 objectTangent = segMatNormal * objectTangent;
    #endif

    #include <defaultnormal_vertex>
    #include <normal_vertex>

    vec4 mvPosition =  vec4(position.xy, 0.0, 1.0);
    mvPosition = segMat * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    vViewPosition = - mvPosition.xyz;

    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
}
`;

export class BeltMaterial extends ShaderMaterial {
    constructor(numSegments: number) {
        super({
            vertexShader: BELT_VERTEX_SHADER,
            fragmentShader: ShaderLib.standard.fragmentShader,
            uniforms: {
                ...ShaderLib.standard.uniforms,
                segmentTransTexture: { value: null },
                numSegments: { value: numSegments },
            },
            lights: true,
            clipping: true,
            fog: true,
        });
        this.defaultAttributeValues.instanceMatrix = new Matrix4().identity();
    }
}

export class BeltRenderBatch extends Mesh<BeltGemotry, BeltMaterial> {
    segmentTransTexture: DataTexture | null = null;
    segmentTransBuffer: Float32Array;

    constructor(public readonly numSegments: number, allBeltCurves: BeltCurve[]) {
        const geo = new BeltGemotry(numSegments);
        super(
            geo,
            new BeltMaterial(numSegments),
        );

        this.frustumCulled = false;
        this.castShadow = true;
        this.receiveShadow = true;

        const stride = numSegments + 1;
        const buffer = new Float32Array(16 * stride * allBeltCurves.length);
        for (let i = 0; i < allBeltCurves.length; i++) {
            const curve = allBeltCurves[i];
            curve.getSegments(buffer, i * 16 * stride, numSegments);
        }

        this.segmentTransBuffer = buffer;
        geo.instanceCount = allBeltCurves.length;

        this.onBeforeRender = (renderer) => {
            if (!this.segmentTransTexture) {
                const maxSize = renderer.capabilities.maxTextureSize;
                const column = Math.ceil(allBeltCurves.length / maxSize);
                const width = column * 4 * (numSegments + 1);
                const height = Math.ceil(allBeltCurves.length / column);

                let buffer = this.segmentTransBuffer;
                if (buffer.length !== width * height * 4) {
                    buffer = new Float32Array(width * height * 4);
                    buffer.set(this.segmentTransBuffer);
                    this.segmentTransBuffer = buffer;
                }
                this.segmentTransTexture = new DataTexture(buffer, width, height);
                this.segmentTransTexture.format = RGBAFormat;
                this.segmentTransTexture.type = FloatType;
                this.segmentTransTexture.needsUpdate = true;

                const material = this.material;
                material.needsUpdate = true;
                material.uniforms.segmentTransTexture.value = this.segmentTransTexture;
            }

        }
    }

    updateBelt(i: number, curve: BeltCurve) {
        const tex = this.segmentTransTexture;
        if (tex !== null)
            tex.needsUpdate = true;
        // TODO: update range

        const arr = this.segmentTransBuffer;
        curve.getSegments(arr, i * 16 * this.numSegments, this.numSegments);
    }
}
