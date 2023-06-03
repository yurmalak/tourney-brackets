<script>
	import WideBgImage from './WideBgImage.svelte';
	import AbsoluteNode from './AbsoluteNode.svelte';
	import Modal from './Modal.svelte';

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
	export let CardContent;

	// related to Card
	let cardData, imgRef, cardRef;
	let locked = false,
		hoverBlocked = false;
	const nodeClass = 'bracket-node';

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

		const node = ev.target.closest('.' + nodeClass);

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

		const node = ev.target.closest('.' + nodeClass);
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
					{@const id = `node-${round}-${index}`}
					<AbsoluteNode
						{anchorsData}
						{round}
						{index}
						labelledby={id}
						className={nodeClass}
						disabled={!series.players.every(Boolean)}
					>
						<svelte:component this={NodeContent} {series} {id} />
					</AbsoluteNode>
				{/if}
			{/each}
		{/each}
		{#if cardData}
			<Modal bind:ref={cardRef} root={imgRef} anchor={cardData.node} width={360}>
				<svelte:component
					this={CardContent}
					series={processedSeries[cardData.round][cardData.sIndex]}
				/>
			</Modal>
		{/if}
	</WideBgImage>
</main>

<style>
	main {
		overflow: auto;
	}
</style>
