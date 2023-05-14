<script>
	export let data;
	data;
</script>

<editor-game>
	<slot name="score-switcher" style="grid-column: 2;" />
	<slot name="delete-game" class="delete-game-button" text="&#10006;" />
</editor-game>

<style>
	editor-game {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		padding: var(--space-m);
		gap: var(--space-l);
		padding: var(--space-m);
	}

	.delete-game-button {
		grid-column: 3;
		justify-self: end;
		border: none;
		background: none;
		padding: 0 var(--space-l);
		font-size: 1.3rem;
		color: var(--color-bg-dark);
		cursor: pointer;
	}

	.delete-game-button:active:active {
		color: hsl(0, 65%, 72%);
	}

	@media (hover: hover) {
		.delete-game-button:hover {
			color: hsl(0, 75%, 42%);
		}
	}
</style>
