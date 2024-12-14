<script lang="ts">
    import gsap from "gsap";
    let scoops = $state(1);
    let { onClickAny } = $props();

    //rework this this is shit
    function onClick(data) {
        gsap.delayedCall(0.05,()=>{
            onClickAny({data: scoops})
        })
    }
</script>

<div class="flex">
    {#each [0, 1] as number}
        <label>
            <input
                type="radio"
                name="scoops"
                value={number}
                bind:group={scoops}
                onclick={onClick}
            />

            {number}
        </label>
    {/each}

</div>