import * as THREE from "three";

export interface IPhysicBoxData {
    pos: {
        x: number,
        y: number,
        z: number,
    };
    quat: {
        x: number,
        y: number,
        z: number,
        w: number
    };
    w: number;
    l: number;
    h: number;
    mass: number;
    friction: number;
}
