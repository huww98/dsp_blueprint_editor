import { BoxGeometry, InstancedBufferAttribute, InstancedMesh, MeshLambertMaterial, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";

class CargoGeometry extends BoxGeometry {
    cargoDistance
    constructor(count: number) {
        super(0.3, 0.15, 0.4);
        this.cargoDistance = new InstancedBufferAttribute(new Float32Array(count), 1);
        this.setAttribute('cargoDistance', this.cargoDistance);
    }
}

class CargoMaterial extends MeshLambertMaterial {
    cargoMoveUniform = { value: 0. };

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) {
        parameters.vertexShader = parameters.vertexShader
            .replace('#include <common>',
`attribute float cargoDistance;
uniform float cargoMove;

#include <common>`)
            .replace('#include <skinning_vertex>',
`#include <skinning_vertex>
transformed.z -= cargoMove * cargoDistance;
`);
        parameters.uniforms.cargoMove = this.cargoMoveUniform;
    }
}

export class Cargos extends InstancedMesh {
    geometry;
    material;
    constructor(count: number) {
        const geometry = new CargoGeometry(count);
        const material = new CargoMaterial();
        super(geometry, material, count);
        this.geometry = geometry;
        this.material = material;
    }

    setCargoDistanceAt(i: number, d: number) {
        (this.geometry.cargoDistance.array as Float32Array)[i] = d;
    }


    public get cargoMove() {
        return this.material.cargoMoveUniform.value;
    }
    public set cargoMove(v) {
        this.material.cargoMoveUniform.value = v;
    }

}
