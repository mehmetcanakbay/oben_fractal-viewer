function quitIfAdapterNotAvailable(
    adapter: GPUAdapter | null
  ): asserts adapter {

    if (!('gpu' in navigator)) {
        console.error('navigator.gpu is not defined - WebGPU not available in this browser');
    }
  
    if (!adapter) {
        console.error("requestAdapter returned undefined - this sample can't run on this system");
    }
}

export function quitIfWebGPUNotAvailable(
    adapter: GPUAdapter | null,
    device: GPUDevice | undefined
  ): asserts device {

    if (!device) {
        quitIfAdapterNotAvailable(adapter);
        console.error('Unable to get a device for an unknown reason');
    }
}