<script>
	export let root;
	export let anchor;
	export let width;
	export let style = null;
	export let ref = null;

	let top, left, transform, container, opacity;
	$: placeModal(root, anchor);

	/**
	 * Place priority (relative to anchor) - right then left.
	 * If nothing fits places modal in the middle of the screen.
	 * @param anchorRect
	 * @param rootRect
	 */
	function adjustHorizontally(anchorRect, rootRect) {
		// right
		if (anchorRect.right + width + 10 < window.innerWidth) {
			left = ((anchorRect.right - rootRect.left) / rootRect.width) * 100 + '%';
		}
		// left
		else if (anchorRect.left - width - 10 > 0) {
			const n = ((anchorRect.left - rootRect.left - 8) / rootRect.width) * 100;
			left = `calc(${n}% - ${width}px)`;
		}
		// center
		else {
			const n = ((innerWidth / 2 - rootRect.left - 2) / rootRect.width) * 100;
			left = `calc(${n}% - ${width / 2}px)`;
		}
	}

	/**
	 * Center at the level of `anchor`. Adjust up/down if doesn't fit.
	 * @param {DOMRect} anchorRect
	 * @param {DOMRect} rootRect
	 */
	function adjustVertically(anchorRect, rootRect) {
		const { innerHeight } = window;

		// place in the middle and make transparent to measure it
		if (!container) {
			top = (innerHeight / 2 - rootRect.top) / rootRect.height;
			transform = 'translateY(-50%)';
			opacity = 0;
			return;
		}
		opacity = 1;

		// place at level of the node
		const center = anchorRect.top + anchorRect.height / 2;
		top = ((center - rootRect.top) / rootRect.height) * 100 + '%';

		const height = container.offsetHeight;
		const currentTop = center - height / 2;
		const currentBottom = center + height / 2;

		if (currentBottom > innerHeight) {
			transform = `translateY(calc(-50% - ${currentBottom - innerHeight + 20}px))`;
		} else if (currentTop < 0) {
			transform = `translateY(calc(-50% + ${-1 * currentTop + 10}px))`;
		} else {
			transform = 'translateY(-50%)';
		}
	}

	/** @param {HTMLElement} el */
	function setupObserver(el) {
		container = el;

		const observer = new IntersectionObserver(() => placeModal(root, anchor), { threshold: 1 });
		observer.observe(el);

		return { destroy: () => observer.disconnect() };
	}

	function placeModal(root, anchor) {
		const anchorRect = anchor.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();
		adjustHorizontally(anchorRect, rootRect);
		adjustVertically(anchorRect, rootRect);
	}
</script>

<div {style} bind:this={ref} style:top style:left style:transform style:opacity use:setupObserver>
	<slot />
</div>

<style>
	div {
		position: absolute;
		display: block;
		width: 360px;
		min-height: 200px;
		max-height: min(80vh, 80%);
		top: 0;
		left: 50%;
		overflow: auto;
		z-index: 999;

		background-color: white;
		border: 2px solid gray;
		box-shadow: 1px 1px 3px gray;
	}
</style>
