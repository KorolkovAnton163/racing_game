import * as THREE from 'three';
import {TypedArrayHelper} from "./TypedArrayHelper";

export enum ShaderAttributeType {
    f = 'f',
    v3 = 'v3',
    v4 = 'v4',
}

export class ShaderAttribute {
    public typeSizeMap = { f: 1, v2: 2, v3: 3, v4: 4, c: 3, m3: 9, m4: 16 };

    public type: ShaderAttributeType;

    public componentSize: number;

    public typedArray: TypedArrayHelper | null;

    public bufferAttribute: THREE.BufferAttribute | null;

    public dynamicBuffer: boolean;

    public updateMin: number;

    public updateMax: number;

    constructor(type: ShaderAttributeType, dynamicBuffer: boolean) {
        this.type = type;
        this.componentSize = this.typeSizeMap[this.type];
        this.typedArray = null;
        this.bufferAttribute = null;
        this.dynamicBuffer = !!dynamicBuffer;

        this.updateMin = 0;
        this.updateMax = 0;
    }

    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     */
    public setUpdateRange(min: number, max: number): void {
        this.updateMin = Math.min(min * this.componentSize, this.updateMin * this.componentSize);
        this.updateMax = Math.max(max * this.componentSize, this.updateMax * this.componentSize);
    };

    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    public flagUpdate(): void {
        const attr = this.bufferAttribute;
        const range = attr.updateRange;

        range.offset = this.updateMin;
        range.count = Math.min( (this.updateMax - this.updateMin ) + this.componentSize, this.typedArray.array.length);
        attr.needsUpdate = true;
    };

    /**
     * Reset the index update counts for this attribute
     */
    public resetUpdateRange(): void {
        this.updateMin = 0;
        this.updateMax = 0;
    };

    public resetDynamic(): void {
        this.bufferAttribute.usage = this.dynamicBuffer ?
            THREE.DynamicDrawUsage :
            THREE.StaticDrawUsage;
    };

    /**
     * Perform a splice operation on this attribute's buffer.
     */
    public splice(start: number, end: number): void {
        this.typedArray.splice(start, end);

        // Reset the reference to the attribute's typed array
        // since it has probably changed.
        this.forceUpdateAll();
    };

    public forceUpdateAll(): void {
        this.bufferAttribute.array = this.typedArray.array;
        this.bufferAttribute.updateRange.offset = 0;
        this.bufferAttribute.updateRange.count = -1;

        this.bufferAttribute.usage = THREE.StaticDrawUsage;
        this.bufferAttribute.needsUpdate = true;
    };

    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new SPE.TypedArrayHelper instance will be created.
     */
    private _ensureTypedArray(size: number): void {
        // Condition that's most likely to be true at the top: no change.
        if ( this.typedArray !== null && this.typedArray.size === size * this.componentSize ) {
            return;
        } else if (this.typedArray !== null && this.typedArray.size !== size) {
            // Resize the array if we need to, telling the TypedArrayHelper to
            // ignore it's component size when evaluating size.
            this.typedArray.setSize(size);
        } else if ( this.typedArray === null ) {
            // This condition should only occur once in an attribute's lifecycle.
            this.typedArray = new TypedArrayHelper(size, this.componentSize);
        }
    };


    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     */
    public createBufferAttribute(size: number): void {
        // Make sure the typedArray is present and correct.
        this._ensureTypedArray(size);

        // Don't create it if it already exists, but do
        // flag that it needs updating on the next render
        // cycle.
        if ( this.bufferAttribute !== null ) {
            this.bufferAttribute.array = this.typedArray.array;

            // Since THREE.js version 81, dynamic count calculation was removed
            // so I need to do it manually here.
            //
            // In the next minor release, I may well remove this check and force
            // dependency on THREE r81+.
            if (parseFloat(THREE.REVISION) >= 81) {
                this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;
            }

            this.bufferAttribute.needsUpdate = true;
            return;
        }

        this.bufferAttribute = new THREE.BufferAttribute(this.typedArray.array, this.componentSize);

        this.bufferAttribute.usage = this.dynamicBuffer ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage;
    };

    /**
     * Returns the length of the typed array associated with this attribute.
     */
    public getLength(): number {
        if (this.typedArray === null) {
            return 0;
        }

        return this.typedArray.array.length;
    };
}
