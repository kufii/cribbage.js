# cribbage.js
A Cribbage board library written in JS.

[Check out the example project here](https://kufii.github.io/cribbage.js/)!

## Usage
Link the script and add a canvas to the HTML

```
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cribbage</title>
	<script src="js/lib/cribbage.js"></script>
</head>
<body>
	<canvas id="cribbage" width="1500" height="500"></canvas>
</body>
</html>
```

In your JS, call the Cribbage function passing the canvas

```
var cribbage = Cribbage({
	canvas: document.querySelector('#cribbage');
});
```
