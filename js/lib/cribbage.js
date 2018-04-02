(() => {
	'use strict';

	window.Cribbage = function({ canvas, width, height, theme = {}, onmoving, onmove, onwin }) {
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			if (!canvas.width || !canvas.height) {
				throw new Error('You must specify the width and height');
			}
		}

		const ctx = canvas.getContext('2d');

		const defaultTheme = {
			background: 'white',
			player1: '#09D209',
			player2: '#0066FF',
			player3: '#EC2304',
			track1: '#646464',
			track2: '#464646',
			track3: '#282828',
			hole: 'lightgray',
			fontSize: 13,
			fontFamily: 'Arial, Helvetica, sans serif',
			fontColor: 'black',
			holePadding: 8,
			pegPadding: 6,
			boardPadding: 8,
			drawTooltips: true
		};

		let dimen = {};
		let coords = {
			player1: [],
			player2: [],
			player3: []
		};
		let pegs = {};

		let enabled = true;

		const calculateDimensions = function() {
			dimen.padding = theme.fontSize + theme.boardPadding;
			let height = canvas.height - (dimen.padding * 4);
			let curveWidth = (height / 3) + (dimen.padding / 2) + (height / 2) + dimen.padding;
			let width = canvas.width - curveWidth - ((dimen.padding * 2));
			dimen.section = {
				width: Math.floor(width / 36 * 5),
				height: Math.floor(height / 3)
			};
			dimen.spaceWidth = dimen.section.width / 5;
			dimen.trackWidth = dimen.section.height / 3;
			let maxRadius = Math.min(dimen.spaceWidth, dimen.trackWidth) / 2;
			dimen.holeRadius = Math.max(0, maxRadius - theme.holePadding);
			dimen.pegRadius = Math.max(0, maxRadius - theme.pegPadding);

			// important coordinates
			dimen.coords = {};
			dimen.coords.start = {
				x: dimen.padding + dimen.section.height + (dimen.padding / 2) - (dimen.spaceWidth * 3),
				y: dimen.padding,
				width: dimen.spaceWidth * 2
			};
			dimen.coords.leftCurve = {
				x: dimen.coords.start.x + dimen.coords.start.width + dimen.spaceWidth,
				y: (dimen.padding * 2) + (dimen.padding / 2) + (dimen.section.height * 2),
				radius: dimen.section.height + (dimen.padding / 2) - (dimen.trackWidth / 2)
			};
			dimen.coords.firstStraight = {
				x: dimen.padding + dimen.coords.leftCurve.radius + (dimen.trackWidth / 2),
				y: dimen.padding,
				width: (dimen.section.width * 7) + dimen.spaceWidth
			};
			dimen.coords.secondStraight = {
				x: dimen.coords.firstStraight.x,
				y: dimen.coords.firstStraight.y + (dimen.padding * 2) + (dimen.section.height * 2),
				width: dimen.coords.firstStraight.width
			};
			dimen.coords.thirdStraight = {
				x: dimen.coords.firstStraight.x,
				y: dimen.coords.firstStraight.y + dimen.padding + dimen.section.height,
				width: dimen.coords.firstStraight.width - dimen.spaceWidth
			};
			dimen.coords.rightCurve = {
				x: dimen.coords.firstStraight.x + dimen.coords.firstStraight.width,
				y: dimen.coords.thirdStraight.y + (dimen.section.height / 2),
				radius: dimen.section.height + (dimen.section.height / 2) + dimen.padding - (dimen.trackWidth / 2)
			};
		};

		const calculateCoords = function() {
			const clearCoords = function() {
				for (let player in coords) {
					coords[player] = [];
				}
			};
			const addStart = function() {
				for (let player = 0; player < 3; player++) {
					for (let i = 0; i < 2; i++) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.start.x + (dimen.spaceWidth * i) + (dimen.spaceWidth / 2),
							y: dimen.coords.start.y + (dimen.trackWidth * player) + (dimen.trackWidth / 2)
						});
					}
				}
			};
			const addFirstStraight = function() {
				for (let player = 0; player < 3; player++) {
					for (let i = 0; i < 36; i++) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.firstStraight.x + (dimen.spaceWidth * i) + (dimen.spaceWidth / 2),
							y: dimen.coords.firstStraight.y + (dimen.trackWidth * player) + (dimen.trackWidth / 2)
						});
					}
				}
			};
			const addRightCurve = function() {
				let points = 8;
				let step = Math.PI * 2 / (points * 2);
				for (let player = 0; player < 3; player++) {
					let radius = dimen.coords.rightCurve.radius;
					let current = (step * points) - (step / 2);
					for (let i = 0; i < points; i++) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.rightCurve.x + (Math.sin(current) * (radius - (dimen.trackWidth * player))),
							y: dimen.coords.rightCurve.y + (Math.cos(current) * (radius - (dimen.trackWidth * player)))
						});
						current -= step;
					}
				}
			};
			const addSecondStraight = function() {
				for (let player = 0; player < 3; player++) {
					for (let i = 35; i >= 0; i--) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.secondStraight.x + (dimen.spaceWidth * i) + (dimen.spaceWidth / 2),
							y: dimen.coords.secondStraight.y + (dimen.trackWidth * (2 - player)) + (dimen.trackWidth / 2)
						});
					}
				}
			};
			const addLeftCurve = function() {
				let points = 5;
				let step = Math.PI * 2 / (points * 2);
				for (let player = 0; player < 3; player++) {
					let radius = dimen.coords.leftCurve.radius;
					let current = -step / 2;
					for (let i = 0; i < points; i++) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.leftCurve.x + (Math.sin(current) * (radius - (dimen.trackWidth * player))),
							y: dimen.coords.leftCurve.y + (Math.cos(current) * (radius - (dimen.trackWidth * player)))
						});
						current -= step;
					}
				}
			};
			const addThirdStraight = function() {
				for (let player = 0; player < 3; player++) {
					for (let i = 0; i < 36; i++) {
						coords[`player${player + 1}`].push({
							x: dimen.coords.thirdStraight.x + (dimen.spaceWidth * i) + (dimen.spaceWidth / 2),
							y: dimen.coords.thirdStraight.y + (dimen.trackWidth * player) + (dimen.trackWidth / 2)
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

		const draw = function() {
			const drawBackground = function() {
				ctx.fillStyle = theme.background;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			};

			const drawTrack = function() {
				const drawStraightTracks = function() {
					for (let section = 0; section < 3; section++) {
						for (let track = 0; track < 3; track++) {
							let x = dimen.coords.firstStraight.x;
							let y = dimen.padding + (dimen.padding * section) + (dimen.section.height * section) + (dimen.trackWidth * track);
							if (section === 2) {
								ctx.fillStyle = theme[`track${3 - track}`];
							} else {
								ctx.fillStyle = theme[`track${track + 1}`];
							}
							let width = dimen.coords.thirdStraight.width;
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
				const drawCurvedTracks = function() {
					const drawCurve = function(x, y, radius, counterClockwise) {
						for (let track = 0; track < 3; track++) {
							ctx.beginPath();
							ctx.arc(x, y, radius - (dimen.trackWidth * track), Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
							ctx.lineWidth = dimen.trackWidth;
							ctx.strokeStyle = theme[`track${track + 1}`];
							ctx.stroke();
							// close gap
							if (track !== 2) {
								ctx.beginPath();
								ctx.arc(x, y, radius - (dimen.trackWidth * track) - (dimen.trackWidth / 2), Math.PI * 1.5, Math.PI * 0.5, counterClockwise);
								ctx.lineWidth = 1;
								ctx.stroke();
							}
						}
					};
					const drawRightCurve = function() {
						drawCurve(dimen.coords.rightCurve.x, dimen.coords.rightCurve.y, dimen.coords.rightCurve.radius);
					};
					const drawLeftCurve = function() {
						drawCurve(dimen.coords.leftCurve.x, dimen.coords.leftCurve.y, dimen.coords.leftCurve.radius, true);
					};
					drawRightCurve();
					drawLeftCurve();
				};
				const drawStart = function() {
					for (let track = 0; track < 3; track++) {
						let x = dimen.coords.start.x;
						let y = dimen.coords.start.y + (dimen.trackWidth * track);
						ctx.fillStyle = theme[`track${track + 1}`];
						let width = dimen.coords.start.width;
						ctx.fillRect(x, y, width, track === 2 ? dimen.trackWidth : dimen.trackWidth + 1);
					}
				};
				const drawSeperators = function() {
					ctx.lineWidth = 1;
					ctx.strokeStyle = theme.background;
					const drawVertical = function() {
						for (let i = 0; i < 8; i++) {
							let x = dimen.coords.firstStraight.x + (dimen.section.width * i);
							ctx.beginPath();
							ctx.moveTo(x, i === 0 ? dimen.coords.thirdStraight.y : 0);
							if (i === 7) {
								ctx.lineTo(x, dimen.coords.firstStraight.y + dimen.section.height);
								ctx.moveTo(x, dimen.coords.secondStraight.y);
							}
							ctx.lineTo(x, canvas.height);
							ctx.stroke();
						}
					};
					const drawHorizontal = function() {
						let x = dimen.coords.rightCurve.x;
						let y = dimen.coords.rightCurve.y;
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(canvas.width, y);
						ctx.stroke();
					};
					drawVertical();
					drawHorizontal();
				};
				const drawMarkers = function() {
					ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
					ctx.fillStyle = theme.fontColor;
					ctx.textAlign = 'center';
					ctx.textBaseline='middle';
					const offset = (theme.fontSize / 2) + (theme.boardPadding / 2);
					const drawFirstRow = function() {
						for (let i = 1; i < 8; i++) {
							let x = dimen.coords.firstStraight.x + (dimen.section.width * i);
							let y = dimen.coords.firstStraight.y - offset;
							ctx.fillText(5 * i, x, y);
						}
					};
					const drawCurve = function() {
						let x = dimen.coords.rightCurve.x + dimen.coords.rightCurve.radius + (dimen.trackWidth / 2) + offset;
						let y = dimen.coords.rightCurve.y;
						ctx.save();
						ctx.rotate(Math.PI / 2);
						ctx.fillText('40', y, -x);
						ctx.restore();
					};
					const drawSecondRow = function() {
						for (let i = 0; i < 8; i++) {
							let x = dimen.coords.secondStraight.x + (dimen.section.width * (7 - i));
							let y = dimen.coords.secondStraight.y + dimen.section.height + offset;
							ctx.fillText(45 + (5 * i), x, y);
						}
					};
					const drawThirdRow = function() {
						for (let i = 0; i < 8; i++) {
							let x = dimen.coords.thirdStraight.x + (dimen.section.width * i);
							let y = dimen.coords.thirdStraight.y - offset;
							ctx.fillText(85 + (5 * i), x, y);
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

			const drawHoles = function() {
				for (let player in coords) {
					coords[player].forEach(coord => {
						ctx.beginPath();
						ctx.fillStyle = theme.hole;
						ctx.arc(coord.x, coord.y, dimen.holeRadius, 0, 360);
						ctx.fill();
					});
				}
			};

			const drawPegs = function() {
				for (let player in pegs) {
					for (let peg in pegs[player]) {
						let coord = coords[player][pegs[player][peg]];
						ctx.beginPath();
						ctx.fillStyle = theme[player];
						ctx.arc(coord.x, coord.y, dimen.pegRadius, 0, 360);
						ctx.fill();
					}
				}
			};

			drawBackground();
			drawTrack();
			drawHoles();
			drawPegs();
		};

		const getDistance = function(x, y, coord) {
			let xdiff = Math.pow(Math.abs(coord.x - x), 2);
			let ydiff = Math.pow(Math.abs(coord.y - y), 2);
			return Math.sqrt(xdiff + ydiff);
		};

		const move = function(player, position) {
			let p = pegs[`player${player + 1}`];
			if (p.old === position || p.new === position) return;
			if (onmoving) {
				// allow the move to be cancelled by an onmoving event handler
				if (onmoving(player, p.current, position)) return;
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
			if (onmove) {
				onmove(player, p.old, p.current);
			}
			if (onwin && position === 122) {
				onwin(player);
			}
		};

		const getPegPositions = function(player) {
			return pegs[`player${player + 1}`];
		};

		const getHole = function(x, y) {
			let hole;
			for (let player = 0; player < 3; player++) {
				if (coords[`player${player + 1}`].some((coord, index) => {
					if (getDistance(x, y, coord) <= Math.max(dimen.holeRadius, dimen.pegRadius)) {
						hole = {
							player,
							position: index
						};
						return true;
					}
				})) break;
			}
			return hole;
		};

		const handleClick = function(x, y) {
			let hole = getHole(x, y);
			if (hole) {
				move(hole.player, hole.position);
			}
		};

		const reset = function(nodraw) {
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
			if (!nodraw) draw();
		};

		const disable = function() {
			enabled = false;
		};

		const enable = function() {
			enabled = true;
		};

		const updateTheme = function(obj = {}) {
			theme = Object.assign(theme, obj);
			calculateDimensions();
			calculateCoords();
			draw();
		};

		const setTheme = function(obj) {
			theme = defaultTheme;
			updateTheme(obj);
		};

		const getTheme = function(property) {
			return property ? theme[property] : theme;
		};

		const getScore = function(player) {
			let p = pegs[`player${player + 1}`];
			return Math.max(0, p.current - 1);
		};

		const init = function() {
			reset(true);
			setTheme(theme);
		};
		init();

		canvas.onclick = function(e) {
			if (enabled) {
				let bounds = canvas.getBoundingClientRect();
				handleClick(e.clientX - bounds.left, e.clientY - bounds.top);
			}
		};

		canvas.onmousemove = function(e) {
			let bounds = canvas.getBoundingClientRect();
			let hole = getHole(e.clientX - bounds.left, e.clientY - bounds.top);
			if (hole) {
				if (theme.drawTooltips) {
					let points = hole.position - 1 - getScore(hole.player);
					if (points > 0) {
						canvas.title = `+${points}`;
					}
				}
				canvas.style.cursor = 'pointer';
			} else {
				canvas.title = '';
				canvas.style.cursor = 'auto';
			}
		};

		return {
			canvas,
			disable,
			enable,
			move,
			getPegPositions,
			setTheme,
			updateTheme,
			getTheme,
			getScore,
			reset
		};
	};
})();
