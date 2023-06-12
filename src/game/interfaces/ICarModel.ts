import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";

export interface ICarModel {
    body: GLTF,
    wheels: {
        fl: GLTF,
        fr: GLTF,
        bl: GLTF,
        br: GLTF,
    }
}
