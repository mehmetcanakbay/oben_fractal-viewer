<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { Renderer } from '../core/renderer';
	import mandelFrag from "../core/shaders/mandelbox/mandelbox.frag.wgsl?raw"
	
	let canvas : HTMLCanvasElement;

	onMount(()=>{
		const renderer = new Renderer("mainCanvas", mandelFrag);

		const resizeCanvas = ()=> {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();
	})

</script>

<div class="app">
	<main>
		<div id="app">
			<canvas width="1200" height="1000" id="mainCanvas" bind:this={canvas}></canvas>
		</div>
		<slot />
	</main>

	<!-- <footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer> -->
</div>

<style>
</style>
