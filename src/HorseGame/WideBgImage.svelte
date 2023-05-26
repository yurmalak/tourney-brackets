<svelte:options immutable />

<script>
	import { onMount } from 'svelte';

	/**
	 * @type {(width: number) => string }
	 * @returns url to an image with specified width
	 */
	export let getImgSrc;

	/** Pass reference to <img> to component's parent */
	export let imgRef;

	/** @type { width: number, height: number, widths: number[] } */
	export let imgStats;

	const { width, height, widths } = imgStats;
	const aRatio = width / height;

	// combine widths and src to form srcset
	const srcset = widths.reduce((prev, w) => prev + getImgSrc(w) + ` ${w}w, `, '').slice(0, -2); // drop comma

	// restrict image width if screen is too wide to fit whole image by height
	let style;
	function handleAspectRatio() {
		const { innerWidth, innerHeight } = window;
		if (innerWidth < 1000) return (style = null);

		const currentRatio = innerWidth / innerHeight;
		if (currentRatio < aRatio) style = null;
		else style = `max-width: ${(100 / currentRatio) * aRatio}vw`;
	}

	onMount(() => handleAspectRatio());
</script>

<svelte:window on:resize={handleAspectRatio} />

<image-wrapper {style}>
	<img
		bind:this={imgRef}
		src={getImgSrc(1920)}
		{srcset}
		{width}
		{height}
		alt=""
		aria-hidden="true"
		draggable="false"
	/>
	<slot />
</image-wrapper>

<style>
	image-wrapper {
		/* allow position nodes absolutely over the image */
		position: relative;
		display: block;
		margin: 0 auto;
	}
	img {
		object-fit: cover;
		user-select: none;
		display: block;
		width: 100%;
		height: auto;
	}

	/* make parent container scroll horizontally on smaller screens */
	@media (max-width: 1000px) {
		image-wrapper,
		img {
			width: 1200px;
		}
	}
</style>
