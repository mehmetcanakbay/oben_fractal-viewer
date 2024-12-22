import { ArcballCamera } from "./camera";
import { createInputHandler } from "./input";
import { quadPositionOffset, quadUVOffset, quadVertArray, quadVertexCount, quadVertexSize } from "./shapes/fullscreenQuad";
import { quitIfWebGPUNotAvailable } from "./utils";
import basicVert from "./shaders/basic.vert.wgsl?raw"
import type { Parameters } from "./parameters";
import globals from "./globals"
export class Renderer {
    private canvas: HTMLCanvasElement;
    public device: GPUDevice;
    private context: GPUCanvasContext;
    private inputHandler: any; // Define more specific type if needed
    private camera: ArcballCamera;
    private uniformBuffer: GPUBuffer;
    private cameraUniformBuffer: GPUBuffer;
    private bindGroups: GPUBindGroup[] = [];
    private pipelines: GPURenderPipeline[] = [];
    private selectedPipeline: number = 0;
    private uniformVals: Float32Array;
    private cameraUniformVals: Float32Array;
    private startTime: number;
    private lastTime: number;

    private bindGroupLayout: GPUBindGroupLayout;
    private vertexBufferLayout: GPUVertexBufferLayout;
    private vertBuffer: GPUBuffer;

    private presentationFormat: GPUTextureFormat;

    constructor(canvasId: string, onInitializationFinish:  ()=>void) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.inputHandler = createInputHandler(this.canvas);
        this.camera = new ArcballCamera();

        this.initialize(onInitializationFinish);
    }

    public switchPipeline(id: number) {
        this.selectedPipeline = id;
        this.camera.resetVariables();
    }

    public setCameraSensitivity(newSens: number) {
        this.camera.setSensitivity(newSens);
    }

    public setCameraZoomAmount(newZoom: number) {
        this.camera.setZoomSpeed(newZoom);
    }

    public async initialize(onInitFinish : ()=>void) {
        const adapter = await navigator.gpu?.requestAdapter();
        if (adapter) 
            this.device = await adapter.requestDevice();
        else {
            console.error("WebGPU is not available on this browser.");
            globals.eventEmitter.emit("webGPU_error", "WebGPU not available on this browser!")
            return false;
        }
        quitIfWebGPUNotAvailable(adapter, this.device);

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas(), false);

        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: 'premultiplied',
        });

        this.setupBuffers();

        onInitFinish();

        return true;
    }

    public setupPipelines(fragShaders: string[], parameters: (Parameters | null)[]) {
        for (let i = 0; i<fragShaders.length;i++) {
            const entries: GPUBindGroupLayoutEntry[] = [ 
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' as GPUBufferBindingType } }, 
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' as GPUBufferBindingType } }, 
            ];

            if (parameters && parameters[i]) entries.push(parameters[i].returnBindLayout())

            const bindGroupLayout = this.device.createBindGroupLayout(
                {
                    entries: entries,
                }
            );

            const bindGroupEntries: GPUBindGroupEntry[] = [ 
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: { buffer: this.cameraUniformBuffer } },
            ];

            if (parameters && parameters[i]) bindGroupEntries.push(parameters[i].returnBindGroup())
    
            const bindGroup = this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: bindGroupEntries
            });

            const pipeline : GPURenderPipeline = this.setupPipeline(this.presentationFormat, fragShaders[i], bindGroupLayout);
            this.bindGroups.push(bindGroup);
            this.pipelines.push(pipeline);
        }
    }

    public start() {
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

        //common buffers
        this.uniformVals = new Float32Array(4);
        this.cameraUniformVals = new Float32Array(12);

        this.cameraUniformBuffer = this.device.createBuffer({
            size: 12 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    private setupPipeline(presentationFormat: GPUTextureFormat, fragShader : string, bindGroupLayout: GPUBindGroupLayout) {
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const newPipeline : GPURenderPipeline  = this.device.createRenderPipeline({
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

        return newPipeline
    }

    private async frame() {
        if (!this.device) {
            requestAnimationFrame(() => this.frame());
            return;
        }
        
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
        passEncoder.setPipeline(this.pipelines[this.selectedPipeline]);
        passEncoder.setBindGroup(0, this.bindGroups[this.selectedPipeline]);
        passEncoder.setVertexBuffer(0, this.vertBuffer);
        passEncoder.draw(quadVertexCount);
        passEncoder.end();

        this.device.queue.submit([commander.finish()]);

        requestAnimationFrame(() => this.frame());
    }
}

// Usage
// const renderer = new Renderer("mainCanvas");