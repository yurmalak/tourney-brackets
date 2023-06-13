<!-- Holder for defs to be referenced elsewhere -->

<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;opacitty:0;">
	<defs>
		<filter id="text-shadow"><feDropShadow dx="0.3" dy="0.3" stdDeviation="0.2" /></filter>
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
		<symbol id="medal" viewBox="0 0 20.6 30">
			<circle cx="10" cy="9.9" r="4.8" fill="#f3ec17" />
			<path
				d="m13 0-3.05 2.07-3.25-1.87-1.28 3.45-3.74 0.473 0.975 3.55-2.76 2.56 2.86 2.36-0.709 3.74 3.74 0.168 1.58 3.45 3.05-2.07 3.25 1.87 1.28-3.45 3.74-0.473-0.975-3.55 2.76-2.56-2.86-2.36 0.709-3.74-3.74-0.168zm-2.86 3.84a6.11 6.11 0 0 1 0.975 0.068 6.11 6.11 0 0 1 5.12 7 6.11 6.11 0 0 1-6.9 5.12 6.11 6.11 0 0 1-5.12-7 6.11 6.11 0 0 1 5.71-5.22 6.11 6.11 0 0 1 0.197-0.0068z"
				fill="gold"
				stroke="black"
				stroke-width="0.3"
			/>
			<path
				d="m 4.9 18.6 v11.8 l5.22-3.45 5.22 3.45 v-11.8 l-1.28 3.35-3.55-1.87-3.35 2.27-1.68-3.74z"
				fill="#7c487e"
			/>
		</symbol>
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
