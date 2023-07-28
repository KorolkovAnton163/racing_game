import * as THREE from 'three';

/**
 * A helper class for TypedArrays.
 *
 * Allows for easy resizing, assignment of various component-based
 * types (Vector2s, Vector3s, Vector4s, Mat3s, Mat4s),
 * as well as Colors (where components are `r`, `g`, `b`),
 * Numbers, and setting from other TypedArrays.
 *
 * @author Luke Moody
 */
export class TypedArrayHelper {
    public componentSize: number;

    public size: number;

    public array: Float32Array;

    public indexOffset: number

    constructor(size: number, componentSize: number, indexOffset: number = 0) {
        this.componentSize = componentSize || 1;
        this.size = ( size || 1 );
        this.array = new Float32Array(size * this.componentSize);
        this.indexOffset = indexOffset;
    }

    /**
     * Sets the size of the internal array.
     *
     * Delegates to `this.shrink` or `this.grow` depending on size
     * argument's relation to the current size of the internal array.
     *
     * Note that if the array is to be shrunk, data will be lost.
     */
    public setSize(size: number, noComponentMultiply?: boolean): void {
        if (!noComponentMultiply) {
            size = size * this.componentSize;
        }

        if (size < this.array.length ) {
            this.shrink(size);
        } else if (size > this.array.length) {
            this.grow(size);
        } else {
            console.info( 'TypedArray is already of size:', size + '.', 'Will not resize.' );
            return;
        }
    }

    /**
     * Shrinks the internal array.
     */
    public shrink(size: number): void {
        this.array = this.array.subarray(0, size);

        this.size = size;
    };

    /**
     * Grows the internal array.
     */
    public grow(size: number): void {
        const newArray = new Float32Array(size);

        newArray.set(this.array);

        this.array = newArray;

        this.size = size;
    };


    /**
     * Perform a splice operation on this array's buffer.
     */
    public splice(start: number, end: number): void {
        start *= this.componentSize;
        end *= this.componentSize;

        const data = [];

        for (let i = 0; i < this.array.length; ++i) {
            if (i < start || i >= end) {
                data.push(this.array[i]);
            }
        }

        this.setFromArray( 0, data);
    };


    /**
     * Copies from the given TypedArray into this one, using the index argument
     * as the start position. Alias for `TypedArray.set`. Will automatically resize
     * if the given source array is of a larger size than the internal array.
     */
    public setFromArray(index: number, array: number[]) {
        const newSize = index + array.length;

        if (newSize > this.array.length) {
            this.grow(newSize);
        } else if (newSize < this.array.length) {
            this.shrink( newSize );
        }

        this.array.set(array, this.indexOffset + index);
    };

    /**
     * Set a Vector2 value at `index`.
     */
    public setVec2(index: number, vec2: THREE.Vector2): void {
        this.setVec2Components(index, vec2.x, vec2.y);
    };

    /**
     * Set a Vector2 value using raw components.
     */
    public setVec2Components(index: number, x: number, y: number): void {
        const i = this.indexOffset + (index * this.componentSize);

        this.array[i] = x;
        this.array[i + 1] = y;
    };

    /**
     * Set a Vector3 value at `index`.
     */
    public setVec3(index: number, vec3: THREE.Vector3): void {
        this.setVec3Components(index, vec3.x, vec3.y, vec3.z);
    };

    /**
     * Set a Vector3 value using raw components.
     */
    public setVec3Components(index: number, x: number, y: number, z: number): void {
        const i = this.indexOffset + (index * this.componentSize);

        this.array[i] = x;
        this.array[i + 1] = y;
        this.array[i + 2] = z;
    };

    /**
     * Set a Vector4 value at `index`.
     */
    public setVec4(index: number, vec4: THREE.Vector4): void {
        this.setVec4Components(index, vec4.x, vec4.y, vec4.z, vec4.w);
    };

    /**
     * Set a Vector4 value using raw components.
     */
    public setVec4Components(index: number, x: number, y: number, z: number, w: number): void {
        const i = this.indexOffset + ( index * this.componentSize );

        this.array[i] = x;
        this.array[i + 1] = y;
        this.array[i + 2] = z;
        this.array[i + 3] = w;
    };

    /**
     * Set a Matrix3 value at `index`.
     */
    public setMat3(index: number, mat3: THREE.Matrix3): void {
        this.setFromArray(this.indexOffset + (index * this.componentSize), mat3.elements);
    };

    /**
     * Set a Matrix4 value at `index`.
     */
    public setMat4(index: number, mat4: THREE.Matrix4) {
        'use strict';

        this.setFromArray(this.indexOffset + (index * this.componentSize), mat4.elements);
    };

    /**
     * Set a Color value at `index`.
     */
    public setColor(index: number, color: THREE.Color) {
        return this.setVec3Components(index, color.r, color.g, color.b);
    };

    /**
     * Set a Number value at `index`.
     */
    public setNumber(index: number, numericValue: number): void {
        this.array[this.indexOffset + (index * this.componentSize)] = numericValue;
    };

    /**
     * Returns the value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * Note that this function ignores the component size and will just return a
     * single value.
     */
    public getValueAtIndex(index: number): number {
        return this.array[this.indexOffset + index];
    };

    /**
     * Returns the component value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * If the componentSize is set to 3, then it will return a new TypedArray
     * of length 3.
     */
    public getComponentValueAtIndex(index: number): Float32Array {
        return this.array.subarray(this.indexOffset + (index * this.componentSize));
    };
}
