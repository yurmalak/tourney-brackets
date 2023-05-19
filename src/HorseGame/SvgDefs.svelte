<!-- Holder for defs to be referenced elsewhere -->

<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;opacitty:0;">
	<defs>
		<filter id="drop-shadow"><feDropShadow dx="0.3" dy="0.3" stdDeviation="0.2" /></filter>
		<path
			id="star"
			stroke-width="1"
			d="M 0,-10 L 2.35,-3.24 L 9.51,-3.09 L 3.8,1.24 L 5.88,8.09 L 0,4 L -5.88,8.09 L -3.8,1.24 L -9.51,-3.09 L -2.35,-3.24 Z"
		/>
		<g id="clock">
			<circle cx="50" cy="50" r="45" stroke-width="6" stroke="black" fill="white" />
			<circle
				cx="50"
				cy="50"
				r="36"
				stroke-width="6"
				stroke="black"
				fill="white"
				stroke-dasharray="4 14.8"
				stroke-dashoffset="2"
			/>
			<circle cx="50" cy="50" r="3" stroke-width="0" fill="black" />
			<line x1="50" y1="50" x2="50" y2="15" stroke-width="5" stroke="black" />
			<line x1="50" y1="50" x2="28" y2="38" stroke-width="5" stroke="black" />
		</g>
	</defs>
</svg>

<style>
	svg {
		position: absolute !important;
		opacity: 0 !important;
		width: 0 !important;
		height: 0 !important;
	}
</style>
