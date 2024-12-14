<script lang="ts">
    let { onClickAny } = $props();

    const buttons = [0, 1, 2];
  
    let selectedButton = $state(1);

    const buttonNames = ["Mandelbox", "Mandelbulb", "Basic"]
    
  
    function handleClick(buttonId: any) {
        selectedButton = buttonId; 
        onClickAny({data: selectedButton})
    }

    // handleClick(0);
</script>
  
<div class="flex space-x-4 p-4">
    {#each buttons as buttonId}
        <button
            onclick={() => handleClick(buttonId)}
            class="py-2 px-4 bg-none 
            {selectedButton === buttonId ? ' font-extrabold' : 'font-normal'}
            text-white text-2xl leading-none tracking-tight w-48"
        >
            {buttonNames[buttonId]}
        </button>

        <p class="py-2 px-4 bg-none text-2xl text-white">|</p>
    {/each}
</div>
