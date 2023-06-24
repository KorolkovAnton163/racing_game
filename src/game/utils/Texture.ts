import * as THREE from 'three';

export class Texture {
    public static load(path: string, repeat?: { x: number, y: number }): THREE.Texture {
        const texture = new THREE.TextureLoader().load(path);

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        if (repeat) {
            texture.repeat.x = repeat.x;
            texture.repeat.y = repeat.y;

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        }

        return texture;
    }

    public static loadCube(urls: string[]): Promise<THREE.CubeTexture> {
        return new Promise((resolve) => {
            new THREE.CubeTextureLoader().load(urls, (texture: THREE.CubeTexture) => {
                resolve(texture);
            });
        });
    }
}
