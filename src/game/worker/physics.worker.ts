import * as Comlink from 'comlink'
import { support } from '../utils/wasm';
import {Physics} from "../physics/Physics";
importScripts(support ? 'ammo.wasm.js' : 'ammo.js');

const Module = { TOTAL_MEMORY: 256 * 1024 * 1024 };

class Wrapper {
    public physics: Physics;

    private last: number;

    public init(): Promise<void> {
        return new Promise((resolve) => {
            Ammo().then(() => {
                this.physics = new Physics();

                self.postMessage({ msg: 'ready' });

                this.last = new Date().getTime();

                this.loop();

                resolve();
            });
        });
    }

    private loop(): void {
        const now = new Date().getTime();
        const delta = now - this.last;

        this.last = now;

        self.postMessage({ msg: 'preUpdate' });

        const updates = this.physics.update(delta);

        self.postMessage({ msg: 'updates', updates });

        self.postMessage({ msg: 'postUpdate' });

        requestAnimationFrame(() => {
            this.loop();
        });
    }
}

Comlink.expose(Wrapper)
