var POMODORO_DURATION = 25*60*1000;
var QUICK_BREAK_DURATION = 5*60*1000;
var LONG_BREAK_DURATION = 30*60*1000;
var COUNTDOWN_DURATION = 30*1000;

var BACKGROUND_RED = "#FFEBEE";
var BACKGROUND_GREEN = "#F1F8E9";


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
	var isNegative = time < -999;

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

function changeBackgroundColor(color) {
   document.body.style.background = color;
}

changeBackgroundColor(BACKGROUND_GREEN);

var editor = $('editor');
var save_buttons = document.getElementsByClassName('btn-save');

function setSaveButtonDisabled(dis) {
	for (var i = 0; i < save_buttons.length; i++) {
    	save_buttons[i].disabled = dis;
	}
}

var countdown_callback = function() {
	countdown_timer.pause();
	pomodoro_timer.pause();
	openAngryModal(function() {
		countdown_timer.reset();
		pomodoro_timer.reset();
		setSaveButtonDisabled(false);
		editor.value = "";
		changeBackgroundColor(BACKGROUND_GREEN);
	});
};

var countdown_timer = new clsTimer(countdown_callback, COUNTDOWN_DURATION);

var pomodoro_callback = function() {
	countdown_timer.reset();
	pomodoro_timer.reset();
	count ++;
	update_count();
	setSaveButtonDisabled(false);
	changeBackgroundColor(BACKGROUND_GREEN);

	var breaktext = count%4 ? "Take a 5 minute break." : "Treat yourself to a full 30 minutes off!";
	var message = "You made it!!, I am going to stop the forcing you to write now!\n\n" + breaktext + "\n\nMake sure you save your work!";

	openBreakModal(message,count%4 ? QUICK_BREAK_DURATION : LONG_BREAK_DURATION);

};
var pomodoro_timer = new clsTimer(pomodoro_callback, POMODORO_DURATION);

var remaining_text_area = $('text-remaining-time');
var countdown_text_area = $('text-countdown');

var keypress = function(){
	setSaveButtonDisabled(true);
	countdown_timer.reset();
	countdown_timer.start();
	pomodoro_timer.start();
	changeBackgroundColor(BACKGROUND_RED);
}

editor.addEventListener('keypress',keypress);

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

for (var i = 0; i < save_buttons.length; i++) {
    save_buttons[i].addEventListener('click',save_work,false);
}
/*****************************************
**************** Modals ******************
*****************************************/

///////////// Intro Modal //////////////////

var intro_modal = $('intro-modal');

var openIntroModal = function() {
	intro_modal.style.display = "block";
}

function changeSessionLength(val) {
	pomodoro_timer = new clsTimer(pomodoro_callback, val);
}

var radios = document.forms["session-length"].elements["time"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        changeSessionLength(this.value);
    }
}

///////////// Break Modal //////////////////

var break_modal = $('break-modal');
var break_modal_message = $('text-break');
var break_modal_clock = $('text-break-clock');

var break_callback = function() {
	closeModals();
	break_timer.pause();
}

var break_timer = null;

var openBreakModal = function(breakText, breakDuration) {
	break_timer = new clsTimer(break_callback, breakDuration);
	break_timer.start();
	break_modal_message.innerHTML = breakText;
	break_modal.style.display = "block";
}

/////////////// Angry Modal ////////////////

var angry_modal = $('angry-modal');
var angry_modal_btn = $('btn-angry-modal')

var openAngryModal = function(cb) {
	angry_modal.style.display = "block";
	angry_modal_btn.addEventListener('click',cb);
}

/////////////// All Modals /////////////////
// When the user clicks anywhere outside of the modal, close it
var closeModals = function() {
	intro_modal.style.display = "none";
	break_modal.style.display = "none";
	angry_modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == intro_modal) {
        closeModals();
    }
    if (event.target == break_modal) {
        closeModals();
    }
    if (event.target == angry_modal) {
        closeModals();
    }
}

// Get the btn elements that closes the modal
var x = document.getElementsByClassName("btn-close-modal");

for (var i = 0; i < x.length; i++) {
    x[i].addEventListener('click',closeModals,false);
}


//////////////////////////////////////

displayState = function() {
	remaining_text_area.innerHTML = formatTime(pomodoro_timer.getTimeLeft());
	countdown_text_area.innerHTML = formatTime(countdown_timer.getTimeLeft());

	if(break_timer)
		break_modal_clock.innerHTML = formatTime(break_timer.getTimeLeft());
}


// Used to check the time every second 
var myVar = setInterval(displayState,100);

openIntroModal();


