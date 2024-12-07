import { ArcballCamera } from "./camera";
import { createInputHandler } from "./input";
import { quadPositionOffset, quadUVOffset, quadVertArray, quadVertexCount, quadVertexSize } from "./shapes/fullscreenQuad";
import { quitIfWebGPUNotAvailable } from "./utils";
import basicVert from "./shaders/basic.vert.wgsl?raw"

export class Renderer {
    private canvas: HTMLCanvasElement;
    private device: GPUDevice;
    private context: GPUCanvasContext;
    private inputHandler: any; // Define more specific type if needed
    private camera: ArcballCamera;
    private uniformBuffer: GPUBuffer;
    private cameraUniformBuffer: GPUBuffer;
    private bindGroup: GPUBindGroup;
    private pipeline: GPURenderPipeline;
    private uniformVals: Float32Array;
    private cameraUniformVals: Float32Array;
    private startTime: number;
    private lastTime: number;

    private bindGroupLayout: GPUBindGroupLayout;
    private vertexBufferLayout: GPUVertexBufferLayout;
    private vertBuffer: GPUBuffer;

    constructor(canvasId: string, fragShader: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.inputHandler = createInputHandler(this.canvas);
        this.camera = new ArcballCamera();

        this.initialize(fragShader);
    }

    private async initialize(fragShader: string) {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) 
            this.device = await adapter.requestDevice();
        else console.error("Adapter is not found!!");
        quitIfWebGPUNotAvailable(adapter, this.device);

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas(), false);

        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: presentationFormat,
            alphaMode: 'premultiplied',
        });

        this.setupBuffers();
        this.setupPipeline(presentationFormat, fragShader);
        this.startTime = Date.now();
        this.lastTime = Date.now();

        requestAnimationFrame(() => this.frame());
    }

    private resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio;
        this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * devicePixelRatio;
    }

    private setupBuffers() {
        this.vertBuffer = this.device.createBuffer({
            size: quadVertArray.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });

        new Float32Array(this.vertBuffer.getMappedRange()).set(quadVertArray);
        this.vertBuffer.unmap();

        this.vertexBufferLayout = {
            arrayStride: quadVertexSize,
            attributes: [
                {
                    format: "float32x3",
                    offset: quadPositionOffset,
                    shaderLocation: 0, // Position, see vertex shader
                },
                {
                    format:"float32x2",
                    offset: quadUVOffset,
                    shaderLocation: 1
                }    
            ],
        } as GPUVertexBufferLayout;

        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.uniformVals = new Float32Array(4);
        this.cameraUniformBuffer = this.device.createBuffer({
            size: 12 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.cameraUniformVals = new Float32Array(12);

        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
            ],
        });

        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: { buffer: this.cameraUniformBuffer } }
            ]
        });
    }

    private setupPipeline(presentationFormat: GPUTextureFormat, fragShader : string) {
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout],
        });

        this.pipeline = this.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: this.device.createShaderModule({ code: basicVert }),
                buffers: [this.vertexBufferLayout]
            },
            fragment: {
                module: this.device.createShaderModule({ code: fragShader }),
                targets: [{ format: presentationFormat }]
            }
        });
    }

    private async frame() {
        if (!this.device) return;
        
        this.camera.updateCameraPosition(this.inputHandler());
        const rayOrigin = this.camera.rayOrigin;
        const offset = this.camera.cameraOffset;
        const rotationOffset = this.camera.rotationOffset;

        this.cameraUniformVals.set(rayOrigin, 0);
        this.cameraUniformVals.set(offset, 4);
        this.cameraUniformVals.set(rotationOffset, 8);

        let deltaTime = Date.now() - this.lastTime;
        let totalTime = Date.now() - this.startTime;

        this.lastTime = Date.now();

        this.uniformVals.set([deltaTime], 0);
        this.uniformVals.set([totalTime], 1);
        this.uniformVals.set([this.canvas.width, this.canvas.height], 2);

        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformVals);
        this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, this.cameraUniformVals);

        const colorAttachment: GPURenderPassColorAttachment = {
            view: this.context.getCurrentTexture().createView(),
            clearValue: [0.1, 0.1, 0.1, 1.0],
            loadOp: "clear",
            storeOp: "store"
        };

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment]
        };

        const commander = this.device.createCommandEncoder();
        const passEncoder = commander.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.setVertexBuffer(0, this.vertBuffer);
        passEncoder.draw(quadVertexCount);
        passEncoder.end();

        this.device.queue.submit([commander.finish()]);

        requestAnimationFrame(() => this.frame());
    }
}

// Usage
// const renderer = new Renderer("mainCanvas");