function $(id) {
    return document.getElementById(id);
}

var clsStopwatch = function() {
	var startAt = 0;	// Time of last start / resume. (0 if not running)
	var	lapTime	= 0;	// Time on the clock when last stopped in milliseconds

	var now = function() {
		return (new Date()).getTime();
	}

	// Public methods
	// Start or resume
	this.start = function() {
			startAt	= startAt ? startAt : now();
		};

	// Stop or pause
	this.stop = function() {
			// If running, update elapsed time otherwise keep it
			lapTime	= startAt ? lapTime + now() - startAt : lapTime;
			startAt	= 0; // Paused
		};

	// Reset
	this.reset = function() {
			lapTime = startAt = 0;
		};

	// Duration
	this.time = function() {
			return lapTime + (startAt ? now() - startAt : 0); 
		};
}

var stopwatch = new clsStopwatch();

function pad(num, size) {
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) {
	var h = m = s = ms = 0;
	var newTime = '';

	h = Math.floor( time / (60 * 60 * 1000) );
	time = time % (60 * 60 * 1000);
	m = Math.floor( time / (60 * 1000) );
	time = time % (60 * 1000);
	s = Math.floor( time / 1000 );
	ms = time % 1000;

	newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ':' + pad(ms, 3);
	return newTime;
}

displayTime = function () {
	$('text-time').innerHTML = formatTime(stopwatch.time());
}

// Used to check the time every second 
var myVar = setInterval(displayTime,1000);

startTime = function () {
	stopwatch.start();

	//Update the time display immediately
	displayTime();
}

stopTime = function () {
	stopwatch.stop();

	//Update the time display immediately
	displayTime();
}

$('btn-start').addEventListener('click', startTime);
$('btn-stop').addEventListener('click', stopTime);

