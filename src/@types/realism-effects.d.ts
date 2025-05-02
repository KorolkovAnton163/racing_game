declare module 'realism-effects' {
  import { Camera, Scene } from "three";
  import { Pass } from "postprocessing";

  export class VelocityDepthNormalPass extends Pass {
    constructor(scene: Scene, camera: Camera);
  }
}
