import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export class Loader {
    protected static models: Record<string, GLTF> = {};

    public static async loadModel(path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            new GLTFLoader().load(path, (gltf: GLTF) => {
                this.models[path] = gltf;

                resolve(this.models[path]);
            },
                (event: ProgressEvent) => {
                    // console.log('load process');
                    // console.log(event);
            }, (event: ErrorEvent) => {
                console.error(event);
                reject();
            });
        });
    }
}
