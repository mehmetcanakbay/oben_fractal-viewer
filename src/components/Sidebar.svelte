<script>
    import globals from "../core/globals";
    let dimensions = 1;
    
	function handleOnChange(event) {
        dimensions = Number(event.target.value)
        globals.eventEmitter.emit("sliderchange", dimensions);
		//save value to firestore	
	}
</script>

<div class="relative h-full w-full">
    <div class="fixed top-0 right-0 h-full w-96 text-white">
        <div class="fixed z-0 w-full h-full bg-gray-800 shadow-2xl bg-green-200/50 backdrop-blur-2xl"></div>
        <div class="fixed w-full h-full flex flex-col z-10">
            <div>
                <input type="range" id="volume" name="volume" min="1" max="10" on:change={handleOnChange}/>
                <label for="volume">Volume</label>
            </div>
        </div>
    </div>
</div>

