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

		var defaultTheme = {
			background: 'white',
			player1: 'green',
			player2: 'blue',
			player3: 'red',
			track1: '#646464',
			track2: '#464646',
			track3: '#282828',
			hole: 'lightgray',
			fontSize: 13,
			fontFamily: 'Arial, Helvetica, sans serif',
			fontColor: 'black',
			holePadding: 8,
			pegPadding: 6,
			boardPadding: 8
		};
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
			var height = canvas.height - (dimen.padding * 4);
			var curveWidth = (height / 3) + (dimen.padding / 2) + (height / 2) + dimen.padding;
			var width = canvas.width - curveWidth - dimen.padding * 2;
			dimen.section = {
				width: Math.floor(width / 36 * 5),
				height: Math.floor(height / 3)
			};
			dimen.spaceWidth = dimen.section.width / 5;
			dimen.trackWidth = dimen.section.height / 3;
			var maxRadius = Math.min(dimen.spaceWidth, dimen.trackWidth) / 2;
			dimen.holeRadius = Math.max(0, maxRadius - theme.holePadding);
			dimen.pegRadius = Math.max(0, maxRadius - theme.pegPadding);

			// important coordinates
			dimen.coords = {};
			dimen.coords.start = {
				x: dimen.padding + dimen.section.height + dimen.padding / 2 - dimen.spaceWidth * 3,
				y: dimen.padding,
				width: dimen.spaceWidth * 2
			};
			dimen.coords.leftCurve = {
				x: dimen.coords.start.x + dimen.coords.start.width + dimen.spaceWidth,
				y: dimen.padding * 2 + dimen.padding / 2 + dimen.section.height * 2,
				radius: dimen.section.height + dimen.padding / 2 - dimen.trackWidth / 2
			};
			dimen.coords.firstStraight = {
				x: dimen.padding + dimen.coords.leftCurve.radius + dimen.trackWidth / 2,
				y: dimen.padding,
				width: dimen.section.width * 7 + dimen.spaceWidth
			};
			dimen.coords.secondStraight = {
				x: dimen.coords.firstStraight.x,
				y: dimen.coords.firstStraight.y + dimen.padding * 2 + dimen.section.height * 2,
				width: dimen.coords.firstStraight.width
			};
			dimen.coords.thirdStraight = {
				x: dimen.coords.firstStraight.x,
				y: dimen.coords.firstStraight.y + dimen.padding + dimen.section.height,
				width: dimen.coords.firstStraight.width - dimen.spaceWidth
			};
			dimen.coords.rightCurve = {
				x: dimen.coords.firstStraight.x + dimen.coords.firstStraight.width,
				y: dimen.coords.thirdStraight.y + dimen.section.height / 2,
				radius: dimen.section.height + dimen.section.height / 2 + dimen.padding - dimen.trackWidth / 2
			};

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
							x: dimen.coords.start.x + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.coords.start.y + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addFirstStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 0; i < 36; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.coords.firstStraight.x + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.coords.firstStraight.y + dimen.trackWidth * player + dimen.trackWidth / 2
						});
					}
				}
			};
			var addRightCurve = function() {
				var points = 8;
				var step = Math.PI * 2 / (points * 2);
				for (var player = 0; player < 3; player++) {
					var radius = dimen.coords.rightCurve.radius;
					var current = step * points - step / 2;
					for (var i = 0; i < points; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.coords.rightCurve.x + Math.sin(current) * (radius - dimen.trackWidth * player),
							y: dimen.coords.rightCurve.y + Math.cos(current) * (radius - dimen.trackWidth * player)
						});
						current -= step;
					}
				}
			};
			var addSecondStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 35; i >= 0; i--) {
						coords['player' + (player + 1)].push({
							x: dimen.coords.secondStraight.x + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.coords.secondStraight.y + dimen.trackWidth * (2 - player) + dimen.trackWidth / 2
						});
					}
				}
			};
			var addLeftCurve = function() {
				var points = 5;
				var step = Math.PI * 2 / (points * 2);
				for (var player = 0; player < 3; player++) {
					var radius = dimen.coords.leftCurve.radius;
					var current = -step / 2;
					for (var i = 0; i < points; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.coords.leftCurve.x + Math.sin(current) * (radius - dimen.trackWidth * player),
							y: dimen.coords.leftCurve.y + Math.cos(current) * (radius - dimen.trackWidth * player)
						});
						current -= step;
					}
				}
			};
			var addThirdStraight = function() {
				for (var player = 0; player < 3; player++) {
					for (var i = 0; i < 36; i++) {
						coords['player' + (player + 1)].push({
							x: dimen.coords.thirdStraight.x + dimen.spaceWidth * i + dimen.spaceWidth / 2,
							y: dimen.coords.thirdStraight.y + dimen.trackWidth * player + dimen.trackWidth / 2
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
						var x = dimen.coords.firstStraight.x;
						var y = dimen.padding + (dimen.padding * section) + (dimen.section.height * section) + (dimen.trackWidth * track);
						if (section === 2) {
							ctx.fillStyle = theme['track' + (3 - track)];
						} else {
							ctx.fillStyle = theme['track' + (track + 1)];
						}
						var width = dimen.coords.thirdStraight.width;
						if (section !== 1) {
							width += dimen.spaceWidth;
						}

						// fill gaps;
						if (section === 0) {
							width += 1;
						} else if (section === 1) {
							width += 1;
							x -= 1;
						} else if (section === 2) {
							width += 2;
							x -= 1;
						}

						ctx.fillRect(x, y, width, track === 2 ? dimen.trackWidth : dimen.trackWidth + 1);
					}
				}
			};
			var drawCurvedTracks = function() {
				var drawCurve = function(x, y, radius, counterClockwise) {
					for (var track = 0; track < 3; track++) {
						ctx.beginPath();
						ctx.arc(x, y, radius - (dimen.trackWidth * track),  Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
						ctx.lineWidth = dimen.trackWidth;
						ctx.strokeStyle = theme['track' + (track + 1)];
						ctx.stroke();
						// close gap
						if (track !== 2) {
							ctx.beginPath();
							ctx.arc(x, y, radius - (dimen.trackWidth * track) - dimen.trackWidth / 2,  Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
							ctx.lineWidth = 1;
							ctx.stroke();
						}
					}
				};
				var drawRightCurve = function() {
					drawCurve(dimen.coords.rightCurve.x, dimen.coords.rightCurve.y, dimen.coords.rightCurve.radius);
				};
				var drawLeftCurve = function() {
					drawCurve(dimen.coords.leftCurve.x, dimen.coords.leftCurve.y, dimen.coords.leftCurve.radius, true);
				};
				drawRightCurve();
				drawLeftCurve();
			};
			var drawStart = function() {
				for (var track = 0; track < 3; track++) {
					var x = dimen.coords.start.x;
					var y = dimen.coords.start.y + dimen.trackWidth * track;
					ctx.fillStyle = theme['track' + (track + 1)];
					var width = dimen.coords.start.width;
					ctx.fillRect(x, y, width, track === 2 ? dimen.trackWidth : dimen.trackWidth + 1);
				}
			};
			var drawSeperators = function() {
				ctx.lineWidth = 1;
				ctx.strokeStyle = theme.background;
				var drawVertical = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.coords.firstStraight.x + dimen.section.width * i;
						ctx.beginPath();
						ctx.moveTo(x, i === 0 ? dimen.coords.thirdStraight.y : 0);
						if (i == 7) {
							ctx.lineTo(x, dimen.coords.firstStraight.y + dimen.section.height);
							ctx.moveTo(x, dimen.coords.secondStraight.y);
						}
						ctx.lineTo(x, canvas.height);
						ctx.stroke();
					}
				};
				var drawHorizontal = function() {
					var x = dimen.coords.rightCurve.x;
					var y = dimen.coords.rightCurve.y;
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
						var x = dimen.coords.firstStraight.x + dimen.section.width * i;
						var y = dimen.coords.firstStraight.y - offset;
						ctx.fillText(5 * i, x, y);
					}
				};
				var drawCurve = function() {
					var x = dimen.coords.rightCurve.x + dimen.coords.rightCurve.radius + dimen.trackWidth / 2 + offset;
					var y = dimen.coords.rightCurve.y;
					ctx.save();
					ctx.rotate(Math.PI / 2);
					ctx.fillText('40', y, -x);
					ctx.restore();
				};
				var drawSecondRow = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.coords.secondStraight.x + dimen.section.width * (7 - i);
						var y = dimen.coords.secondStraight.y + dimen.section.height + offset;
						ctx.fillText(45 + 5 * i, x, y);
					}
				};
				var drawThirdRow = function() {
					for (var i = 0; i < 8; i++) {
						var x = dimen.coords.thirdStraight.x + dimen.section.width * i;
						var y = dimen.coords.thirdStraight.y - offset;
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
					if (getDistance(x, y, coord) <= Math.max(dimen.holeRadius, dimen.pegRadius)) {
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
			theme = {};
			for (var property in defaultTheme) {
				theme[property] = (typeof obj[property] !== 'undefined') ? obj[property] : defaultTheme[property];
			}
			calculateDimensions();
			calculateCoords();
			draw();
		};

		var updateTheme = function(obj) {
			if (!obj) obj = {};
			for (var property in obj) {
				if (typeof defaultTheme[property] !== 'undefined') {
					theme[property] = obj[property];
				}
			}
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
			updateTheme: updateTheme,
			getScore: getScore,
			reset: reset
		};
	};
})();
