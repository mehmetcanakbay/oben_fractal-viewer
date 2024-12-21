<script lang="ts">
	import gsap from "gsap";
	import { Parameters } from "../../core/parameters";
	import type { Renderer } from "../../core/renderer";
    import Slider from "./Slider.svelte";
    export let renderer : Renderer;
    export let param : Parameters | null;
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';


    let fractalColor : RgbaColor = {r: 0, g:255, b:162, a: 1}
    // let fractalColor2 : RgbaColor = {r: 255, g:255, b:255, a: 1}
    let dimensions = 8;
    let mandelBulbIterations = 10;
    let rayMarchIterations = 100;
    let rayMarchDistance = 0.001;
    let normalEpsilon = 0.01;
    if (param) {
        param.onInitialize = ()=>{
            const fractalColorNormalize : number[] = normalizeRgbaColor(fractalColor);
            param.changeValue(renderer.device, Number(dimensions), 0);
            param.changeValue(renderer.device, Number(mandelBulbIterations), 1);
            param.changeValue(renderer.device, Number(rayMarchIterations), 2);
            param.changeValue(renderer.device, Number(rayMarchDistance), 3);
            param.changeValue_Array(renderer.device, fractalColorNormalize, 4);
            param.changeValue(renderer.device, normalEpsilon, 7);
        }
    }

    $: {
        if (param) {
            if (param.didInitialize())
                param.changeValue(renderer.device, Number(dimensions), 0);
        }
    }

    $: {
        if (param) {
            if (param.didInitialize())
                param.changeValue(renderer.device, Number(mandelBulbIterations), 1);
        }
    }

    
    $: {
        if (param) {
            if (param.didInitialize())
                param.changeValue(renderer.device, Number(rayMarchIterations), 2);
        }
    }

    
    $: {
        if (param) {
            if (param.didInitialize())
                param.changeValue(renderer.device, Number(rayMarchDistance), 3);
        }
    }

    $: {
        const fractalColorNormalize : number[] = normalizeRgbaColor(fractalColor);
        if (param) {
            if (param.didInitialize())
                param.changeValue_Array(renderer.device, fractalColorNormalize, 4);
        }
    }

    $: {
        if (param) {
            if (param.didInitialize())
                param.changeValue(renderer.device, Number(normalEpsilon), 7);
        }
    }

    function normalizeRgbaColor(col : RgbaColor) {
        if (!col) return [1.0, 1.0, 1.0, 1.0]
        let arr = [col.r, col.g, col.b, col.a]
        for (let i = 0; i<4;i++) {
            arr[i] /= 255.0;
        }

        return arr;
    }
</script>

<h1 class="text-2xl py-4 font-bold">Mandelbulb Parameters</h1>
<div class="flex flex-col">
    <ColorPicker label="Fractal Color" bind:rgb={fractalColor}/>
</div>
<Slider name="Dimension"             bind:number={dimensions}           min=0     max=20   step=0.05    />
<Slider name="Mandelbulb Iterations" bind:number={mandelBulbIterations} min=1     max=50   step=1       />
<Slider name="Ray March Iterations"  bind:number={rayMarchIterations}   min=5   max=500  step=1       />
<Slider name="Ray March Distance"    bind:number={rayMarchDistance}     min=1e-6 max=1e-3  step=1e-6   />
<Slider name="Details (Lower means more)"    bind:number={normalEpsilon}     min=1e-6 max=1e-2  step=1e-6   />


<style lang="postcss">
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 1.2rem;
        height: 1.2rem;
        border-radius: 50%; 
        background: #CB4C4F;
        cursor: pointer;
    }

    :global(.color-picker > *) {
        @apply text-oben-tertiary text-lg font-bold;
    }
</style>