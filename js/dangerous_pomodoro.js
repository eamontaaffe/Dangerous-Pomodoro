/*****************************************
**************** TIMER *******************
*****************************************/

// From http://stackoverflow.com/questions/3144711/find-the-time-left-in-a-settimeout
function clsTimer(callback, delay) {
    var id, started, remaining = delay, running = false;

    this.start = function() {
    	if (!running) {
	        running = true;
	        started = new Date();
	        id = setTimeout(callback, remaining);
	    }
    }

    this.pause = function() {
    	if (running) {
	        running = false;
	        clearTimeout(id);
	        remaining -= new Date() - started;
	    }
    }

    this.reset = function() {
    	running = false;
    	clearTimeout(id);
    	remaining = delay;

    }

    this.getTimeLeft = function() {
        if (running) {
            this.pause();
            this.start();
        }

        return remaining;
    }

    this.getStateRunning = function() {
        return running;
    }
}

/////////////////////////////////

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

	newTime = pad(m, 2) + ':' + pad(s, 2);

	newTime = isNegative ? "-" + newTime : newTime;

	return newTime;
}

var BACKGROUND_RED = "#FFEBEE";
var BACKGROUND_GREEN = "#F1F8E9";

function changeBackgroundColor(color) {
   document.body.style.background = color;
}

changeBackgroundColor(BACKGROUND_GREEN);

var editor = $('editor');

var COUNTDOWN_DURATION = 30*1000;
var countdown_callback = function() {
	countdown_timer.reset();
	pomodoro_timer.reset();
	alert("You took too long of a break, now I am going to delete your work!");
	editor.value = "";
};
var countdown_timer = new clsTimer(countdown_callback, COUNTDOWN_DURATION);

var POMODORO_DURATION = 25*60*1000;
var pomodoro_callback = function() {
	countdown_timer.reset();
	pomodoro_timer.reset();
	count ++;
	update_count();
	save_button.disabled = false;
	changeBackgroundColor(BACKGROUND_GREEN);
	alert("You made it!!, I am going to stop the forcing you to write now!\nMake sure you save youre work!");
};
var pomodoro_timer = new clsTimer(pomodoro_callback, POMODORO_DURATION);

var remaining_text_area = $('text-remaining-time');
var countdown_text_area = $('text-countdown');

displayState = function() {
	remaining_text_area.innerHTML = formatTime(pomodoro_timer.getTimeLeft());
	countdown_text_area.innerHTML = formatTime(countdown_timer.getTimeLeft());
}

// Used to check the time every second 
var myVar = setInterval(displayState,100);

var keypress = function(){
	save_button.disabled = true;
	countdown_timer.reset();
	countdown_timer.start();
	pomodoro_timer.start();
	changeBackgroundColor(BACKGROUND_RED);
}

editor.addEventListener('keypress',keypress);

var save_button = $('btn-save');

save_work = function() {
	var value = editor.value;
	var file = new Blob([value], {type: "text/plain;charset=utf-8"});
	var time = (new Date()).getTime();

	var a = document.createElement("a");
	a.href = URL.createObjectURL(file);
    a.download = "dangerous_pomodoro_" + time + ".txt";
    a.click();
}

var count_text_area = $('text-count');
var count = 0;

update_count = function() {
	count_text_area.innerHTML = "Pomodoro count: " + count;
}

update_count();

save_button.addEventListener('click',save_work);

