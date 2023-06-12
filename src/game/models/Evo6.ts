import {Car} from "./Car";

export class Evo6 extends Car {
    protected TRANSMISSION_FORCE = 500;

    protected TRANSMISSION_BREAKING_FORCE = 100;

    protected chassisWidth = 0.7;
    protected chassisHeight = 0.5;
    protected chassisLength = 1.7;
    protected massVehicle = 1360;

    protected wheelWidthFront = 0.1;
    protected wheelAxisPositionFront = 0.5;
    protected wheelRadiusFront = 0.125;
    protected wheelHalfTrackFront = 0.32;
    protected wheelAxisHeightFront = 0.1;

    protected wheelWidthBack = 0.1;
    protected wheelAxisPositionBack = -0.5;
    protected wheelRadiusBack = 0.125;
    protected wheelHalfTrackBack = 0.32;
    protected wheelAxisHeightBack = 0.1;

    protected friction = 2000;
    protected suspensionStiffness = 20.0;
    protected suspensionDamping = 7.0;
    protected suspensionCompression = 4.4;
    protected suspensionRestLength = 0.4;
    protected rollInfluence = 0.12;

    protected steeringClamp = 0.7

    protected maxAccelerationSpeed = 240;
    protected maxBrakingSpeed = 40;

    protected numberOfTransfers = [[20, 21], [40, 41], [60, 61], [80, 81], [100, 101], [120, 121]];

    protected forceWheels = [this.FRONT_LEFT, this.FRONT_RIGHT, this.BACK_LEFT, this.BACK_RIGHT];
}
