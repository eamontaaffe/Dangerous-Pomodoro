var POMODORO_LENGTH = 25*60*1000; // In millis
var QUICK_BREAK_LENGTH = 5*60*1000; // In millis
var LONG_BREAK_LENGTH = 30*60*1000; // In millis

function $(id) {
    return document.getElementById(id);
}

function pad(num, size) {
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) {
	var h = m = s = ms = 0;
	var newTime = '';

	// Check if the time is negative
	var isNegative = time < 0;

	// Always format numbers as if they were positive and then
	// we can add the sign at the end
	time = Math.abs(time);

	h = Math.round( time / (60 * 60 * 1000) );
	time = time % (60 * 60 * 1000);
	m = Math.round( time / (60 * 1000) );
	time = time % (60 * 1000);
	s = Math.round( time / 1000 );

	newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);

	newTime = isNegative ? "-" + newTime : newTime;

	return newTime;
}

var clsTimer = function() {
	var MULTIPLIER = 60; // Used to speed up the time for testing

	var duration = 0;
	var startAt = 0;	// Time of last start / resume. (0 if not running)
	var	lapTime	= 0;	// Time on the clock when last stopped in milliseconds

	var now = function() {
		return (new Date()).getTime();
	}

	this.setDuration = function(dur) {
		duration = dur/MULTIPLIER;
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

	// GetTime
	this.time = function() {
		var time = lapTime + (startAt ? now() - startAt : 0);
		return duration - time; 
	};

	// Is the timer running?
	this.isRunning = function() {
		return startAt;
	}

	// Has the duration elapsed?
	this.isLapsed = function() {
		return this.time() < 0;
	}
}

checkTime = function () {
	displayTime();
	displayStatus();
}

startTime = function () {

	timer.start();

	//Update the time display immediately
	checkTime();
}

stopTime = function () {
	timer.stop();

	timer.reset();
	timer.setDuration(POMODORO_LENGTH);

	//Update the time display immediately
	checkTime();
}

startBreak = function() {
	timer.stop();

	timer.reset();
	timer.setDuration(QUICK_BREAK_LENGTH);

	timer.start();

	//Update the time display immediately
	checkTime();
}

displayTime = function() {
	$('text-time').innerHTML = formatTime(timer.time());
}

displayStatus = function () {
	var status = "";
	var btnText = "";
	var btn = $('btn-start-stop');

	var btnClone = btn.cloneNode(true);
	btn.parentNode.replaceChild(btnClone,btn);

	btn = btnClone;

	if (timer.isLapsed()) {
		console.log("lapsed");
		status = "Take a break";
		btnText = "Start break";
		btn.addEventListener('click',startBreak);
	} else if (timer.isRunning()) {
		console.log("running");
		status = "Work now";
		btnText = "Stop";
		btn.addEventListener('click',stopTime);
	} else {
		console.log("waiting")
		status = "Ready to go?";
		btnText = "Start";
		btn.addEventListener('click',startTime);
	}

	$('text-status').innerHTML = status;
	$('btn-start-stop').innerHTML = btnText;
}


var timer = new clsTimer();

// Get ready for first pomodoro by prepping the timer
timer.setDuration(25*60*1000);

// Used to check the time every second 
var myVar = setInterval(checkTime,1000);

// Start up by displaying the time immediately
checkTime();

