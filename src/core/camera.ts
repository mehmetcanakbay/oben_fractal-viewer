import { degreesToRadians } from "./math";
import {type Input} from "./input";

export class ArcballCamera {
    private cameraRotationX = 0; // Pitch
    private cameraRotationY = 0; // Yaw
    private sensitivity = 0.0001; // Adjust as needed
    private radius = 20; 
    private zoomSpeed = 1.;

    private panOffsetX = 0;
    private panOffsetY = 0;

    private rotationOffsetX = 0;
    private rotationOffsetY = 0;

    private ro = new Float32Array(3);
    private offset = new Float32Array(3);
    private rotationOffsetArr = new Float32Array(3);

    setSensitivity(newSens: number) {
        this.sensitivity = newSens;
    }

    setZoomSpeed(newSpeed: number) {
        this.zoomSpeed = newSpeed
    }

    updateCameraPosition(input: Input) {
        const deltaX = input.analog.x * this.sensitivity * this.radius * 2;
        const deltaY = input.analog.y * this.sensitivity * this.radius * 2;
    
        this.cameraRotationY += deltaX;
        this.cameraRotationX += deltaY;
        this.cameraRotationX = Math.max(-Math.PI/2.01, Math.min(Math.PI/2.01, this.cameraRotationX)); // Clamp pitch

        this.radius += input.analog.zoom * this.zoomSpeed;
        this.radius = Math.max(1, Math.min(100, this.radius)); 
    
        const roX = this.radius * Math.sin(this.cameraRotationY) * Math.cos(this.cameraRotationX);
        const roY = this.radius * Math.sin(this.cameraRotationX);
        const roZ = this.radius * Math.cos(this.cameraRotationY) * Math.cos(this.cameraRotationX);
    
        this.ro.set([roX, roY, roZ]);
    
        const panDeltaX = input.analog.panX * this.sensitivity * this.radius * 7;
        const panDeltaY = input.analog.panY * this.sensitivity * this.radius * 7;
    
        this.panOffsetX += panDeltaX;
        this.panOffsetY += panDeltaY;
    
        this.offset.set([this.panOffsetX, this.panOffsetY, 0]);
    
        const rotOffsetDeltaX = input.analog.rotationOffsetX * this.sensitivity * this.radius * 30;
        const rotOffsetDeltaY = input.analog.rotationOffsetY * this.sensitivity * this.radius * 30;
    
        this.rotationOffsetX -= rotOffsetDeltaY * -1;
        this.rotationOffsetY -= rotOffsetDeltaX;
    
        this.rotationOffsetArr.set([degreesToRadians(this.rotationOffsetX), degreesToRadians(this.rotationOffsetY), 0]);
    }

    public resetVariables() {
        this.panOffsetX = 0;
        this.panOffsetY = 0;

        this.cameraRotationX = 0;
        this.cameraRotationY = 0;
        this.radius = 20;

        this.rotationOffsetX = 0;
        this.rotationOffsetY = 0;
    }

    get rayOrigin() {
        return this.ro;
    }

    get cameraOffset() {
        return this.offset;
    }

    get rotationOffset() {
        return this.rotationOffsetArr;
    }
}
