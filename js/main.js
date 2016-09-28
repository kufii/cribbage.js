(function() {
	'use strict';

	var cribbage;

	var save = function() {
		var pegs = [];
		for (var i = 0; i < 3; i++) {
			pegs.push(cribbage.getPegPositions(i));
		}
		localStorage.setItem('pegs', JSON.stringify(pegs));
	};

	var load = function() {
		var data = localStorage.getItem('pegs');
		if (data) {
			return JSON.parse(data);
		}
	};

	var clearData = function() {
		localStorage.removeItem('pegs');
	};

	cribbage = Cribbage({
		canvas: document.querySelector('#cribbage'),
		onmove: function() {
			save();
		},
		onwin: function(player) {
			alert('Player ' + (player + 1) + ' wins!');
			cribbage.disable();
			cribbage.setTheme({
				background: cribbage.getPegColor(player)
			});
			clearData();
		}
	});

	document.querySelector('#reset').onclick = function(e) {
		cribbage.enable();
		cribbage.setTheme();
		cribbage.reset();
		clearData();
	};

	var data = load();
	if (data) {
		for (var i = 0; i < data.length; i++) {
			cribbage.move(i, data[i].old);
			cribbage.move(i, data[i].current);
		}
	}
})();
