import {Car} from "./Car";
import {
    WHEEL_BACK_LEFT,
    WHEEL_BACK_RIGHT,
    WHEEL_FRONT_LEFT,
    WHEEL_FRONT_RIGHT
} from "../interfaces/physic/IVehicleData";
import {MaterialType} from "../utils/Materials";

export class Evo6 extends Car {
    protected MAX_ENGINE_FORCE = 2000;

    protected MAX_BREAKING_FORCE = 100;

    protected TRANSMISSION_FORCE = 500;

    protected TRANSMISSION_BREAKING_FORCE = 100;

    protected chassisWidth = 0.7;
    protected chassisHeight = 0.5;
    protected chassisLength = 1.7;
    protected massVehicle = 1360;

    protected wheelWidthFront = 0.05;
    protected wheelAxisPositionFront = 0.5;
    protected wheelRadiusFront = 0.125;
    protected wheelHalfTrackFront = 0.32;
    protected wheelAxisHeightFront = 0.1;

    protected wheelWidthBack = 0.05;
    protected wheelAxisPositionBack = -0.5;
    protected wheelRadiusBack = 0.125;
    protected wheelHalfTrackBack = 0.32;
    protected wheelAxisHeightBack = 0.1;

    protected friction = 4.5;
    protected suspensionStiffness = 20.0;
    protected suspensionDamping = 7.0;
    protected suspensionCompression = 4.4;
    protected suspensionRestLength = 0.4;
    protected rollInfluence = 0.12;

    protected steeringClamp = 0.7

    protected maxAccelerationSpeed = 240;
    protected maxBrakingSpeed = 40;

    protected numberOfTransfers = [[20, 21], [40, 41], [60, 61], [80, 81], [100, 101], [120, 121]];

    protected forceWheels = [WHEEL_FRONT_LEFT, WHEEL_FRONT_RIGHT, WHEEL_BACK_LEFT, WHEEL_BACK_RIGHT];

    protected materials = {
        'Paint': {
            type: MaterialType.PhysicalMetal,
            color: 0xffffff,
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
    }
}
