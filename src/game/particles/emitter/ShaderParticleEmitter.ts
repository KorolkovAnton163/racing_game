import * as THREE from 'three';
import {Distributions, Utils} from "../Utils";
import {
    SharedParticleEmitterPosition,
    SharedParticleEmitterOptionsPositionInterface
} from "./SharedParticleEmitterOptionsPosition";
import {
    SharedParticleEmitterOptionsVelocityInterface,
    SharedParticleEmitterVelocity
} from "./SharedParticleEmitterOptionsVelocity";
import {
    SharedParticleEmitterMaxAge,
    SharedParticleEmitterOptionsMaxAgeInterface
} from "./SharedParticleEmitterOptionsMaxAge";
import {
    SharedParticleEmitterOptionsRotationInterface,
    SharedParticleEmitterRotation
} from "./SharedParticleEmitterOptionsRotation";
import {ShaderParticleGroup} from "../ShaderParticleGroup";
import {
    SharedParticleEmitterAcceleration,
    SharedParticleEmitterOptionsAccelerationInterface
} from "./SharedParticleEmitterOptionsAcceleration";
import {SharedParticleEmitterDrag, SharedParticleEmitterOptionsDragInterface} from "./SharedParticleEmitterOptionsDrag";
import {
    SharedParticleEmitterOptionsWiggleInterface,
    SharedParticleEmitterWiggle
} from "./SharedParticleEmitterOptionsWiggle";
import {SharedParticleEmitterOptionsRadiusInterface} from "./SharedParticleEmitterOptionsRadius";
import {
    SharedParticleEmitterColor,
    SharedParticleEmitterOptionsColorInterface
} from "./SharedParticleEmitterOptionsColor";
import {
    SharedParticleEmitterOpacity,
    SharedParticleEmitterOptionsOpacityInterface
} from "./SharedParticleEmitterOptionsOpacity";
import {SharedParticleEmitterOptionsSizeInterface, SharedParticleEmitterSize} from "./SharedParticleEmitterOptionsSize";
import {
    SharedParticleEmitterAngle,
    SharedParticleEmitterOptionsAngleInterface
} from "./SharedParticleEmitterOptionsAngle";
import {ShaderAttribute} from "../ShaderAttribute";

export interface SharedParticleEmitterOptions {
    type?: Distributions;
    particleCount?: number;
    duration?: number|null;
    isStatic?: boolean;
    activeMultiplier?: number;
    direction?: number;
    alive?: boolean;
    maxAge?: SharedParticleEmitterOptionsMaxAgeInterface;
    position?: SharedParticleEmitterOptionsPositionInterface;
    radius?: SharedParticleEmitterOptionsRadiusInterface;
    velocity?: SharedParticleEmitterOptionsVelocityInterface;
    acceleration?: SharedParticleEmitterOptionsAccelerationInterface;
    drag?: SharedParticleEmitterOptionsDragInterface;
    wiggle?: SharedParticleEmitterOptionsWiggleInterface;
    rotation?: SharedParticleEmitterOptionsRotationInterface;
    color?: SharedParticleEmitterOptionsColorInterface;
    opacity?: SharedParticleEmitterOptionsOpacityInterface;
    size?: SharedParticleEmitterOptionsSizeInterface;
    angle?: SharedParticleEmitterOptionsAngleInterface;
}

export class ShaderParticleEmitter {
    public uuid: string;

    public type: Distributions;

    public position: SharedParticleEmitterPosition;

    public velocity: SharedParticleEmitterVelocity;

    public acceleration: SharedParticleEmitterAcceleration;

    public drag: SharedParticleEmitterDrag;

    public wiggle: SharedParticleEmitterWiggle;

    public rotation: SharedParticleEmitterRotation;

    public maxAge: SharedParticleEmitterMaxAge;

    public color: SharedParticleEmitterColor;

    public opacity: SharedParticleEmitterOpacity;

    public size: SharedParticleEmitterSize;

    public angle: SharedParticleEmitterAngle;

    public particleCount: number;

    public duration: number|null;

    public isStatic: boolean;

    public activeMultiplier: number;

    public direction: number;

    public alive:boolean;

    public particlesPerSecond: number;

    public activationIndex: number;

    public attributeOffset: number;

    public attributeEnd: number;

    public age: number;

    public activeParticleCount: number;

    public group: ShaderParticleGroup;

    public attributes: {
        position: ShaderAttribute;
        acceleration: ShaderAttribute;
        velocity: ShaderAttribute;
        rotation: ShaderAttribute;
        rotationCenter: ShaderAttribute;
        params: ShaderAttribute;
        size: ShaderAttribute;
        angle: ShaderAttribute;
        color: ShaderAttribute;
        opacity: ShaderAttribute;
    };

    public paramsArray: Float32Array | null;

    public resetFlags: {
        position: boolean;
        velocity: boolean;
        acceleration: boolean;
        rotation: boolean;
        rotationCenter: boolean;
        size: boolean;
        color: boolean;
        opacity: boolean;
        angle: boolean;
    };

    public updateFlags: Map<string, boolean> = new Map<string, boolean>();

    public updateCounts: Map<string, number> = new Map<string, number>();

    public updateMap: Map<string, string> = new Map<string, string>();

    public bufferUpdateRanges: Map<string, { min: number; max: number }> = new Map<string, { min: number; max: number }>();

    public attributeKeys: string[];

    public attributeCount: number;

    public activationEnd: number;

    constructor(options: SharedParticleEmitterOptions) {
        this.uuid = THREE.MathUtils.generateUUID();

        this.type = options.type ?? Distributions.BOX;

        this.position = new SharedParticleEmitterPosition(options.position ?? {
            value: new THREE.Vector3(),
            spread: new THREE.Vector3(),
            spreadClamp: new THREE.Vector3(),
            distribution: this.type,
            randomise: false,
            radius: 10,
            radiusScale: new THREE.Vector3(1.0, 1.0, 1.0),
            distributionClamp: 0,
        });

        this.velocity = new SharedParticleEmitterVelocity(options.velocity ?? {
            value: new THREE.Vector3(),
            spread: new THREE.Vector3(),
            distribution: this.type,
            randomise: false,
        });

        this.acceleration = new SharedParticleEmitterAcceleration(options.acceleration ?? {
            value: new THREE.Vector3(),
            spread: new THREE.Vector3(),
            distribution: this.type,
            randomise: false,
        });

        this.drag = new SharedParticleEmitterDrag(options.drag ?? {
            value: 0,
            spread: 0,
            randomise: false,
        });

        this.wiggle = new SharedParticleEmitterWiggle(options.wiggle ?? {
            value: 0,
            spread: 0,
        });

        this.rotation = new SharedParticleEmitterRotation(options.rotation ?? {
            axis: new THREE.Vector3(0.0, 1.0, 0.0),
            axisSpread: new THREE.Vector3(),
            angle: 0,
            angleSpread: 0,
            static: false,
            center: this.position.value.clone(),
            randomise: false,
        });

        this.maxAge = new SharedParticleEmitterMaxAge(options.maxAge ?? {
            value: 2,
            spread: 0
        });

        this.color = new SharedParticleEmitterColor(options.color ?? {
            value: new THREE.Color(),
            spread: new THREE.Vector3(),
            randomise: false,
        });

        this.opacity = new SharedParticleEmitterOpacity(options.opacity ?? {
            value: 1,
            spread: 0,
            randomise: false,
        });

        this.size = new SharedParticleEmitterSize(options.size ?? {
            value: 1,
            spread: 0,
            randomise: false,
        });

        this.angle = new SharedParticleEmitterAngle(options.angle ?? {
            value: 0,
            spread: 0,
            randomise: false,
        });

        this.particleCount = options.particleCount ?? 100;
        this.duration = options.duration ?? null;
        this.isStatic = options.isStatic ?? false;
        this.activeMultiplier = options.activeMultiplier ?? 1;
        this.direction = options.direction ?? 1;

        this.alive = options.alive ?? true;

        // The following properties are set internally and are not
        // user-controllable.
        this.particlesPerSecond = 0;

        // The current particle index for which particles should
        // be marked as active on the next update cycle.
        this.activationIndex = 0;

        // The offset in the typed arrays this emitter's
        // particle's values will start at
        this.attributeOffset = 0;

        // The end of the range in the attribute buffers
        this.attributeEnd = 0;

        // Holds the time the emitter has been alive for.
        this.age = 0.0;

        // Holds the number of currently-alive particles
        this.activeParticleCount = 0.0;

        // Holds a reference to this emitter's group once
        // it's added to one.
        this.group = null;

        // Holds a reference to this emitter's group's attributes object
        // for easier access.
        this.attributes = null;

        // Holds a reference to the params attribute's typed array
        // for quicker access.
        this.paramsArray = null;

        // A set of flags to determine whether particular properties
        // should be re-randomised when a particle is reset.
        //
        // If a `randomise` property is given, this is preferred.
        // Otherwise, it looks at whether a spread value has been
        // given.
        //
        // It allows randomization to be turned off as desired. If
        // all randomization is turned off, then I'd expect a performance
        // boost as no attribute buffers (excluding the `params`)
        // would have to be re-passed to the GPU each frame (since nothing
        // except the `params` attribute would have changed).
        this.resetFlags = {
            position: (options.position?.randomise ?? false) || (options.radius?.randomise ?? false),
            velocity: options.velocity?.randomise ?? false,
            acceleration: (options.acceleration?.randomise ?? false) || (options.drag?.randomise ?? false),
            rotation: options.rotation?.randomise ?? false,
            rotationCenter: options.rotation?.randomise ?? false,
            size: options.size?.randomise ?? false,
            color: options.color?.randomise ?? false,
            opacity: options.opacity?.randomise ?? false,
            angle: options.angle?.randomise ?? false,
        };

        this.updateMap.set('maxAge', 'params');
        this.updateMap.set('position', 'position');
        this.updateMap.set('velocity', 'velocity');
        this.updateMap.set('acceleration', 'acceleration');
        this.updateMap.set('drag', 'acceleration');
        this.updateMap.set('wiggle', 'params');
        this.updateMap.set('rotation', 'rotation');
        this.updateMap.set('size', 'size');
        this.updateMap.set('color', 'color');
        this.updateMap.set('opacity', 'opacity');
        this.updateMap.set('angle', 'angle');

        this.updateMap.forEach((value: string, key: string) => {
            this.updateCounts.set(value, 0.0);
            this.updateFlags.set(value, false);
        });

        this.maxAge.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.position.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.velocity.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.rotation.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.acceleration.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.drag.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.wiggle.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.color.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.opacity.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.size.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);
        this.angle.setUpdates(this.updateFlags, this.updateCounts, this.resetFlags, this.group);

        this.attributeKeys = [];
        this.attributeCount = 0;
    }

    public setBufferUpdateRanges(keys: string[]): void {
        this.attributeKeys = keys;
        this.attributeCount = keys.length;

        for (let i = this.attributeCount - 1; i >= 0; --i ) {
            this.bufferUpdateRanges.set(keys[i], {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
            });
        }
    }

    public calculatePPSValue(groupMaxAge: number): void {
        // Calculate the `particlesPerSecond` value for this emitter. It's used
        // when determining which particles should die and which should live to
        // see another day. Or be born, for that matter. The "God" property.
        if (this.duration) {
            this.particlesPerSecond = this.particleCount / (groupMaxAge < this.duration ? groupMaxAge : this.duration);
        } else {
            this.particlesPerSecond = this.particleCount / groupMaxAge;
        }
    }

    public setAttributeOffset(startIndex: number): void {
        this.attributeOffset = startIndex;
        this.activationIndex = startIndex;
        this.activationEnd = startIndex + this.particleCount;
    }

    private assignValue(prop: string, index: number): void {
        switch (prop) {
            case 'position':
                this.assignPositionValue(index);

                break;
            case 'velocity':
            case 'acceleration':
                this.assignForceValue(index, prop);

                break;
            case 'size':
            case 'opacity':
                this.assignAbsLifetimeValue(index, prop);

                break;
            case 'angle':
                this.assignAngleValue(index);

                break;
            case 'params':
                this.assignParamsValue(index);

                break;
            case 'rotation':
                this.assignRotationValue(index);

                break;
            case 'color':
                this.assignColorValue(index);

                break;
        }
    }

    public assignPositionValue(index: number): void {
        switch (this.position.distribution) {
            case Distributions.BOX:
                Utils.randomVector3(
                    this.attributes.position,
                    index,
                    this.position.value,
                    this.position.spread,
                    this.position.spreadClamp
                );

                break;
            case Distributions.SPHERE:
                Utils.randomVector3OnSphere(
                    this.attributes.position,
                    index,
                    this.position.value,
                    this.position.radius,
                    this.position.spread.x,
                    this.position.radiusScale,
                    this.position.spreadClamp.x,
                    this.position.distributionClamp || this.particleCount
                );

                break;
            case Distributions.DISC:
                Utils.randomVector3OnDisc(
                    this.attributes.position,
                    index,
                    this.position.value,
                    this.position.radius,
                    this.position.spread.x,
                    this.position.radiusScale,
                    this.position.spreadClamp.x
                );

                break;
            case Distributions.LINE:
                Utils.randomVector3OnLine(
                    this.attributes.position,
                    index,
                    this.position.value,
                    this.position.spread
                );

                break;
        }
    }

    public assignForceValue(index: number, attrName: string): void {
            const prop = this[attrName];
            const value = prop.value;
            const spread = prop.spread;
            const distribution = prop.distribution;

            let pos: Float32Array;
            let positionX: number;
            let positionY: number;
            let positionZ: number;
            let i: number;

        switch (distribution) {
            case Distributions.BOX:
                Utils.randomVector3(this.attributes[attrName], index, value, spread);
                break;

            case Distributions.SPHERE:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = utils.zeroToEpsilon( pos[ i ], true );
                // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                Utils.randomDirectionVector3OnSphere(
                    this.attributes[attrName],
                    index,
                    positionX,
                    positionY,
                    positionZ,
                    this.position.value,
                    prop.value.x,
                    prop.spread.x
                );

                break;
            case Distributions.DISC:
                pos = this.attributes.position.typedArray.array;
                i = index * 3;

                // Ensure position values aren't zero, otherwise no force will be
                // applied.
                // positionX = utils.zeroToEpsilon( pos[ i ], true );
                // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
                // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
                positionX = pos[i];
                positionY = pos[i + 1];
                positionZ = pos[i + 2];

                Utils.randomDirectionVector3OnDisc(
                    this.attributes[attrName],
                    index,
                    positionX,
                    positionY,
                    positionZ,
                    this.position.value,
                    prop.value.x,
                    prop.spread.x
                );

                break;
            case Distributions.LINE:
                Utils.randomVector3OnLine(this.attributes[attrName], index, value, spread);

                break;
        }

        if (attrName === 'acceleration') {
            this.attributes.acceleration.typedArray.array[index * 4 + 3] =
                Utils.clamp(Utils.randomFloat( this.drag.value, this.drag.spread ), 0, 1);
        }
    }

    public assignAbsLifetimeValue(index: number, propName: string): void {
        const array = this.attributes[propName].typedArray;
        const prop = this[propName];

        let value: number;

        if (Utils.arrayValuesAreEqual(prop.value) && Utils.arrayValuesAreEqual(prop.spread)) {
            value = Math.abs(Utils.randomFloat(prop.value[0], prop.spread[0]));

            array.setVec4Components(index, value, value, value, value);
        } else {
            array.setVec4Components( index,
                Math.abs(Utils.randomFloat(prop.value[0], prop.spread[0])),
                Math.abs(Utils.randomFloat(prop.value[1], prop.spread[1])),
                Math.abs(Utils.randomFloat(prop.value[2], prop.spread[2])),
                Math.abs(Utils.randomFloat(prop.value[3], prop.spread[3]))
            );
        }
    }

    public assignAngleValue(index: number): void {
        const array = this.attributes.angle.typedArray;
        const prop = this.angle;

        let value: number;

        if (Utils.arrayValuesAreEqual(prop.value) && Utils.arrayValuesAreEqual(prop.spread)) {
            value = Utils.randomFloat(prop.value[0], prop.spread[0]);
            array.setVec4Components(index, value, value, value, value);
        }
        else {
            array.setVec4Components(index,
                Utils.randomFloat(prop.value[0], prop.spread[0]),
                Utils.randomFloat(prop.value[1], prop.spread[1]),
                Utils.randomFloat(prop.value[2], prop.spread[2]),
                Utils.randomFloat(prop.value[3], prop.spread[3])
            );
        }
    }

    public assignParamsValue(index: number): void {
        this.attributes.params.typedArray.setVec4Components(index,
            this.isStatic ? 1 : 0,
            0.0,
            Math.abs(Utils.randomFloat(this.maxAge.value, this.maxAge.spread)),
            Utils.randomFloat(this.wiggle.value, this.wiggle.spread)
        );
    }

    public assignRotationValue(index: number): void {
        this.attributes.rotation.typedArray.setVec3Components(
            index,
            Utils.getPackedRotationAxis(this.rotation.axis, this.rotation.axisSpread),
            Utils.randomFloat(this.rotation.angle, this.rotation.angleSpread),
            this.rotation.static ? 0 : 1
        );

        this.attributes.rotationCenter.typedArray.setVec3(index, this.rotation.center);
    }

    public assignColorValue(index: number): void {
        Utils.randomColorAsHex(this.attributes.color, index, this.color.value, this.color.spread);
    }

    private resetParticle(index: number): void {
        for (let i = this.attributeCount - 1; i >= 0; --i) {
            const key = this.attributeKeys[i];
            const updateFlag = this.updateFlags.get(key);

            if (this.resetFlags[key] === true || updateFlag === true) {
                this.assignValue(key, index);
                this.updateAttributeUpdateRange( key, index );

                if (updateFlag === true && this.updateCounts.get(key) === this.particleCount ) {
                    this.updateFlags[key] = false;
                    this.updateCounts[key] = 0.0;
                } else if (updateFlag == true) {
                    const counts = this.updateCounts.get(key);

                    this.updateCounts.set(key, counts + 1);
                }
            }
        }
    }

    private updateAttributeUpdateRange(attr: string, i: number): void {
        const ranges = this.bufferUpdateRanges.get(attr);

        ranges.min = Math.min(i, ranges.min);
        ranges.max = Math.max(i, ranges.max);
    }

    private decrementParticleCount(): void {
        this.activeParticleCount -= 1;
    }

    private incrementParticleCount(): void {
        this.activeParticleCount += 1;
    }

    private checkParticleAges(start: number, end: number, params: Float32Array, dt: number): void {
        for (let i = end - 1, index, maxAge, age, alive; i >= start; --i ) {
            index = i * 4;

            alive = params[index];

            if (alive === 0.0) {
                continue;
            }

            // Increment age
            age = params[index + 1];
            maxAge = params[index + 2];

            if (this.direction === 1) {
                age += dt;

                if (age >= maxAge) {
                    age = 0.0;
                    alive = 0.0;

                    this.decrementParticleCount();
                }
            } else {
                age -= dt;

                if (age <= 0.0) {
                    age = maxAge;
                    alive = 0.0;
                    this.decrementParticleCount();
                }
            }

            params[index] = alive;
            params[index + 1] = age;

            this.updateAttributeUpdateRange('params', i);
        }
    }

    private activateParticles(
        activationStart: number,
        activationEnd: number,
        params: Float32Array,
        dtPerParticle: number
    ): void {
        const direction = this.direction;

        for (let i = activationStart, index, dtValue; i < activationEnd; ++i ) {
            index = i * 4;

            if (params[index] != 0.0 && this.particleCount !== 1) {
                continue;
            }

            // Increment the active particle count.
            this.incrementParticleCount();

            // Mark the particle as alive.
            params[index] = 1.0;

            // Reset the particle
            this.resetParticle(i);

            // Move each particle being activated to
            // it's actual position in time.
            //
            // This stops particles being 'clumped' together
            // when frame rates are on the lower side of 60fps
            // or not constant (a very real possibility!)
            dtValue = dtPerParticle * (i - activationStart)
            params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;

            this.updateAttributeUpdateRange('params', i);
        }
    }

    public tick(dt: number) {
        if (this.isStatic) {
            return;
        }

        if (this.paramsArray === null) {
            this.paramsArray = this.attributes.params.typedArray.array;
        }

        const start = this.attributeOffset;
        const end = start + this.particleCount;
        const params = this.paramsArray; // vec3( alive, age, maxAge, wiggle )
        const ppsDt = this.particlesPerSecond * this.activeMultiplier * dt;
        const activationIndex = this.activationIndex;

        // Reset the buffer update indices.
        // this._resetBufferRanges();

        // Increment age for those particles that are alive,
        // and kill off any particles whose age is over the limit.
        this.checkParticleAges(start, end, params, dt);

        // If the emitter is dead, reset the age of the emitter to zero,
        // ready to go again if required
        if (this.alive === false) {
            this.age = 0.0;

            return;
        }

        // If the emitter has a specified lifetime and we've exceeded it,
        // mark the emitter as dead.
        if (this.duration !== null && this.age > this.duration) {
            this.alive = false;
            this.age = 0.0;

            return;
        }


        const activationStart = this.particleCount === 1 ? activationIndex : ( activationIndex | 0 );
        const activationEnd = Math.min( activationStart + ppsDt, this.activationEnd );
        const activationCount = activationEnd - this.activationIndex | 0;
        const dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

        this.activateParticles(activationStart, activationEnd, params, dtPerParticle);

        // Move the activation window forward, soldier.
        this.activationIndex += ppsDt;

        if (this.activationIndex > end) {
            this.activationIndex = start;
        }


        // Increment the age of the emitter.
        this.age += dt;
    }

    public reset(force: boolean = false): void {
        this.age = 0.0;
        this.alive = false;

        if (force === true) {
            const start = this.attributeOffset;
            const end = start + this.particleCount;
            const array = this.paramsArray;
            const attr = this.attributes.params.bufferAttribute;

            for (let i = end - 1, index; i >= start; --i) {
                index = i * 4;

                array[index] = 0.0;
                array[index + 1] = 0.0;
            }

            attr.updateRange.offset = 0;
            attr.updateRange.count = -1;
            attr.needsUpdate = true;
        }
    }

    public enable(): void {
        this.alive = true;
    }

    public disable(): void {
        this.alive = false;
    }

    public remove(): void {
        if (this.group !== null) {
            this.group.removeEmitter(this);
        } else {
            console.error( 'Emitter does not belong to a group, cannot remove.' );
        }
    }
}

