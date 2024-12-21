<script lang="ts">
    export let name : string
    export let number : number;
    export let min : string;
    export let max : string;
    export let step : string;

</script>

<label for="dimension" class="text-xl font-semibold text-oben-tertiary py-4">{name}</label>

<input 
    type="range" 
    id="dimension" 
    name="dimensions" 
    min={min} 
    max={max} 
    step={step}
    bind:value={number} 
    class="w-full h-3 slider bg-gradient-to-r from-oben-special  to-oben-special2 rounded-full appearance-none cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-60"
/>

<div class="w-full flex justify-between text-sm text-gray-600 mt-2">
    <span>{min}</span>
    <span>{max}</span>
</div>

<label class="text-2xl font-bold text-oben-special -mt-2" for="dimension">{number}</label>
