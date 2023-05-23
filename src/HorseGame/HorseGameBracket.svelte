<script>
	import WideBgImage from './WideBgImage.svelte';
	import Modal from '../components/Modal.svelte';
	import AbsoluteNode from './AbsoluteNode.svelte';
	import Card from './Card.svelte';

	/** @type {{ processedSeries: FrontSeries[][], width: number, height: number }} */
	export let data;
	const { processedSeries, width, height } = data;

	/** @param {number} width */
	const getImgSrc = (width) =>
		`https://ik.imagekit.io/dobdk1ymwif/tourney_brackets/horse_game_bracket_${width}.png`;
	const imgStats = { width: 1920, height: 1080, widths: [1400, 1980, 3920] };

	// related to Card
	let cardData, imgRef, cardRef;
	let locked = false,
		hoverBlocked = false;
	const nodeClassName = 'bracket-node';

	/**
	 * Toggle modal {@link Card}.
	 * @param {Event} ev
	 */
	function clickHandler(ev) {
		// disable/enable displaying Card on hover
		if (ev.ctrlKey) {
			hoverBlocked = !hoverBlocked;
			return;
		}

		// ignore clicks inside opened card
		if (cardRef?.contains(ev.target)) {
			return;
		}

		const node = ev.target.closest('.' + nodeClassName);

		/** @type {{ round: string, sIndex: string }}*/
		const { round, sIndex } = node?.dataset || {};

		// treat disabled nodes same as image itself - close current
		if (!node || node.disabled) {
			cardData = null;
			locked = false;
			return;
		}

		// clicked node of currently opened series - toggle lock
		if (round == cardData?.round && sIndex == cardData?.sIndex) {
			locked = !locked;
			return;
		}

		locked = true;
		cardData = { round, sIndex, node };
	}

	/**
	 * Show {@link Card} on hover.
	 * @param {Event} ev
	 */
	function mouseOverHandler(ev) {
		// clicks take priority over hover
		if (locked) return;

		// keep open on hovering over the Card
		if (cardRef?.contains(ev.target)) return;

		const node = ev.target.closest('.' + nodeClassName);
		if (!node || node.disabled) {
			cardData = null;
		} else if (!hoverBlocked && cardData?.node !== node) {
			cardData = { ...node.dataset, node };
		}
	}

	/** @param {Event} ev */
	function keyHandler(ev) {
		switch (ev.code) {
			case 'Escape':
				cardData = null;
				locked = false;
				break;
		}
	}
</script>

<svelte:body on:click={clickHandler} on:keydown={keyHandler} on:mouseover={mouseOverHandler} />

<main>
	<WideBgImage {imgStats} {getImgSrc} bind:imgRef>
		{#each processedSeries as roundSeries, round}
			{#each roundSeries as series, index}
				{#if series.players}
					<AbsoluteNode {round} {index} {series} {width} {height} className={nodeClassName} />
				{/if}
			{/each}
		{/each}
		{#if cardData}
			<Modal
				bind:ref={cardRef}
				root={imgRef}
				anchor={cardData.node}
				width={360}
				style="
					border: 4px solid #624627;
					box-shadow: 0px 0px 2px 1px black;
					display: flex;
					"
			>
				<Card series={processedSeries[cardData.round][cardData.sIndex]} />
			</Modal>
		{/if}
	</WideBgImage>
</main>

<svelte:head>
	<style>
		body {
			height: 100vh;
			background: linear-gradient(360deg, hsl(47 40% 5% / 1), hsl(0deg 0% 0% / 34%)),
				linear-gradient(217deg, hsl(30 100% 9% / 1), hsl(71 46% 9% / 1));
		}
		main {
			overflow: auto;
			height: 100vh;
		}
	</style>
</svelte:head>
