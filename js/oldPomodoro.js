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
	$('text-time').innerHTML = formatTime(timer.getTime());
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