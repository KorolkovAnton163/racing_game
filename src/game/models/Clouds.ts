import * as THREE from "three";
import {ShaderParticleGroup} from "../particles/ShaderParticleGroup";
import {ShaderParticleEmitter} from "../particles/emitter/ShaderParticleEmitter";
import {Distributions} from "../particles/Utils";

export class Clouds {
    private group: ShaderParticleGroup;

    public get mesh(): THREE.Points {
        return this.group.mesh;
    }

    public init(texture: THREE.Texture): void {
        this.group = new ShaderParticleGroup({
            texture: {
                value: texture,
            },
            blending: THREE.NormalBlending,
            fog: true
        });

        this.group.addEmitter(new ShaderParticleEmitter({
            particleCount: 100,
            maxAge: {
                value: 3,
                spread: 0,
            },
            position: {
                value: new THREE.Vector3(0, 100, 250),
                spread: new THREE.Vector3(100, 30, 100),
                spreadClamp: new THREE.Vector3(),
                distribution: Distributions.BOX,
                randomise: false,
                radius: 10,
                radiusScale: new THREE.Vector3(1.0, 1.0, 1.0),
                distributionClamp: 0,
            },
            velocity: {
                value: new THREE.Vector3(0, 0, 0.2),
                spread: new THREE.Vector3(),
                distribution: Distributions.BOX,
                randomise: false,
            },
            wiggle: {
                value: 0,
                spread: 10,
            },
            size: {
                value: 75,
                spread: 50,
                randomise: false,
            },
            opacity: {
                value: [0, 1, 0],
                spread: 0,
                randomise: false,
            },
            color: {
                value: new THREE.Color(1, 1, 1),
                spread: new THREE.Vector3(0.0, 0.0, 0.0),
                randomise: false,
            },
            angle: {
                value: [0, Math.PI * 0.125],
                spread: 0,
                randomise: false,
            }
        }));
    }

    public update(delta: number): void {
        this.group.tick(delta);
    }
}
