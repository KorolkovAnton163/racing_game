import * as THREE from 'three';
import {ShaderParticleEmitter, SharedParticleEmitterOptions} from "./emitter/ShaderParticleEmitter";
import {Utils} from "./Utils";
import {ShaderAttribute, ShaderAttributeType} from "./ShaderAttribute";
import {PARTICLE_SHADER} from "./consts/particle";

export interface SharedParticleGroupOptions {
    texture?: {
        value: THREE.Texture;
        frames?: THREE.Vector2;
        frameCount?: number;
        loop?: number;
    };
    fixedTimeStep?: number;
    hasPerspective?: boolean;
    colorize?: boolean;
    blending?: THREE.Blending;
    transparent?: boolean;
    alphaTest?: number;
    depthWrite?: boolean;
    depthTest?: boolean;
    fog?: boolean;
    scale?: number;
    maxParticleCount?: number;
}

export class ShaderParticleGroup {
    public uuid: string;

    public fixedTimeStep: number;

    public texture: THREE.Texture;

    public textureFrames: THREE.Vector2;

    public textureFrameCount: number;

    public textureLoop: number;

    public hasPerspective: boolean;

    public colorize: boolean;

    public maxParticleCount: number | null;

    public blending: THREE.Blending;

    public transparent: boolean;

    public alphaTest: number;

    public depthWrite: boolean;

    public depthTest: boolean;

    public fog: boolean;

    public scale: number;

    public emitters: ShaderParticleEmitter[] = [];

    public emitterIDs: string[] = [];

    public particleCount: number = 0;

    public uniforms: { [uniform: string]: THREE.IUniform };

    public defines: {
        HAS_PERSPECTIVE: boolean;
        COLORIZE: boolean;
        VALUE_OVER_LIFETIME_LENGTH: number;
        SHOULD_ROTATE_TEXTURE: boolean;
        SHOULD_ROTATE_PARTICLES: boolean;
        SHOULD_WIGGLE_PARTICLES: boolean;
        SHOULD_CALCULATE_SPRITE: boolean;
    };

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

    public attributeKeys: string[];

    public attributeCount: number;

    public material: THREE.ShaderMaterial;

    public geometry: THREE.BufferGeometry;

    public mesh: THREE.Points;

    private pool: ShaderParticleEmitter[] = [];

    private poolCreationSettings: SharedParticleEmitterOptions | null = null;

    private createNewWhenPoolEmpty: boolean = false;

    private attributesNeedRefresh: boolean = false;

    private attributesNeedDynamicReset: boolean = false;

    constructor(options: SharedParticleGroupOptions) {
        this.uuid = THREE.MathUtils.generateUUID();

        this.fixedTimeStep = options.fixedTimeStep ?? 0.016;

        this.texture = options.texture?.value ?? new THREE.Texture();

        this.textureFrames = options.texture?.frames ?? new THREE.Vector2(1.0, 1.0);

        this.textureFrameCount = options.texture?.frameCount ?? (this.textureFrames.x * this.textureFrames.y);

        this.textureLoop = options.texture?.loop ?? 1;

        this.textureFrames.max(new THREE.Vector2( 1.0, 1.0));

        this.hasPerspective = options.hasPerspective ?? true;

        this.colorize = options.colorize ?? true;

        this.maxParticleCount = options.maxParticleCount ?? null;

        this.blending = options.blending ?? THREE.AdditiveBlending;

        this.transparent = options.transparent ?? true;

        this.alphaTest = options.alphaTest ?? 0.0;

        this.depthWrite = options.depthWrite ?? false;

        this.depthTest = options.depthTest ?? true;

        this.fog = options.fog ?? true;

        this.scale = options.scale ?? 300;

        this.uniforms = {
            tex: {
                value: this.texture
            },
            textureAnimation: {
                value: new THREE.Vector4(
                    this.textureFrames.x,
                    this.textureFrames.y,
                    this.textureFrameCount,
                    Math.max(Math.abs(this.textureLoop), 1.0)
                )
            },
            fogColor: {
                value: this.fog ? new THREE.Color() : null
            },
            fogNear: {
                value: 10
            },
            fogFar: {
                value: 200
            },
            fogDensity: {
                value: 0.5
            },
            deltaTime: {
                value: 0
            },
            runTime: {
                value: 0
            },
            scale: {
                value: this.scale
            }
        };

        this.defines = {
            HAS_PERSPECTIVE: this.hasPerspective,
            COLORIZE: this.colorize,
            VALUE_OVER_LIFETIME_LENGTH: Utils.VALUE_OVER_LIFETIME_LENGTH,
            SHOULD_ROTATE_TEXTURE: false,
            SHOULD_ROTATE_PARTICLES: false,
            SHOULD_WIGGLE_PARTICLES: false,
            SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
        };

        this.attributes = {
            position: new ShaderAttribute(ShaderAttributeType.v3, true),
            acceleration: new ShaderAttribute(ShaderAttributeType.v4, true),
            velocity: new ShaderAttribute(ShaderAttributeType.v3, true),
            rotation: new ShaderAttribute(ShaderAttributeType.v4, true),
            rotationCenter: new ShaderAttribute(ShaderAttributeType.v3, true),
            params: new ShaderAttribute(ShaderAttributeType.v4, true),
            size: new ShaderAttribute(ShaderAttributeType.v4, true),
            angle: new ShaderAttribute(ShaderAttributeType.v4, true),
            color: new ShaderAttribute(ShaderAttributeType.v4, true),
            opacity: new ShaderAttribute(ShaderAttributeType.v4, true)
        };

        this.attributeKeys = Object.keys(this.attributes);
        this.attributeCount = this.attributeKeys.length;

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: PARTICLE_SHADER.vertex,
            fragmentShader: PARTICLE_SHADER.fragment,
            blending: this.blending,
            transparent: this.transparent,
            alphaTest: this.alphaTest,
            depthWrite: this.depthWrite,
            depthTest: this.depthTest,
            defines: this.defines,
            fog: this.fog
        });

        this.geometry = new THREE.BufferGeometry();
        this.mesh = new THREE.Points(this.geometry, this.material);

        if (this.maxParticleCount === null) {
            console.warn('ShaderParticleGroup: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.');
        }
    }

    public updateDefines(): void {
        for (let i = this.emitters.length - 1; i >= 0; --i) {
            const emitter = this.emitters[i];

            // Only do angle calculation if there's no spritesheet defined.
            //
            // Saves calculations being done and then overwritten in the shaders.
            if (!this.defines.SHOULD_CALCULATE_SPRITE) {
                this.defines.SHOULD_ROTATE_TEXTURE = this.defines.SHOULD_ROTATE_TEXTURE || !!Math.max(
                    Math.max.apply( null, emitter.angle.value ),
                    Math.max.apply( null, emitter.angle.spread )
                );
            }

            this.defines.SHOULD_ROTATE_PARTICLES = this.defines.SHOULD_ROTATE_PARTICLES || !!Math.max(
                emitter.rotation.angle,
                emitter.rotation.angleSpread
            );

            this.defines.SHOULD_WIGGLE_PARTICLES = this.defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(
                emitter.wiggle.value,
                emitter.wiggle.spread
            );
        }

        this.material.needsUpdate = true;
    }

    public applyAttributesToGeometry(): void {
        // Loop through all the shader attributes and assign (or re-assign)
        // typed array buffers to each one.
        for (const attr in this.attributes) {
            if (this.attributes.hasOwnProperty(attr)) {
                const attribute = this.attributes[attr];

                this.geometry.setAttribute(attr, attribute.bufferAttribute);

                // Mark the attribute as needing an update the next time a frame is rendered.
                attribute.bufferAttribute.needsUpdate = true;
            }
        }

        // Mark the draw range on the geometry. This will ensure
        // only the values in the attribute buffers that are
        // associated with a particle will be used in THREE's
        // render cycle.
        this.geometry.setDrawRange(0, this.particleCount);
    }

    public addEmitter(emitter: ShaderParticleEmitter): void {
        if (this.emitterIDs.includes(emitter.uuid) || emitter.group !== null) {
            return;
        }

        const start = this.particleCount;
        const end = start + emitter.particleCount;

        // Update this group's particle count.
        this.particleCount = end;

        // Emit a warning if the emitter being added will exceed the buffer sizes specified.
        if (this.maxParticleCount !== null && this.particleCount > this.maxParticleCount) {
            console.warn( 'ShaderParticleGroup: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount);
        }


        // Set the `particlesPerSecond` value (PPS) on the emitter.
        // It's used to determine how many particles to release
        // on a per-frame basis.
        emitter.calculatePPSValue( emitter.maxAge.value + emitter.maxAge.spread );
        emitter.setBufferUpdateRanges(this.attributeKeys);

        // Store the offset value in the TypedArray attributes for this emitter.
        emitter.setAttributeOffset(start);

        // Save a reference to this group on the emitter so it knows
        // where it belongs.
        emitter.group = this;

        // Store reference to the attributes on the emitter for
        // easier access during the emitter's tick function.
        emitter.attributes = this.attributes;

        // Ensure the attributes and their BufferAttributes exist, and their
        // TypedArrays are of the correct size.
        for (let attr in this.attributes) {
            if (this.attributes.hasOwnProperty(attr)) {
                // When creating a buffer, pass through the maxParticle count
                // if one is specified.
                this.attributes[attr].createBufferAttribute(
                    this.maxParticleCount !== null ?
                        this.maxParticleCount :
                        this.particleCount
                );
            }
        }

        // Loop through each particle this emitter wants to have, and create the attributes values,
        // storing them in the TypedArrays that each attribute holds.
        for (let i = start; i < end; ++i) {
            emitter.assignPositionValue(i);
            emitter.assignForceValue(i, 'velocity');
            emitter.assignForceValue(i, 'acceleration');
            emitter.assignAbsLifetimeValue(i, 'opacity');
            emitter.assignAbsLifetimeValue(i, 'size');
            emitter.assignAngleValue(i);
            emitter.assignRotationValue(i);
            emitter.assignParamsValue(i);
            emitter.assignColorValue(i);
        }

        // Update the geometry and make sure the attributes are referencing
        // the typed arrays properly.
        this.applyAttributesToGeometry();

        // Store this emitter in this group's emitter's store.
        this.emitters.push(emitter);
        this.emitterIDs.push(emitter.uuid);

        // Update certain flags to enable shader calculations only if they're necessary.
        this.updateDefines();

        // Update the material since defines might have changed
        this.material.needsUpdate = true;
        this.attributesNeedRefresh = true;
    };

    public removeEmitter(emitter: ShaderParticleEmitter): void {
        const emitterIndex = this.emitterIDs.indexOf(emitter.uuid);

        if (emitterIndex === -1) {
            console.error('Emitter does not exist in this group. Will not remove.');

            return;
        }

        // Kill all particles by marking them as dead
        // and their age as 0.
        const start = emitter.attributeOffset;
        const end = start + emitter.particleCount;
        const params = this.attributes.params.typedArray;

        // Set alive and age to zero.
        for (let i = start; i < end; ++i) {
            params.array[i * 4] = 0.0;
            params.array[i * 4 + 1] = 0.0;
        }

        // Remove the emitter from this group's "store".
        this.emitters.splice(emitterIndex, 1);
        this.emitterIDs.splice(emitterIndex, 1);

        // Remove this emitter's attribute values from all shader attributes.
        // The `.splice()` call here also marks each attribute's buffer
        // as needing to update it's entire contents.
        for (let attr in this.attributes) {
            if (this.attributes.hasOwnProperty(attr)) {
                this.attributes[attr].splice(start, end);
            }
        }

        // Ensure this group's particle count is correct.
        this.particleCount -= emitter.particleCount;

        // Call the emitter's remove method.
        // emitter.onRemove();

        // Set a flag to indicate that the attribute buffers should
        // be updated in their entirety on the next frame.
        this.attributesNeedRefresh = true;
    }

    public getFromPool(): ShaderParticleEmitter | null {
        if (this.pool.length) {
            return this.pool.pop() ?? null;
        } else if (this.createNewWhenPoolEmpty) {
            const emitter = new ShaderParticleEmitter(this.poolCreationSettings);

            this.addEmitter(emitter);

            return emitter;
        }

        return null;
    }

    public releaseIntoPool(emitter: ShaderParticleEmitter): void {
        emitter.reset();

        this.pool.unshift(emitter);
    }

    public getPool(): ShaderParticleEmitter[] {
        return this.pool;
    }

    public addPool(
        numEmitters: number,
        emitterOptions: SharedParticleEmitterOptions,
        createNew: boolean
    ): void {
        this.poolCreationSettings = emitterOptions;
        this.createNewWhenPoolEmpty = createNew;

        for (let i = 0; i < numEmitters; ++i) {
            const emitter = new ShaderParticleEmitter(emitterOptions);

            this.addEmitter(emitter);
            this.releaseIntoPool(emitter);
        }
    }

    public triggerSingleEmitter(pos: THREE.Vector3): void {
        const emitter = this.getFromPool();

        if (emitter === null) {
            console.log('SPE.Group pool ran out.');

            return;
        }

        emitter.position.value.copy(pos);

        // Trigger the setter for this property to force an
        // update to the emitter's position attribute.
        emitter.position.value = emitter.position.value;

        emitter.enable();

        setTimeout(() => {
            emitter.disable();
            this.releaseIntoPool(emitter);
        }, (Math.max(emitter.duration, (emitter.maxAge.value + emitter.maxAge.spread))) * 1000);
    }

    public triggerPoolEmitter(numEmitters: number, position: THREE.Vector3): void {
        if (numEmitters > 1) {
            for (let i = 0; i < numEmitters; ++i) {
                this.triggerSingleEmitter(position);
            }
        } else {
            this.triggerSingleEmitter(position);
        }
    }

    public updateUniforms(dt: number): void {
        this.uniforms.runTime.value += dt;
        this.uniforms.deltaTime.value = dt;
    }

    public resetBufferRanges(): void {
        for (let i = this.attributeCount - 1; i >= 0; --i) {
            this.attributes[this.attributeKeys[i]].resetUpdateRange();
        }
    }

    public updateBuffers(emitter: ShaderParticleEmitter): void {
        for (let i = this.attributeCount - 1; i >= 0; --i) {
            const key = this.attributeKeys[i];
            const emitterAttr = emitter.bufferUpdateRanges.get(key);
            const attr = this.attributes[key];

            attr.setUpdateRange(emitterAttr.min, emitterAttr.max);
            attr.flagUpdate();
        }
    }

    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     */
    public tick(dt: number): void {
        const deltaTime = dt || this.fixedTimeStep;

        // Update uniform values.
        this.updateUniforms(deltaTime);

        // Reset buffer update ranges on the shader attributes.
        this.resetBufferRanges();


        // If nothing needs updating, then stop here.
        if (
            this.emitters.length === 0
            && this.attributesNeedRefresh === false
            && this.attributesNeedDynamicReset === false
        ) {
            return;
        }

        // Loop through each emitter in this group and
        // simulate it, then update the shader attribute
        // buffers.
        for (let i = 0; i < this.emitters.length; ++i) {
            this.emitters[i].tick(deltaTime);

            this.updateBuffers(this.emitters[i]);
        }

        // If the shader attributes have been refreshed,
        // then the dynamic properties of each buffer
        // attribute will need to be reset back to
        // what they should be.
        if (this.attributesNeedDynamicReset === true) {
            for (let i = this.attributeCount - 1; i >= 0; --i ) {
                this.attributes[this.attributeKeys[i]].resetDynamic();
            }

            this.attributesNeedDynamicReset = false;
        }

        // If this group's shader attributes need a full refresh
        // then mark each attribute's buffer attribute as
        // needing so.
        if (this.attributesNeedRefresh === true) {
            for (let i = this.attributeCount - 1; i >= 0; --i ) {
                this.attributes[this.attributeKeys[i]].forceUpdateAll();
            }

            this.attributesNeedRefresh = false;
            this.attributesNeedDynamicReset = true;
        }
    };


    /**
     * Dipose the geometry and material for the group.
     */
    public dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
    };
}
