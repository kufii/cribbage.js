(() => {
	'use strict';

	let cribbage;

	let save = function() {
		let pegs = [];
		for (let i = 0; i < 3; i++) {
			pegs.push(cribbage.getPegPositions(i));
		}
		localStorage.setItem('pegs', JSON.stringify(pegs));
	};

	let load = function() {
		let data = localStorage.getItem('pegs');
		if (data) {
			return JSON.parse(data);
		}
	};

	let clearData = function() {
		localStorage.removeItem('pegs');
	};

	cribbage = Cribbage({
		canvas: document.querySelector('#cribbage'),
		onmove() {
			save();
		},
		onwin(player) {
			alert(`Player ${player + 1} wins!`);
			cribbage.disable();
			cribbage.updateTheme({
				background: cribbage.getTheme(`player${player + 1}`)
			});
			clearData();
		}
	});

	document.querySelector('#reset').onclick = () => {
		cribbage.enable();
		cribbage.setTheme();
		cribbage.reset();
		clearData();
	};

	let data = load();
	if (data) {
		for (let i = 0; i < data.length; i++) {
			cribbage.move(i, data[i].old);
			cribbage.move(i, data[i].current);
		}
	}
})();
