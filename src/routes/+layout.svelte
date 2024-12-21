<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { Renderer } from '../core/renderer';
	import mandelFrag from "../core/shaders/mandelbox/mandelbox.frag.wgsl?raw"
	import mandelbulbFrag from "../core/shaders/mandelbulb/mandelbulb.frag.wgsl?raw"
	import basicFrag from "../core/shaders/basic.frag.wgsl?raw"
	import Sidebar from "../components/Sidebar.svelte";
	import ShaderSelection from "../components/ShaderSelection.svelte";
	import { Parameters } from '../core/parameters';
	import globals from '../core/globals';

	let { children } = $props();
	
	let canvas : HTMLCanvasElement | undefined = $state();
	let renderer : Renderer = $state();
	const mandelboxParams = new Parameters();
	const mandelbulbParams = new Parameters();
	const params : (Parameters | null)[] =  [mandelboxParams, mandelbulbParams];
	onMount(()=>{
		renderer = new Renderer("mainCanvas", ()=>{
			mandelboxParams.initializeBuffer (renderer.device, 8, 2)
			mandelbulbParams.initializeBuffer(renderer.device, 8, 2)
			renderer.setupPipelines([mandelFrag, mandelbulbFrag], params);
		});
		renderer.switchPipeline(1);
		renderer.start();

		const resizeCanvas = ()=> {
			if (canvas) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}
		}
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();
	})

	type shaderChangeData = {
		data: number
	}
	function onChangeShader(data: shaderChangeData) {
		renderer.switchPipeline(data.data);
		globals.eventEmitter.emit("changedShaders", data.data);
	}

</script>

<svelte:head>
	<title>OBEN | MANDELBOX</title>
	<meta name="description" content="OBEN Fractal Viewer" />
</svelte:head>

<div class="app">
	<main>
		<div id="app">
			<canvas width="1200" height="1000" id="mainCanvas" bind:this={canvas}></canvas>
		</div>

		<div class="relative h-full w-full">
			<div class="fixed top-0 left-1/2 transform -translate-x-1/2 p-4">
				<ShaderSelection onClickAny={onChangeShader}/>
			</div>
		</div>
		{#if renderer !== undefined}
			<Sidebar renderer={renderer} params={params} />
		{/if}
	</main>
</div>

<style>
</style>
