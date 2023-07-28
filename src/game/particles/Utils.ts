import * as THREE from 'three';
import {ShaderAttribute} from "./ShaderAttribute";

export enum Distributions {
    BOX = 1,
    SPHERE = 2,
    DISC = 3,
    LINE = 4,
}

export class Utils {
    public static VALUE_OVER_LIFETIME_LENGTH = 4;

    /**
     * Given a value, a type, and a default value to fallback to,
     * ensure the given argument adheres to the type requesting,
     * returning the default value if type check is false.
     */
    public static ensureTypedArg(
        arg: boolean|string|number|object,
        type: string,
        defaultValue: boolean|string|number|object
    ): boolean|string|number|object {
        if (typeof arg === type) {
            return arg;
        } else {
            return defaultValue;
        }
    };

    /**
     * Given an array of values, a type, and a default value,
     * ensure the given array's contents ALL adhere to the provided type,
     * returning the default value if type check fails.
     */
    public static ensureArrayTypedArg<T>(
        arg: T[]|boolean|string|number|object,
        type: string,
        defaultValue: boolean|string|number|object
    ): boolean|string|number|object {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if (Array.isArray(arg)) {
            for (let i = arg.length - 1; i >= 0; --i) {
                if (typeof arg[i] !== type) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureTypedArg(arg, type, defaultValue);
    }

    /**
     * Ensures the given value is an instance of a constructor function.
     */
    public static ensureInstanceOf(arg: Object, instance: Function, defaultValue: Object): Object {
        if (instance !== undefined && arg instanceof instance) {
            return arg;
        } else {
            return defaultValue;
        }
    }

    /**
     * Given an array of values, ensure the instances of all items in the array
     * matches the given instance constructor falling back to a default value if
     * the check fails.
     */
    public static ensureArrayInstanceOf<T>(arg: Array<T>|Object, instance: Function, defaultValue: Object): Object {
        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if (Array.isArray(arg)) {
            for (let i = arg.length - 1; i >= 0; --i) {
                if (instance !== undefined && arg[i] instanceof instance === false) {
                    return defaultValue;
                }
            }

            return arg;
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return this.ensureInstanceOf(arg, instance, defaultValue);
    }

    /**
     * Ensures that any "value-over-lifetime" properties of an emitter are
     * of the correct length (as dictated by `SPE.valueOverLifetimeLength`).
     *
     * Delegates to `SPE.utils.interpolateArray` for array resizing.
     *
     * If properties aren't arrays, then property values are put into one.
     */
    public static ensureValueOverLifetimeCompliance(property: Record<string, any>, minLength: number, maxLength: number): void {
        minLength = minLength || 3;
        maxLength = maxLength || 3;

        // First, ensure both properties are arrays.
        if (Array.isArray(property.value) === false ) {
            property.value = [property.value];
        }

        if (Array.isArray(property.spread) === false) {
            property.spread = [property.spread];
        }

        const valueLength = this.clamp( property.value.length, minLength, maxLength );
        const spreadLength = this.clamp( property.spread.length, minLength, maxLength );
        const desiredLength = Math.max( valueLength, spreadLength );

        if (property.value.length !== desiredLength) {
            property.value = this.interpolateArray(property.value, desiredLength);
        }

        if (property.spread.length !== desiredLength) {
            property.spread = this.interpolateArray(property.spread, desiredLength);
        }
    }

    /**
     * Performs linear interpolation (lerp) on an array.
     *
     * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
     *
     * Delegates to `SPE.utils.lerpTypeAgnostic` to perform the actual
     * interpolation.
     */
    public static interpolateArray(
        srcArray: Array<number|THREE.Vector|THREE.Color>,
        newLength: number
    ): Array<number|THREE.Vector|THREE.Color> {
        const first = srcArray[0];
        const last = srcArray[srcArray.length - 1];
        const newArray: Array<number|THREE.Vector|THREE.Color> = [];
        const factor = (srcArray.length- 1) / (newLength - 1);

        if (typeof first === 'number') {
            newArray.push(first);
        } else {
            newArray.push(first.clone());
        }


        for (let i = 1; i < newLength - 1; ++i) {
            const f = i * factor;
            const before = Math.floor(f);
            const after = Math.ceil(f);
            const delta = f - before;

            newArray[i] = this.lerpTypeAgnostic(srcArray[before], srcArray[after], delta);
        }


        if (typeof last === 'number') {
            newArray.push(last);
        } else {
            newArray.push(last.clone());
        }

        return newArray;
    }

    /**
     * Clamp a number to between the given min and max values.
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * If the given value is less than the epsilon value, then return
     * a randomised epsilon value if specified, or just the epsilon value if not.
     * Works for negative numbers as well as positive.
     */
    public zeroToEpsilon(value: number, randomise: boolean): number {
        let result = value;

        const epsilon = 0.00001;

        result = randomise ? Math.random() * epsilon * 10 : epsilon;

        if (value < 0 && value > -epsilon) {
            result = -result;
        }

        return result;
    }

    /**
     * Linearly interpolates two values of various types. The given values
     * must be of the same type for the interpolation to work.
     */
    public static lerpTypeAgnostic(
        start: number|THREE.Vector|THREE.Color,
        end: number|THREE.Vector|THREE.Color,
        delta: number
    ): number|THREE.Vector|THREE.Color|null {
        if (typeof start === 'number' && typeof end === 'number') {
            return start + ((end - start) * delta);
        } else if (start instanceof THREE.Vector2 && end instanceof THREE.Vector2) {
            const out = start.clone();

            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);

            return out;
        } else if (start instanceof THREE.Vector3 && end instanceof THREE.Vector3) {
            const out = start.clone();

            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);
            out.z = this.lerp(start.z, end.z, delta);

            return out;
        } else if (start instanceof THREE.Vector4 && end instanceof THREE.Vector4) {
            const out = start.clone();

            out.x = this.lerp(start.x, end.x, delta);
            out.y = this.lerp(start.y, end.y, delta);
            out.z = this.lerp(start.z, end.z, delta);
            out.w = this.lerp(start.w, end.w, delta);

            return out;
        } else if (start instanceof THREE.Color && end instanceof THREE.Color) {
            const out = start.clone();

            out.r = this.lerp(start.r, end.r, delta);
            out.g = this.lerp(start.g, end.g, delta);
            out.b = this.lerp(start.b, end.b, delta);

            return out;
        } else {
            console.warn( 'Invalid argument types, or argument types do not match:', start, end);

            return null;
        }
    }

    /**
     * Perform a linear interpolation operation on two numbers.
     */
    public static lerp(start: number, end: number, delta: number): number {
        return start + ((end - start) * delta);
    }

    /**
     * Rounds a number to a nearest multiple.
     */
    public static roundToNearestMultiple(n: number, multiple: number): number {
        if (multiple === 0) {
            return n;
        }

        const remainder = Math.abs(n) % multiple;

        if (remainder === 0) {
            return n;
        }

        if (n < 0) {
            return -(Math.abs( n ) - remainder);
        }

        return n + multiple - remainder;
    }

    /**
     * Check if all items in an array are equal. Uses strict equality.
     *
     * @param  {Array} array The array of values to check equality of.
     * @return {Boolean}       Whether the array's values are all equal or not.
     */
    public static arrayValuesAreEqual<T>(array: T[]): boolean {
        for (let i = 0; i < array.length - 1; ++i) {
            if (array[i] !== array[i + 1]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Given a start value and a spread value, create and return a random
     * number.
     */
    public static randomFloat(base: number, spread: number): number {
        return base + spread * (Math.random() - 0.5);
    }

    /**
     * Given an SPE.ShaderAttribute instance, and various other settings,
     * assign values to the attribute's array in a `vec3` format.
     */
    public static randomVector3(
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        spread: THREE.Vector3,
        spreadClamp?: THREE.Vector3
    ): void {
        let x = base.x + (Math.random() * spread.x - (spread.x * 0.5));
        let y = base.y + (Math.random() * spread.y - (spread.y * 0.5));
        let z = base.z + (Math.random() * spread.z - (spread.z * 0.5));

        if (spreadClamp) {
            x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple(x, spreadClamp.x);
            y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple(y, spreadClamp.y);
            z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple(z, spreadClamp.z);
        }

        attribute.typedArray.setVec3Components(index, x, y, z);
    }

    /**
     * Given an SPE.Shader attribute instance, and various other settings,
     * assign Color values to the attribute.
     */
    public static randomColor(attribute: ShaderAttribute, index: number, base: THREE.Color, spread: THREE.Vector3): void {
        let r = base.r + (Math.random() * spread.x);
        let g = base.g + (Math.random() * spread.y);
        let b = base.b + (Math.random() * spread.z);

        r = this.clamp(r, 0, 1);
        g = this.clamp(g, 0, 1);
        b = this.clamp(b, 0, 1);


        attribute.typedArray.setVec3Components(index, r, g, b);
    }


    /**
     * Assigns a random color value, encoded as a hex value in decimal
     * format, to a SPE.ShaderAttribute instance.
     */
    public static randomColorAsHex(attribute: ShaderAttribute, index: number, base: THREE.Color[], spread: THREE.Vector3[]): void {
        const workingColor = new THREE.Color();

        const numItems = base.length;
        const colors: number[] = [];

        for (let i = 0; i < numItems; ++i) {
            const spreadVector = spread[i];

            workingColor.copy(base[i]);

            workingColor.r += (Math.random() * spreadVector.x) - (spreadVector.x * 0.5);
            workingColor.g += (Math.random() * spreadVector.y) - (spreadVector.y * 0.5);
            workingColor.b += (Math.random() * spreadVector.z) - (spreadVector.z * 0.5);

            workingColor.r = this.clamp(workingColor.r, 0, 1);
            workingColor.g = this.clamp(workingColor.g, 0, 1);
            workingColor.b = this.clamp(workingColor.b, 0, 1);

            colors.push(workingColor.getHex());
        }

        attribute.typedArray.setVec4Components(index, colors[0], colors[1], colors[2], colors[3]);
    }

    /**
     * Given an SPE.ShaderAttribute instance, and various other settings,
     * assign values to the attribute's array in a `vec3` format.
     */
    public static randomVector3OnLine(attribute: ShaderAttribute, index: number, start: THREE.Vector3, end: THREE.Vector3): void {
        const pos = start.clone();

        pos.lerp(end, Math.random());

        attribute.typedArray.setVec3Components(index, pos.x, pos.y, pos.z);
    }

    /**
     * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
     * given values onto a sphere.
     */
    public static randomVector3OnSphere(
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        radius: number,
        radiusSpread: number,
        radiusScale: THREE.Vector3,
        radiusSpreadClamp: number,
        distributionClamp: number,
    ) {
        const depth = 2 * Math.random() - 1;
        const t = 6.2832 * Math.random();
        const r = Math.sqrt(1 - depth * depth);

        let rand = this.randomFloat(radius, radiusSpread);
        let x = 0;
        let y = 0;
        let z = 0;


        if (radiusSpreadClamp) {
            rand = Math.round( rand / radiusSpreadClamp ) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = r * Math.cos(t) * rand;
        y = r * Math.sin(t) * rand;
        z = depth * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;
        z *= radiusScale.z;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components(index, x, y, z);
    }

    public static seededRandom(seed: number): number {
        const x = Math.sin(seed) * 10000;

        return x - (x | 0);
    }

    /**
     * Assigns a random vector 3 value to an SPE.ShaderAttribute instance, projecting the
     * given values onto a 2d-disc.
     */
    public static randomVector3OnDisc(
        attribute:  ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        radius: number,
        radiusSpread: number,
        radiusScale: THREE.Vector3,
        radiusSpreadClamp?: number
    ): void {
        let t = 6.2832 * Math.random();
        let rand = Math.abs(this.randomFloat(radius, radiusSpread));
        let x = 0;
        let y = 0;
        let z = 0;

        if (radiusSpreadClamp) {
            rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
        }

        // Set position on sphere
        x = Math.cos(t) * rand;
        y = Math.sin(t) * rand;

        // Apply radius scale to this position
        x *= radiusScale.x;
        y *= radiusScale.y;

        // Translate to the base position.
        x += base.x;
        y += base.y;
        z += base.z;

        // Set the values in the typed array.
        attribute.typedArray.setVec3Components( index, x, y, z );
    }

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     */
    public static randomDirectionVector3OnSphere(
        attribute: ShaderAttribute,
        index: number,
        posX: number,
        posY: number,
        posZ: number,
        emitterPosition: THREE.Vector3,
        speed: number,
        speedSpread: number,
    ): void {
        const v = new THREE.Vector3();

        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

        attribute.typedArray.setVec3Components(index, v.x, v.y, v.z);
    }

    /**
     * Given an SPE.ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     */
    public static randomDirectionVector3OnDisc(
        attribute: ShaderAttribute,
        index: number,
        posX: number,
        posY: number,
        posZ: number,
        emitterPosition: THREE.Vector3,
        speed: number,
        speedSpread: number
    ): void {
        const v = new THREE.Vector3();

        v.copy(emitterPosition);

        v.x -= posX;
        v.y -= posY;
        v.z -= posZ;

        v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

        attribute.typedArray.setVec3Components(index, v.x, v.y, 0);
    }

    /**
     * Given a rotation axis, and a rotation axis spread vector,
     * calculate a randomised rotation axis, and pack it into
     * a hexadecimal value represented in decimal form.
     */
    public static getPackedRotationAxis(axis: THREE.Vector3, axisSpread: THREE.Vector3): number {
        const v = new THREE.Vector3();
        const vSpread = new THREE.Vector3();
        const c = new THREE.Color();
        const addOne = new THREE.Vector3(1, 1, 1);

        v.copy(axis).normalize();
        vSpread.copy( axisSpread ).normalize();

        v.x += (-axisSpread.x * 0.5) + (Math.random() * axisSpread.x);
        v.y += (-axisSpread.y * 0.5) + (Math.random() * axisSpread.y);
        v.z += (-axisSpread.z * 0.5) + (Math.random() * axisSpread.z);

        v.normalize().add(addOne).multiplyScalar(0.5);

        c.setRGB(v.x, v.y, v.z);

        return c.getHex();
    }
}
