import {Car} from "./Car";
import {WHEEL_BACK_LEFT, WHEEL_BACK_RIGHT} from "../interfaces/physic/IVehicleData";
import {MaterialType} from "../utils/Materials";
import * as THREE from "three";

export class SilviaS13 extends Car {
    protected MAX_ENGINE_FORCE = 3000;

    protected MAX_BREAKING_FORCE = 100;

    protected TRANSMISSION_FORCE = 700;

    protected TRANSMISSION_BREAKING_FORCE = 2;

    protected chassisWidth = 0.7;
    protected chassisHeight = 0.5;
    protected chassisLength = 1.95;
    protected massVehicle = 1160;

    protected wheelWidthFront = 0.07;
    protected wheelAxisPositionFront = 0.57;
    protected wheelRadiusFront = 0.142;
    protected wheelHalfTrackFront = 0.35;
    protected wheelAxisHeightFront = 0.17;

    protected wheelWidthBack = 0.1;
    protected wheelAxisPositionBack = -0.53;
    protected wheelRadiusBack = 0.142;
    protected wheelHalfTrackBack = 0.35;
    protected wheelAxisHeightBack = 0.17;

    protected friction = 4;
    protected suspensionStiffness = 16.0;
    protected suspensionDamping = 7.0;
    protected suspensionCompression = 4.4;
    protected suspensionRestLength = 0.45;
    protected rollInfluence = 0.12;

    protected steeringClamp = 0.7

    protected maxAccelerationSpeed = 240;
    protected maxBrakingSpeed = 40;

    protected numberOfTransfers = [[20, 21], [40, 41], [60, 61], [80, 81], [100, 101], [120, 121]];

    protected forceWheels = [WHEEL_BACK_LEFT, WHEEL_BACK_RIGHT];

    protected get materials(): Record<string, { type: MaterialType, color: number, params?: Record<string, any> }> {
        return {
            'Paint': {
                type: MaterialType.StandardMetal,
                color: 0xCB9F63,
                params: { envMap: this.cubeTexture, roughness: 0.05, metalness: 0.5 }
            },
            'Windows': {
                type: MaterialType.StandardGlass,
                color: 0x000000,
                params: { envMap:  this.cubeTexture, transparent: true, opacity: 0.7, }
            },
            'White Lights': {
                type: MaterialType.StandardGlass,
                color: 0xffffff,
                params: { envMap:  this.cubeTexture, transparent: true, opacity: 0.3, }
            },
            'Orange Lights': {
                type: MaterialType.StandardGlass,
                color: 0xFF7E00,
                params: { envMap:  this.cubeTexture, transparent: true, opacity: 0.3, }
            },
            'Red Lights': {
                type: MaterialType.StandardGlass,
                color: 0x5d1818,
                params: { envMap:  this.cubeTexture, }
            }
        };
    }
}
