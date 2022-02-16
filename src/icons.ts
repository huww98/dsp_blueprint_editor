import { BufferGeometry, InstancedBufferAttribute, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, UniformsUtils, ShaderMaterial, Texture, UniformsLib, Color } from "three";

class IconsMaterial extends ShaderMaterial {
	sizeAttenuation = true;

    get map() { return this.uniforms.map.value as Texture; }
    set map(m: Texture) { this.uniforms.map.value = m; }

    get color() { return this.uniforms.diffuse.value as Color; }
    set color(m: Color) { this.uniforms.diffuse.value = m; }

	constructor(map: Texture) {
		super({
            uniforms: UniformsUtils.merge([
                UniformsLib.common,
            ]),
			vertexShader: `
attribute int iconId;
flat varying int vIconId;

#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	vIconId = iconId;

	#include <uv_vertex>

	vec4 mvPosition = vec4( 0.0, 0.0, 0.0, 1.0 );
	#ifdef USE_INSTANCING
		mvPosition = instanceMatrix * mvPosition;
	#endif
	mvPosition = modelViewMatrix * mvPosition;

	mat3 worldMatrix = mat3(modelMatrix);
	#ifdef USE_INSTANCING
		worldMatrix *= mat3(instanceMatrix);
	#endif
	vec2 scale;
	scale.x = length(worldMatrix[0]);
	scale.y = length(worldMatrix[1]);

	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif

	mvPosition.xy += position.xy * scale;

    vec4 depthPosition = mvPosition;
    depthPosition.z += 3.;

    vec4 glDepthPosition = projectionMatrix * depthPosition;
	gl_Position = projectionMatrix * mvPosition;
    gl_Position /= gl_Position.w;
    gl_Position.z = glDepthPosition.z / glDepthPosition.w;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
			fragmentShader: `
uniform vec3 diffuse;
uniform float opacity;

flat varying int vIconId;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>

	const ivec2 iMapSize = ivec2(16, 16);
	ivec2 iPosition = ivec2(vIconId % iMapSize.x, vIconId / iMapSize.x);
	vec2 uvIcon = (vUv + vec2(iPosition)) / vec2(iMapSize);
	#define vUv uvIcon

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,
        });
        this.map = map;
		this.depthTest = true;
        this.depthWrite = false;
        this.transparent = true;
        this.fog = true;
	}
}

class IconGeometry extends BufferGeometry {
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
    static iconGeometry = new IconGeometry()

	constructor(map: Texture, length: number) {
		const material = new IconsMaterial(map);
		super(Icons.iconGeometry, material, length);
	}

	setIconIds(ids: number[]) {
		this.geometry.setAttribute('iconId', new InstancedBufferAttribute(new Int32Array(ids), 1));
	}
}
