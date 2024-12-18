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
	let renderer : Renderer;
	const mandelbulbParams = new Parameters();
	onMount(()=>{
		renderer = new Renderer("mainCanvas", ()=>{
			mandelbulbParams.initializeBuffer(renderer.device, 4, 2)
			mandelbulbParams.changeValue(renderer.device, 8, 0);
			renderer.setupPipelines([mandelFrag, mandelbulbFrag, basicFrag], [null, mandelbulbParams, null]);
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
	}

	globals.eventEmitter.on("sliderchange",(val)=>{
		if (renderer)
			mandelbulbParams.changeValue(renderer.device, val, 0);
	})

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
			<div class="fixed top-0 left-1/3">
				<ShaderSelection onClickAny={onChangeShader}/>
			</div>
		</div>
		<Sidebar/>
	</main>
</div>

<style>
</style>
