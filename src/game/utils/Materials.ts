import * as THREE from "three";

export enum MaterialType {
    StandardGlass = 'StandardGlass',
    PhysicalGlass = 'PhysicalGlass',
    StandardMetal = 'StandardMetal',
    PhysicalMetal = 'PhysicalMetal',
}

export default class {
    public static create(type: MaterialType, color: number, name: string, params?: Record<string, any>): THREE.Material {
        switch (type) {
            case MaterialType.PhysicalGlass:
                return new THREE.MeshPhysicalMaterial({
                    name: name, color: color, metalness: 0.25, roughness: 0.0, transmission: 1.0
                });
            case MaterialType.PhysicalMetal:
                return new THREE.MeshPhysicalMaterial({
                    name: name, color: color, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03
                });
            case MaterialType.StandardMetal:
                const sp = params ?? {};

                sp.name = name;
                sp.color = color;

                return new THREE.MeshStandardMaterial(sp as THREE.MeshStandardMaterialParameters);
            case MaterialType.StandardGlass:
                const sg = params ?? {};

                sg.name = name;
                sg.color = color;
                sg.metalness = 0;
                sg.roughness = 0;
                sg.envMapIntensity = 1;

                return new THREE.MeshStandardMaterial(sg as THREE.MeshStandardMaterialParameters);
            default:
                return new THREE.MeshStandardMaterial({
                    color: color,
                    name: name,
                })
        }
    }
}
