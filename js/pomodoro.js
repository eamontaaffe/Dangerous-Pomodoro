/*****************************************
**************** TIMER *******************
*****************************************/

var clsTimer = function() {
	var MULTIPLIER = 1; // Used to speed up the time for testing

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
	this.getTime = function() {
		var time = lapTime + (startAt ? now() - startAt : 0);
		return duration - time; 
	};

	// Is the timer running?
	this.isRunning = function() {
		return startAt;
	}

	// Has the duration elapsed?
	this.isLapsed = function() {
		return this.getTime() < 0;
	}
}

/*****************************************
*************** POMODORO *****************
*****************************************/

var clsPomodoroStateMachine = function() {
	var POMODORO_LENGTH = 25*60*1000; // In millis
	var QUICK_BREAK_LENGTH = 5*60*1000; // In millis
	var LONG_BREAK_LENGTH = 30*60*1000; // In millis

	/**** STATE TYPES ****/
	// The initial state before the session has begun
	var STATE_INIT = 0; 
	// Currently in a pomodoro
	var STATE_POMODORO = 1;
	// Currently in a break
	var STATE_BREAK = 2;

	var stateType = STATE_INIT;
	var pomodoroCount = 0;

	var timer = new clsTimer();

	function getStateText() {
		switch (stateType) {
			case STATE_POMODORO:
				return "Work now";
			case STATE_BREAK:
				var isLongBreak = pomodoroCount > 0 && pomodoroCount % 4 == 0;
				return !isLongBreak ? "Quick break" : "Long break";
			default:
				return "Click Start";
		}
	}

	// Have we passed the allocated time?
	function isLapsed() {
		return timer.getTime() < 0;
	}

	function getInputText() {
		switch (stateType) {
			case STATE_POMODORO:
				return !isLapsed() ? "Stop" : "Finish Pomodoro";
			case STATE_BREAK:
				return !isLapsed() ? "Skip" : "Start Working";
			default:
				return "Start";
		}
	}

	startPomodoro = function() {
		console.log("startPomodoro");
		stateType = STATE_POMODORO;
		timer.reset();
		timer.setDuration(POMODORO_LENGTH);
		timer.start();
	}

	stopPomodoro = function() {
		console.log("stopPomodoro");
		stateType = STATE_INIT;
		timer.stop();
		timer.reset();
		timer.setDuration(POMODORO_LENGTH);
	}

	startBreak = function() {
		console.log("startBreak");
		stateType = STATE_BREAK;
		// If you are starting a break it means you have just finished a pomodoro
		pomodoroCount ++;

		// Is it a long break?
		var isLongBreak = ( pomodoroCount > 0 ) && ( pomodoroCount % 4 == 0 );
		timer.reset();
		timer.setDuration(isLongBreak ? LONG_BREAK_LENGTH : QUICK_BREAK_LENGTH );
		timer.start();
	}

	skipBreak = function() {
		console.log("skipBreak");
		stateType = STATE_POMODORO;
		return startPomodoro();
	}

	function getRequiredInput() {
		switch (stateType) {
			case STATE_POMODORO:
				return !isLapsed() ? stopPomodoro : startBreak;
			case STATE_BREAK:
				return skipBreak;
			default:
				return startPomodoro;
		}
	}

	// This returns the current state of the PSM
	this.getState = function() {
		return new state(stateType, timer.getTime(), pomodoroCount,
			getStateText(),getRequiredInput(),getInputText());
	}

	state = function(stateType, timeElapsed, pomodoroCnt,stateText, requiredInput,inputText) {
		this.stateType = stateType;
		this.timeElapsed = timeElapsed;
		this.pomodoroCnt = pomodoroCnt;
		this.stateText = stateText;
		this.requiredInput = requiredInput;
		this.inputText = inputText;
	}
}

/*****************************************
**************** DISPLAY *****************
*****************************************/

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

	h = Math.floor( time / (60 * 60 * 1000) );
	time = time % (60 * 60 * 1000);
	m = Math.floor( time / (60 * 1000) );
	time = time % (60 * 1000);
	s = Math.floor( time / 1000 );

	newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);

	newTime = isNegative ? "-" + newTime : newTime;

	return newTime;
}

function replaceClickListener(btn,fcn) {
	var btnClone = btn.cloneNode(true);
	btn.parentNode.replaceChild(btnClone,btn);

	btn = btnClone;

	btn.addEventListener('click',fcn);
}

/*****************************************
**************** GLOBAL ******************
*****************************************/

var lastState = null;

displayState = function() {
	var state = pomodoroStateMachine.getState();
	console.log(state);

	$('text-time').innerHTML = formatTime(state.timeElapsed);

	$('text-state').innerHTML = state.stateText;

	$('text-status').innerHTML = "Count: " + state.pomodoroCnt;

	$('btn-input').innerHTML = state.inputText;

	// Only change the input button if something other than
	// time has changed
	state.timeElapsed = "";
	if (!(JSON.stringify(state) === JSON.stringify(lastState))) {
		var btn = $('btn-input');
		var btnClone = btn.cloneNode(true);
		btn.parentNode.replaceChild(btnClone,btn);
		btn = btnClone;

		btn.addEventListener('click',state.requiredInput)
		btn.addEventListener('click',displayState);
	}
	
	lastState = state;
}

var pomodoroStateMachine = new clsPomodoroStateMachine();

$('btn-input').addEventListener('click',pomodoroStateMachine.getInput);

displayState();

// Used to check the time every second 
var myVar = setInterval(displayState,100);