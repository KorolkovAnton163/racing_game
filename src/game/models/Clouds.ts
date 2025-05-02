import * as THREE from "three";
import {ShaderParticleGroup} from "../particles/ShaderParticleGroup";
import {ShaderParticleEmitter} from "../particles/emitter/ShaderParticleEmitter";
import {Distributions} from "../particles/Utils";

export class Clouds {
    private group: ShaderParticleGroup;

    private clouds = [
        {
            particles: 10,
            position: new THREE.Vector3(0.0, 20.0, 2.0),
            spread: new THREE.Vector3(20.0, 4.0, 20.0),
        },
        {
            particles: 10,
            position: new THREE.Vector3(50.0, 10.0, -50.0),
            spread: new THREE.Vector3(10.0, 10.0, 10.0),
        },
        {
            particles: 50,
            position: new THREE.Vector3(0.0, 10.0, -50.0),
            spread: new THREE.Vector3(10.0, 10.0, 10.0),
        },
        {
            particles: 300,
            position: new THREE.Vector3(0.0, 10.0, 100.0),
            spread: new THREE.Vector3(100.0, 2.0, 200.0),
        }
    ];

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

        this.clouds.forEach((cloud) => {
            this.group.addEmitter(this.createEmitter(cloud));
        });

        console.log(this);
    }

    private createEmitter(data: { particles: number, position: THREE.Vector3, spread: THREE.Vector3 }): ShaderParticleEmitter {
        return new ShaderParticleEmitter({
            particleCount: data.particles,
            maxAge: {
                value: 10,
                spread: 0,
            },
            position: {
                value: data.position,
                spread: data.spread,
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
                spread: 1,
            },
            size: {
                value: 30,
                spread: 50,
                randomise: false,
            },
            opacity: {
                value: [0, 1, 0],
                spread: 0,
                randomise: false,
            },
            color: {
                value: new THREE.Color(1.0, 1.0, 1.0),
                spread: new THREE.Vector3(0.0, 0.0, 0.0),
                randomise: false,
            },
            angle: {
                value: [0, Math.PI * 0.001],
                spread: 0,
                randomise: false,
            }
        });
    }

    public update(delta: number): void {
        this.group.tick(delta);
    }
}
