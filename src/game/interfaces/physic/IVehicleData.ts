import * as THREE from "three";

export const WHEEL_FRONT_LEFT = 0;

export const WHEEL_FRONT_RIGHT = 1;

export const WHEEL_BACK_LEFT = 2;

export const WHEEL_BACK_RIGHT = 3;

export const MAX_ENGINE_FORCE = 2000; //мкасимальная сила скоторой машина набирает //2000

export const MAX_BREAKING_FORCE = 100; //масимальная сила торможения

export interface IVehicleData {
    chassisWidth: number;
    chassisHeight: number;
    chassisLength: number;
    massVehicle: number;
    position: {
        x: number,
        y: number,
        z: number,
    };
    quaternion: {
        x: number,
        y: number,
        z: number,
        w: number
    };
    suspensionRestLength: number;
    suspensionStiffness: number;
    suspensionDamping: number;
    suspensionCompression: number;
    friction: number;
    rollInfluence: number;
    wheelHalfTrackFront: number;
    wheelAxisHeightFront: number;
    wheelAxisPositionFront: number;
    wheelHalfTrackBack: number;
    wheelAxisHeightBack: number;
    wheelAxisPositionBack: number;
    wheelRadiusFront: number;
    wheelRadiusBack: number;
    wheelWidthFront: number;
    wheelWidthBack: number;
    steeringClamp: number;
    numberOfTransfers: number[][];
    TRANSMISSION_FORCE: number;
    TRANSMISSION_BREAKING_FORCE: number;
    maxAccelerationSpeed: number;
    maxBrakingSpeed: number;
    forceWheels: number[];
}
