<script>
	/** @type {HTMLElement} */
	export let root;

	/** @type {HTMLElement} */
	export let anchor;

	/** @type {number} */
	export let width;

	/** @type {(element: HTMLElement) => void} */
	export let setRef = null;

	/** @type {string} */
	export let style = null;

	/** @type {HTMLElement} */
	let container;

	// styles
	let top, left, transX, transY, opacity;
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
			transX = '0';
		}
		// left
		else if (anchorRect.left - width - 10 > 0) {
			left = ((anchorRect.left - rootRect.left) / rootRect.width) * 100 + '%';
			transX = '-100%';
		}
		// center
		else {
			left = ((innerWidth / 2 - rootRect.left - 2) / rootRect.width) * 100 + '%';
			transX = '-50%';
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
			transY = '-50%';
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

		// stick to window's bottom
		if (currentBottom > innerHeight) {
			transY = `calc(-50% - ${currentBottom - innerHeight}px)`;
			return;
		}

		// stick to window's top (or root's parent if it's lower)
		const parentRect = root.parentNode.getBoundingClientRect();
		const boundary = Math.max(0, parentRect.top);
		if (currentTop < boundary) {
			transY = `calc(-50% + ${boundary - currentTop}px)`;
		}
	}

	/** @param {HTMLElement} el */
	function setup(el) {
		container = el;
		placeModal(root, anchor);
		container.focus();

		// pass container to parent component
		if (setRef) setRef(container);
	}

	/**
	 * @param {HTMLElement} root
	 * @param {HTMLElement} anchor
	 */
	function placeModal(root, anchor) {
		const anchorRect = anchor.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();
		adjustHorizontally(anchorRect, rootRect);
		adjustVertically(anchorRect, rootRect);

		if (container) {
			anchor.parentNode.insertBefore(container, anchor.nextElementSibling);
		}
	}
</script>

<dialog
	use:setup
	open={true}
	{style}
	style:opacity
	style:top
	style:left
	style:width="{width}px"
	style:transform="translate({transX},{transY})"
	{...$$restProps}
>
	<slot />
</dialog>

<style>
	dialog {
		position: absolute;
		max-width: 94vw;
		max-height: 60vh;
		overflow: auto;
		z-index: 999;
		padding: 0;
		margin: 0;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	dialog:focus {
		outline: none;
	}
</style>
