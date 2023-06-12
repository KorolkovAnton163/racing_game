import * as Comlink from 'comlink'
import { support } from '../utils/wasm';
import {Physics} from "../physics/Physics";
importScripts(support ? 'ammo.wasm.js' : 'ammo.js')

const Module = { TOTAL_MEMORY: 256 * 1024 * 1024 };

class Wrapper {
    public physics: Physics;

    init(): Promise<void> {
        return new Promise((resolve) => {
            Ammo().then(() => {
                this.physics = new Physics();

                self.postMessage({ msg: 'ready' })

                let last = new Date().getTime()

                const loop = () => {
                    let now = new Date().getTime()
                    const delta = now - last
                    last = now

                    self.postMessage({ msg: 'preUpdate' })

                    const updates = this.physics.update(delta)

                    self.postMessage({ msg: 'updates', updates })

                    self.postMessage({ msg: 'postUpdate' })

                    requestAnimationFrame(loop)
                }
                loop()

                resolve();
            });
        });
    }
}

Comlink.expose(Wrapper)
