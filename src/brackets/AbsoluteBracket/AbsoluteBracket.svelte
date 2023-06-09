<script>
	import WideBgImage from './WideBgImage.svelte';
	import AbsoluteNode from './AbsoluteNode.svelte';

	/** @type {(width:number) => string}*/
	export let getImgSrc;

	/** @type {{ width: number, height: number, widths: number[] }}*/
	export let imgStats;

	/** @type {{ width: string, height: string, coordinates: [number,number][][] }}*/
	export let anchorsData;

	/** @type {import("../../types").Series[][]} */
	export let processedSeries;

	// components
	export let NodeContent;
	export let Card;

	/*	
		Card stuff
	*/

	/** @type {HTMLElement}*/
	let imgRef;

	/** @type {HTMLElement}*/
	let cardRef;

	/** @type {{ round: number, sIndex: number, node: HTMLElement } | null} */
	let cardData = null;

	/** @type {boolean} */
	let locked = false;

	const nodeClass = 'bracket-node';
	const setRef = (ref) => (cardRef = ref);

	/*
		Display card on hover
		Display and lock (don't hide on unhover) on click
		Hide on Escape
	*/

	/**
	 * Toggle modal {@link Card}.
	 * @param {Event} ev
	 */
	function clickHandler(ev) {
		// ignore clicks inside opened card
		if (cardRef?.contains(ev.target)) {
			return;
		}

		const node = ev.target.closest('.' + nodeClass);

		// treat disabled nodes same as background image - close current
		if (!node || node.disabled) {
			cardData = null;
			locked = false;
			return;
		}

		// clicked node of currently opened series
		// lock if not locked, close if already locked
		const round = Number(node.dataset.round);
		const sIndex = Number(node.dataset.sIndex);
		if (round === cardData?.round && sIndex === cardData?.sIndex) {
			if (locked) cardData = null;
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

		const node = ev.target.closest('.' + nodeClass);
		if (!node || node.disabled) {
			cardData = null;
		} else if (cardData?.node !== node) {
			cardData = { ...node.dataset, node };
		}
	}

	/** @param {Event} ev */
	function keyHandler(ev) {
		switch (ev.code) {
			case 'Escape':
				if (cardData?.node) cardData.node.focus();
				cardData = null;
				locked = false;
				break;
		}
	}
</script>

<svelte:body on:click={clickHandler} on:keydown={keyHandler} on:mouseover={mouseOverHandler} />

<main style:overflow={cardData ? 'hidden' : 'auto'}>
	<WideBgImage {imgStats} {getImgSrc} bind:imgRef>
		{#each processedSeries as roundSeries, round}
			{#each roundSeries as series, index}
				{#if series.players}
					{@const id = `node-${round}-${index}`}
					<AbsoluteNode
						{anchorsData}
						{round}
						{index}
						labelledby={id}
						className={nodeClass}
						disabled={!series.players.every(Boolean)}
						expanded={cardData?.sIndex === index && cardData.round === round}
					>
						<svelte:component this={NodeContent} {series} {id} />
					</AbsoluteNode>
				{/if}
			{/each}
		{/each}
		{#if cardData}
			<svelte:component
				this={Card}
				series={processedSeries[cardData.round][cardData.sIndex]}
				root={imgRef}
				anchor={cardData.node}
				width={360}
				{setRef}
			/>
		{/if}
	</WideBgImage>
</main>
