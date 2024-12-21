<script lang="ts">
	import type { Parameters } from "../core/parameters";
	import type { Renderer } from "../core/renderer";
	import MandelbulbSidebar from "./sidebars/MandelbulbSidebar.svelte";
	import Slider from "./sidebars/Slider.svelte";
    import globals from "../core/globals";
	import MandelboxSidebar from "./sidebars/MandelboxSidebar.svelte";

    export let renderer : Renderer;
    export let params: (Parameters | null)[];
    let currentShader = 1;

    let cameraSensSlider : number = 0.0001;
    let cameraZoomAmount : number = 1.;
    $: {
        renderer.setCameraSensitivity(cameraSensSlider);
    }

    $:{
        renderer.setCameraZoomAmount(cameraZoomAmount)
    }

    globals.eventEmitter.on("changedShaders",(ind)=>{
        currentShader = ind;
    })


</script>

<div class="relative h-full w-full">
    <div class="fixed top-0 right-0 h-full w-96 text-white">
        <div class="fixed z-0 w-full h-full shadow-2xl bg-oben-main/20 backdrop-blur-2xl"></div>
        <div class="fixed w-96 h-full flex flex-col z-10 items-center ">
            <div class="flex flex-col items-center  w-80 ">
                <h1 class="text-2xl py-4 font-bold text-oben-special2">Camera Parameters</h1>
                <Slider name="Camera Movement Speed" bind:number={cameraSensSlider} min=0.00001 max=0.0001 step=0.00001/>
                <Slider name="Camera Zoom Amount" bind:number={cameraZoomAmount} min=0.01 max=1 step=0.01/>
                {#if currentShader === 0}
                    <MandelboxSidebar renderer={renderer} param={params[0]}/>
                {/if}
                {#if currentShader === 1}
                    <MandelbulbSidebar renderer={renderer} param={params[1]}/>
                {/if}
            </div>
        </div>
    </div>
</div>
