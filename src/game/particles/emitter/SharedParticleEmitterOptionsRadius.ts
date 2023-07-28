import * as THREE from "three";

export interface SharedParticleEmitterOptionsRadiusInterface {
    axis: THREE.Vector3;
    axisSpread: THREE.Vector3;
    angle: number;
    angleSpread: number;
    static: boolean;
    center: THREE.Vector3;
    randomise: boolean;
}
