(function() {
	'use strict';

	window.Cribbage = function(cfg) {
		var canvas = cfg.canvas;
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = cfg.width;
			canvas.height = cfg.height;
			if (!canvas.width || !canvas.height) {
				throw 'You must specify the width and height';
			}
		}

		var ctx = canvas.getContext('2d');

		if (!cfg.theme) cfg.theme = {};
		var theme = {
			background: cfg.theme.background || 'white',
			player1: cfg.theme.player1 || 'green',
			player2: cfg.theme.player2 || 'blue',
			player3: cfg.theme.player3 || 'red',
			track1: cfg.theme.track3 || '#646464',
			track2: cfg.theme.track2 || '#464646',
			track3: cfg.theme.track3 || '#282828',
			hole: cfg.theme.hole || 'lightgray',
			fontSize: cfg.theme.fontSize || 13,
			pegPadding: cfg.theme.pegPadding || 4
		};

		var dimen = {};
		var coords = {
			player1: [],
			player2: [],
			player3: []
		};

		var calculateDimensions = function() {
			dimen.padding = theme.fontSize;
			dimen.section = {
				width: Math.floor((canvas.width - (dimen.padding * 2)) / 10),
				height: Math.floor((canvas.height - (dimen.padding * 4)) / 3)
			};
			dimen.spaceWidth = dimen.section.width / 5;
			dimen.trackWidth = dimen.section.height / 3;
			dimen.pegRadius = Math.min(dimen.spaceWidth, dimen.trackWidth) / 2 - theme.pegPadding;
		};

		var calculateCoords = function() {
			var clearCoords = function() {
				for (var i = 1; i <= 3; i++) {
					coords['player' + i] = [];
				}
			};
			var addStart = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 0; i < 2; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.padding + dimen.spaceWidth * 2 + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.padding + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addFirstStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 0; i < 36; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.padding + dimen.section.width + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.padding + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addRightCurve = function() {
				var start = {
					x: dimen.padding + dimen.section.width * 8 + dimen.spaceWidth - 1,
					y: dimen.padding + dimen.trackWidth / 2
				};
				var end = {
					x: start.x,
					y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
				};
				var points = 8;
				var step = Math.PI * 2 / (points * 2);
				for (var player = 0; player < 3; player++) {
					var radius = (end.y - start.y) / 2;
					var current = step * points - step / 2;
					for (var i = 0; i < points; i++) {
						coords['player' + (player + 1)].push({
							x: start.x + Math.sin(current) * (radius - dimen.trackWidth * player),
							y: start.y + radius + Math.cos(current) * (radius - dimen.trackWidth * player)
						});
						current -= step;
					}
				}
			};
			var addSecondStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 35; i >= 0; i--) {
						coords['player' + (player + 1)].push({
							x: dimen.padding + dimen.section.width + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.padding * 3 + dimen.section.height * 2 + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addLeftCurve = function() {
				var start = {
					x: dimen.padding + dimen.section.width + 2,
					y: dimen.padding * 2 + dimen.section.height + dimen.trackWidth / 2
				};
				var end = {
					x: start.x,
					y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
				};
				var points = 5;
				var step = Math.PI * 2 / (points * 2);
				for (var player = 0; player < 3; player++) {
					var radius = (end.y - start.y) / 2;
					var current = -step / 2;
					for (var i = 0; i < points; i++) {
						coords['player' + (player + 1)].push({
							x: start.x + Math.sin(current) * (radius - dimen.trackWidth * player),
							y: start.y + radius + Math.cos(current) * (radius - dimen.trackWidth * player)
						});
						current -= step;
					}
				}
			};
			var addThirdStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 0; i < 35; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.padding + dimen.section.width + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.padding * 2 + dimen.section.height + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addWin = function() {
				for (var player = 0; player < 3; player++) {
					coords['player' + (player + 1)].push({
						x: dimen.padding + dimen.section.width * 8 + dimen.spaceWidth / 2,
						y: dimen.padding * 2 + dimen.section.height + dimen.section.height / 2
					});
				}
			};
			clearCoords();
			addStart();
			addFirstStraight();
			addRightCurve();
			addSecondStraight();
			addLeftCurve();
			addThirdStraight();
			addWin();
		};

		var drawBackground = function() {
			ctx.fillStyle = theme.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		var drawTrack = function() {
			var drawStraightTracks = function() {
				for(var section = 0; section < 3; section++) {
					for (var track = 0; track < 3; track++) {
						var x = dimen.padding + dimen.section.width;
						var y = dimen.padding + (dimen.padding * section) + (dimen.section.height * section) + (dimen.trackWidth * track);
						if (section === 2) {
							ctx.fillStyle = theme['track' + (3 - track)];
						} else {
							ctx.fillStyle = theme['track' + (track + 1)];
						}
						var width = dimen.section.width * 7;
						if (section !== 1) {
							width += dimen.spaceWidth;
						}
						ctx.fillRect(x, y, width, dimen.trackWidth);
					}
				}
			};
			var drawCurvedTracks = function() {
				var drawRightCurve = function() {
					var start = {
						x: dimen.padding + dimen.section.width * 8 + dimen.spaceWidth - 1,
						y: dimen.padding + dimen.trackWidth / 2
					};
					var end = {
						x: start.x,
						y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
					};
					for (var track = 0; track < 3; track++) {
						var radius = (end.y - start.y) / 2;
						ctx.beginPath();
						ctx.arc(start.x, start.y + radius, radius - (dimen.trackWidth * track),  4.7, Math.PI * 0.5);
						ctx.lineWidth = dimen.trackWidth;
						ctx.strokeStyle = theme['track' + (track + 1)];
						ctx.stroke();
					}
				};
				var drawLeftCurve = function() {
					var start = {
						x: dimen.padding + dimen.section.width + 2,
						y: dimen.padding * 2 + dimen.section.height + dimen.trackWidth / 2
					};
					var end = {
						x: start.x,
						y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
					};
					for (var track = 0; track < 3; track++) {
						var radius = (end.y - start.y) / 2;
						ctx.beginPath();
						ctx.arc(start.x, start.y + radius, radius - (dimen.trackWidth * track),  4.7, Math.PI * 0.5, true);
						ctx.lineWidth = dimen.trackWidth;
						ctx.strokeStyle = theme['track' + (track + 1)];
						ctx.stroke();
					}
				};
				drawRightCurve();
				drawLeftCurve();
			};
			var drawStart = function() {
				for (var track = 0; track < 3; track++) {
					var x = dimen.padding + dimen.spaceWidth * 2;
					var y = dimen.padding + (dimen.trackWidth * track);
					ctx.fillStyle = theme['track' + (track + 1)];
					var width = dimen.spaceWidth * 2;
					ctx.fillRect(x, y, width, dimen.trackWidth);
				}
			};
			var drawSeperators = function() {
				var drawVertical = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.padding + dimen.section.width + dimen.section.width * i;
						ctx.beginPath();
						ctx.moveTo(x, 0);
						ctx.lineTo(x, canvas.height);
						ctx.lineWidth = 1;
						ctx.strokeStyle = theme.background;
						ctx.stroke();
					}
				};
				var drawHorizontal = function() {
					var x = dimen.padding + dimen.section.width * 8;
					var y = dimen.padding * 2 + dimen.section.height + dimen.section.height / 2;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(canvas.width, y);
					ctx.lineWidth = 1;
					ctx.strokeStyle = theme.background;
					ctx.stroke();
				};
				drawVertical();
				drawHorizontal();
			};
			drawStraightTracks();
			drawCurvedTracks();
			drawStart();
			drawSeperators();
		};

		var drawHoles = function() {
			for (var player = 1; player <= 3; player++) {
				coords['player' + player].forEach(function(coord) {
					ctx.beginPath();
					ctx.fillStyle = theme.hole;
					ctx.arc(coord.x, coord.y, dimen.pegRadius, 0, 360);
					ctx.fill();
				});
			}
		};

		var draw = function() {
			drawBackground();
			drawTrack();
			drawHoles();
		};

		var init = function() {
			calculateDimensions();
			calculateCoords();
			draw();
		};
		init();

		return {
			canvas: canvas
		};
	};
})();
