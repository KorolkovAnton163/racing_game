import * as THREE from "three";

export enum MaterialType {
    StandardGlass = 'StandardGlass',
    PhysicalGlass = 'PhysicalGlass',
    PhysicalMetal = 'PhysicalMetal',
}

export default class {
    public static create(type: MaterialType, color: number, name: string, params?: THREE.MeshStandardMaterialParameters): THREE.Material {
        switch (type) {
            case MaterialType.PhysicalGlass:
                return new THREE.MeshPhysicalMaterial({
                    name: name, color: color, metalness: 0.25, roughness: 0.0, transmission: 1.0
                });
            case MaterialType.PhysicalMetal:
                return new THREE.MeshPhysicalMaterial({
                    name: name, color: color, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03
                });
            case MaterialType.StandardGlass:
                const p = params ?? {};

                p.name = name;
                p.color = color;
                p.metalness = 0;
                p.roughness = 0;
                p.envMapIntensity = 1;

                return new THREE.MeshStandardMaterial(p)
            default:
                return new THREE.MeshStandardMaterial({
                    color: color,
                    name: name,
                })
        }
    }
}
