<script>
    import globals from "../core/globals";
    let dimensions = 1;
    $: {
        handleOnChange({target:{value:dimensions}});
    }

	function handleOnChange(event) {
        dimensions = Number(event.target.value)
        globals.eventEmitter.emit("sliderchange", dimensions);
		//save value to firestore	
	}
</script>

<div class="relative h-full w-full">
    <div class="fixed top-0 right-0 h-full w-96 text-white">
        <div class="fixed z-0 w-full h-full bg-gray-800 shadow-2xl bg-green-200/50 backdrop-blur-2xl"></div>
        <div class="fixed w-96 h-full flex flex-col z-10 items-center ">
            <div class="flex flex-col items-center  w-80 ">
                <label for="dimension" class="text-xl font-semibold text-gray-700 py-4">Dimension</label>
              
                <input 
                  type="range" 
                  id="dimension" 
                  name="dimensions" 
                  min="1" 
                  max="10" 
                  step="0.05" 
                  bind:value={dimensions} 
                  on:change={handleOnChange} 
                  class="w-full h-3 slider bg-gradient-to-r from-green-400  to-purple-600 rounded-full appearance-none cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-60"
                />
              
                <div class="w-full flex justify-between text-sm text-gray-600 mt-2">
                  <span>1</span>
                  <span>10</span>
                </div>
              
                <label class="text-2xl font-bold text-gray-900 -mt-4" for="dimension">{dimensions}</label>
            </div>
        </div>
    </div>
</div>

<style>
    .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%; 
    background: #CB4C4F;
    cursor: pointer;
    }

</style>
