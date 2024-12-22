<script lang="ts">
	import type { Parameters } from "../core/parameters";
	import type { Renderer } from "../core/renderer";
	import MandelbulbSidebar from "./sidebars/MandelbulbSidebar.svelte";
	import Slider from "./sidebars/Slider.svelte";
    import globals from "../core/globals";
	import MandelboxSidebar from "./sidebars/MandelboxSidebar.svelte";
	import gsap from "gsap";

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

    let isOpen = true;
    let animHandler = null;
    function closeOpenSidebar() {
        animHandler && animHandler.progress(1)
        animHandler && animHandler.kill()
        if (isOpen) {
            animHandler = gsap.to(
                "#sidebar",
                {
                    x: "+=300",
                    alpha: 0
                }
            )
        } else {
            animHandler = gsap.to(
                "#sidebar",
                {
                    x: "-=300",
                    alpha: 1
                }
            )
        }

        isOpen = !isOpen
    }
</script>

<div class="fixed top-0 right-0 bottom-0 h-full w-96 text-white transform" id="sidebar">
    <div class="fixed z-0 w-full h-full shadow-2xl bg-oben-main/20 backdrop-blur-2xl"></div>
    <div class="fixed w-96 h-full flex flex-col z-10 items-center py-4">
        <div class="flex flex-col items-center w-[22rem] overflow-y-auto overflow-x-hidden">
            <button class="my-2 text-xl bg-oben-secondary px-4 py-1 rounded-lg" onclick={closeOpenSidebar()}>Hide Bar</button>
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

{#if !isOpen}
<div class="fixed top-0 right-0 bottom-0 h-full w-96 text-white transform">
    <div class="fixed w-96 h-full flex flex-col z-10 items-center py-4">
        <button class="my-2 text-xl bg-oben-secondary px-4 py-1 rounded-lg" onclick={closeOpenSidebar()}>Reopen</button>
    </div>
</div>
{/if}