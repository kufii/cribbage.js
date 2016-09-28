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
		var theme = {};
		var dimen = {};
		var coords = {
			player1: [],
			player2: [],
			player3: []
		};
		var pegs = {};

		var enabled = true;

		var calculateDimensions = function() {
			dimen.padding = theme.fontSize + theme.boardPadding;
			dimen.section = {
				width: Math.floor((canvas.width - (dimen.padding * 2)) / 10),
				height: Math.floor((canvas.height - (dimen.padding * 4)) / 3)
			};
			dimen.spaceWidth = dimen.section.width / 5;
			dimen.trackWidth = dimen.section.height / 3;
			dimen.holeRadius = Math.min(dimen.spaceWidth, dimen.trackWidth) / 2 - theme.holePadding;
			dimen.pegRadius = Math.min(dimen.spaceWidth, dimen.trackWidth) / 2 - theme.pegPadding;
		};

		var calculateCoords = function() {
			var clearCoords = function() {
				for (var player in coords) {
					coords[player] = [];
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
							y: dimen.padding * 3 + dimen.section.height * 2 + dimen.trackWidth * (2 - player) + dimen.trackWidth / 2
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
					for (var i = 0; i < 36; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.padding + dimen.section.width + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.padding * 2 + dimen.section.height + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			clearCoords();
			addStart();
			addFirstStraight();
			addRightCurve();
			addSecondStraight();
			addLeftCurve();
			addThirdStraight();
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
						ctx.fillRect(x, y, width, track === 2 ? dimen.trackWidth : dimen.trackWidth + 1);
					}
				}
			};
			var drawCurvedTracks = function() {
				var drawCurve = function(start, end, counterClockwise) {
					for (var track = 0; track < 3; track++) {
						var radius = (end.y - start.y) / 2;
						ctx.beginPath();
						ctx.arc(start.x, start.y + radius, radius - (dimen.trackWidth * track),  Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
						ctx.lineWidth = dimen.trackWidth;
						ctx.strokeStyle = theme['track' + (track + 1)];
						ctx.stroke();
						// close gap
						if (track !== 2) {
							ctx.beginPath();
							ctx.arc(start.x, start.y + radius, radius - (dimen.trackWidth * track) - dimen.trackWidth / 2,  Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
							ctx.lineWidth = 1;
							ctx.stroke();
						}
					}
				};
				var drawRightCurve = function() {
					var start = {
						x: dimen.padding + dimen.section.width * 8 + dimen.spaceWidth - 1,
						y: dimen.padding + dimen.trackWidth / 2
					};
					var end = {
						x: start.x,
						y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
					};
					drawCurve(start, end);
				};
				var drawLeftCurve = function() {
					var start = {
						x: dimen.padding + dimen.section.width + 1,
						y: dimen.padding * 2 + dimen.section.height + dimen.trackWidth / 2
					};
					var end = {
						x: start.x,
						y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
					};
					drawCurve(start, end, true);
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
					ctx.fillRect(x, y, width, track === 2 ? dimen.trackWidth : dimen.trackWidth + 1);
				}
			};
			var drawSeperators = function() {
				ctx.lineWidth = 1;
				ctx.strokeStyle = theme.background;
				var drawVertical = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.padding + dimen.section.width + dimen.section.width * i;
						ctx.beginPath();
						ctx.moveTo(x, 0);
						ctx.lineTo(x, canvas.height);
						ctx.stroke();
					}
				};
				var drawHorizontal = function() {
					var x = dimen.padding + dimen.section.width * 8;
					var y = dimen.padding * 2 + dimen.section.height + dimen.section.height / 2;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(canvas.width, y);
					ctx.stroke();
				};
				drawVertical();
				drawHorizontal();
			};
			var drawMarkers = function() {
				ctx.font = theme.fontSize + 'px ' + theme.fontFamily;
				ctx.fillStyle = theme.fontColor;
				ctx.textAlign = 'center';
				ctx.textBaseline='middle';
				var offset = theme.fontSize / 2 + theme.boardPadding / 2;
				var drawFirstRow = function() {
					for (var i = 1; i < 8; i++) {
						var x = dimen.padding + dimen.section.width + dimen.section.width * i;
						var y = dimen.padding - offset;
						ctx.fillText(5 * i, x, y);
					}
				};
				var drawCurve = function() {
					var start = {
						x: dimen.padding + dimen.section.width * 8 + dimen.spaceWidth - 1,
						y: dimen.padding + dimen.trackWidth / 2
					};
					var end = {
						x: start.x,
						y: dimen.padding * 3 + dimen.section.height * 3 - dimen.trackWidth / 2
					};
					var radius = (end.y - start.y) / 2;
					var x = start.x + radius + dimen.trackWidth / 2 + offset;
					var y = start.y + radius;
					ctx.save();
					ctx.rotate(Math.PI / 2);
					ctx.fillText('40', y, -x);
					ctx.restore();
				};
				var drawSecondRow = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.padding + dimen.section.width + dimen.section.width * (7 - i);
						var y = dimen.padding * 3 + dimen.section.height * 3 + offset;
						ctx.fillText(45 + 5 * i, x, y);
					}
				};
				var drawThirdRow = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.padding + dimen.section.width + dimen.section.width * i;
						var y = dimen.padding * 2 + dimen.section.height - offset;
						ctx.fillText(85 + 5 * i, x, y);
					}
				};
				drawFirstRow();
				drawCurve();
				drawSecondRow();
				drawThirdRow();
			};
			drawStraightTracks();
			drawCurvedTracks();
			drawStart();
			drawSeperators();
			drawMarkers();
		};

		var drawHoles = function() {
			for (var player in coords) {
				coords[player].forEach(function(coord) {
					ctx.beginPath();
					ctx.fillStyle = theme.hole;
					ctx.arc(coord.x, coord.y, dimen.holeRadius, 0, 360);
					ctx.fill();
				});
			}
		};

		var drawPegs = function() {
			for (var player in pegs) {
				for (var peg in pegs[player]) {
					var coord = coords[player][pegs[player][peg]];
					ctx.beginPath();
					ctx.fillStyle = theme[player];
					ctx.arc(coord.x, coord.y, dimen.pegRadius, 0, 360);
					ctx.fill();
				}
			}
		};

		var draw = function() {
			drawBackground();
			drawTrack();
			drawHoles();
			drawPegs();
		};

		var getDistance = function(x, y, coord) {
			var xdiff = Math.pow(Math.abs(coord.x - x),2);
			var ydiff = Math.pow(Math.abs(coord.y - y),2);
			return Math.sqrt(xdiff + ydiff);
		};

		var move = function(player, position) {
			var p = pegs['player' + (player + 1)];
			if (p.old === position || p.new === position) return;
			if (cfg.onmoving) {
				// allow the move to be cancelled by an onmoving event handler
				if (cfg.onmoving(player, p.current, position)) return;
			}
			if (position > p.current) {
				p.old = p.current;
				p.current = position;
			} else if (position > p.old) {
				p.current = position;
			} else {
				p.current = p.old;
				p.old = position;
			}
			draw();
			if (cfg.onmove) {
				cfg.onmove(player, p.old, p.current);
			}
			if (cfg.onwin && position === 122) {
				cfg.onwin(player);
			}
		};

		var getPegPositions = function(player) {
			var p = pegs['player' + (player + 1)];
			return {
				old: p.old,
				current: p.current
			};
		};

		var getHole = function(x, y) {
			var hole;
			for (var player = 0; player < 3; player++) {
				if (coords['player' + (player + 1)].some(function(coord, index) {
					if (getDistance(x, y, coord) <= dimen.holeRadius) {
						hole = {
							player: player,
							position: index
						};
						return true;
					}
				})) break;
			}
			return hole;
		};

		var handleClick = function(x, y) {
			var hole = getHole(x, y);
			if (hole) {
				move(hole.player, hole.position);
			}
		};

		var reset = function(nodraw) {
			pegs = {
				player1: {
					old: 0,
					current: 1
				},
				player2: {
					old: 0,
					current: 1
				},
				player3: {
					old: 0,
					current: 1
				}
			};
			if (!nodraw) {
				draw();
			}
		};

		var disable = function() {
			enabled = false;
		};

		var enable = function() {
			enabled = true;
		};

		var setTheme = function(obj) {
			if (!obj) obj = {};
			theme = {
				background: obj.background || 'white',
				player1: obj.player1 || 'green',
				player2: obj.player2 || 'blue',
				player3: obj.player3 || 'red',
				track1: obj.track3 || '#646464',
				track2: obj.track2 || '#464646',
				track3: obj.track3 || '#282828',
				hole: obj.hole || 'lightgray',
				fontSize: obj.fontSize || 13,
				fontFamily: obj.fontFamily || 'Arial, Helvetica, sans serif',
				fontColor: obj.fontColor || 'black',
				holePadding: obj.holePadding || 8,
				pegPadding: obj.pegPadding || 6,
				boardPadding: obj.boardPadding || 8
			};
			calculateDimensions();
			calculateCoords();
			draw();
		};

		var getPegColor = function(player) {
			return theme['player' + (player + 1)];
		};

		var getScore = function(player) {
			var p = pegs['player' + (player + 1)];
			return Math.max(0, p.current - 1);
		};

		var init = function() {
			reset(true);
			setTheme(cfg.theme);
		};
		init();

		canvas.onclick = function(e) {
			if (enabled) {
				var bounds = canvas.getBoundingClientRect();
				handleClick(e.clientX - bounds.left, e.clientY - bounds.top);
			}
		};

		canvas.onmousemove = function(e) {
			var bounds = canvas.getBoundingClientRect();
			if (getHole(e.clientX - bounds.left, e.clientY - bounds.top)) {
				canvas.style.cursor = 'pointer';
			} else {
				canvas.style.cursor = 'auto';
			}
		};

		return {
			canvas: canvas,
			disable: disable,
			enable: enable,
			move: move,
			getPegPositions: getPegPositions,
			getPegColor: getPegColor,
			setTheme: setTheme,
			getScore: getScore,
			reset: reset
		};
	};
})();
