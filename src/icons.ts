import { BufferGeometry, InstancedBufferAttribute, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, UniformsUtils, ShaderMaterial, Texture, UniformsLib, Color, ShaderLib, Vector2, Vector3 } from "three";
import { IconTexture } from "./iconTexture";

export class IconsMaterial extends ShaderMaterial {
    sizeAttenuation = true;

    get map() { return this.uniforms.map.value as Texture; }
    set map(m: Texture) { this.uniforms.map.value = m; }

    get color() { return this.uniforms.diffuse.value as Color; }
    set color(m: Color) { this.uniforms.diffuse.value = m; }

    get iMapSize() { return this.uniforms.iMapSize.value as Vector2; }
    set iMapSize(m: Vector2) { this.uniforms.iMapSize.value = m; }

    constructor(map: Texture) {
        super({
            uniforms: UniformsUtils.merge([
                UniformsLib.common,
                {
                    iMapSize: {
                        value: new Vector2(IconTexture.WIDTH, IconTexture.HEIGHT),
                    },
                },
            ]),
            vertexShader: `
attribute vec3 iconPos;
attribute vec2 iconScale;

attribute int iconId;
attribute vec2 offset;

uniform ivec2 iMapSize;

#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	#include <uv_vertex>
	ivec2 iPosition = ivec2(iconId % iMapSize.x, iconId / iMapSize.x);
	vUv = (vUv + vec2(iPosition)) / vec2(iMapSize);

	vec4 mvPosition = modelViewMatrix * vec4(iconPos, 1.0);

	vec2 scale = iconScale;
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif

	mvPosition.xy += position.xy * scale + offset;

	vec4 depthPosition = mvPosition;
	depthPosition.z += 5.;

	vec4 glDepthPosition = projectionMatrix * depthPosition;
	gl_Position = projectionMatrix * mvPosition;
	gl_Position /= gl_Position.w;
	gl_Position.z = glDepthPosition.z / glDepthPosition.w;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
            fragmentShader: ShaderLib.sprite.fragmentShader,
        });
        this.map = map;
        this.depthTest = true;
        this.depthWrite = false;
        this.transparent = true;
        this.fog = true;
        this.defaultAttributeValues.iconScale = Float32Array.of(1.0, 1.0);
    }
}

export class IconGeometry extends BufferGeometry {
    constructor() {
        super();
        const float32Array = new Float32Array([
            - 0.5, - 0.5, 0, 0, 0,
            - 0.5,   0.5, 0, 0, 1,
              0.5, - 0.5, 0, 1, 0,
              0.5,   0.5, 0, 1, 1,
        ]);

        const interleavedBuffer = new InterleavedBuffer(float32Array, 5);

        this.setIndex([0, 2, 1,  1, 2, 3]);
        this.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
        this.setAttribute('uv',       new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
    }
}

export class Icons extends InstancedMesh {
    constructor(map: Texture, length: number) {
        const material = new IconsMaterial(map);
        const geometry = new IconGeometry()
        super(geometry, material, length);

        this.geometry.setAttribute('iconId', new InstancedBufferAttribute(new Int32Array(length), 1));
        this.geometry.setAttribute('iconPos', new InstancedBufferAttribute(new Float32Array(length * 3), 3));
        this.geometry.setAttribute('iconScale', new InstancedBufferAttribute(new Float32Array(length * 2), 2));
    }

    setIcon(index: number, iconId: number, pos: Vector3, scale: Vector2) {
        (this.geometry.getAttribute('iconId').array as Int32Array)[index] = iconId;
        pos.toArray(this.geometry.getAttribute('iconPos').array, index * 3);
        scale.toArray(this.geometry.getAttribute('iconScale').array, index * 2);
    }

    needsUpdate() {
        this.geometry.getAttribute('iconId').needsUpdate = true;
        this.geometry.getAttribute('iconPos').needsUpdate = true;
        this.geometry.getAttribute('iconScale').needsUpdate = true;
    }
}
