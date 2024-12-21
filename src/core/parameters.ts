export class Parameters {
    private buffArray : Float32Array;
    private buffer : GPUBuffer;
    private binding: number;

    private isInitialized: boolean;
    public onInitialize: ()=>void;

    public initializeBuffer(device:GPUDevice, count: number, binding:number) {
        this.buffArray = new Float32Array(count);
        this.binding = binding;

        this.buffer = device.createBuffer({
            size: count * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.isInitialized = true;
        
        if (this.onInitialize) {
            this.onInitialize();
        }
    }

    public didInitialize() {
        return this.isInitialized;
    }

    public changeValue(device: GPUDevice, value:number, offset: number) {
        this.buffArray.set([value], offset);
        device.queue.writeBuffer(this.buffer, 0, this.buffArray);
    }

    /**
     * TODO: 
     * There's probably a better way to do this.
     */
    public changeValue_Array(device: GPUDevice, value:number[], offset: number)  {
        this.buffArray.set(value, offset);
        device.queue.writeBuffer(this.buffer, 0, this.buffArray);
    }

    public returnBindLayout() {
        return { binding: this.binding, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' as GPUBufferBindingType } }
    }

    public returnBindGroup() {
        return { binding: this.binding, resource: { buffer: this.buffer } }
    }
}