(function() {
	'use strict';

	var cribbage = Cribbage({
		canvas: document.querySelector('#cribbage'),
		onwin: function(player) {
			alert('Player ' + (player + 1) + ' wins!');
			cribbage.disable();
			cribbage.setTheme({
				background: cribbage.getPegColor(player)
			});
		}
	});

	document.querySelector('#reset').onclick = function(e) {
		cribbage.enable();
		cribbage.setTheme();
		cribbage.reset();
	};
})();
