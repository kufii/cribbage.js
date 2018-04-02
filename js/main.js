(() => {
	'use strict';

	const save = function() {
		let pegs = [];
		for (let i = 0; i < 3; i++) {
			pegs.push(cribbage.getPegPositions(i));
		}
		localStorage.setItem('pegs', JSON.stringify(pegs));
	};

	const load = function() {
		let data = localStorage.getItem('pegs');
		if (data) {
			return JSON.parse(data);
		}
	};

	const clearData = function() {
		localStorage.removeItem('pegs');
	};

	const cribbage = Cribbage({
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

	let pegs = load();
	if (pegs) {
		pegs.forEach((peg, index) => {
			cribbage.move(index, peg.old);
			cribbage.move(index, peg.current);
		});
	}
})();
