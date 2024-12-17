export class Parameters {
    private buffArray : Float32Array;
    private buffer : GPUBuffer;
    private binding: number;

    public initializeBuffer(device:GPUDevice, count: number, binding:number) {
        this.buffArray = new Float32Array(count);
        this.binding = binding;

        this.buffer = device.createBuffer({
            size: count * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    public changeValue(device: GPUDevice, value:number, offset: number) {
        this.buffArray.set([value], offset);
        device.queue.writeBuffer(this.buffer, 0, this.buffArray);
    }

    public returnBindLayout() {
        return { binding: this.binding, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' as GPUBufferBindingType } }
    }

    public returnBindGroup() {
        return { binding: this.binding, resource: { buffer: this.buffer } }
    }
}