let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let mongoose = require('mongoose');
let Job = mongoose.model('job');
let strings = require('./strings');

function sendJobCreatedMessage(user, bot, job) {
	function sendKeyboard(freelancers) {
		let keyboard = [];
		for (var i in freelancers) {
			let freelancer = freelancers[i];
			for (var i = 0; i < 100; i++) {
			keyboard.push([{
				text: freelancer.username,
				callback_data: '1234' // todo: add callback data
			}]);
		}
		}
		keyboards.sendInline(
				bot,
				user.id,
				messageFromFreelancers(freelancers),
				keyboard);
	};

	dbmanager.freelancersForJob(job, (err, users) => {
		if (err) {
			// todo: handle error
			console.log(err);
		} else {
			sendKeyboard(users);
		}
	});
};

function messageFromFreelancers(users) {
	var message = strings.pickFreelancersMessage;
	for (var i in users) {
		var user = users[i];
		for (var i = 0; i < 100; i++) {
		message = message + '\n@' + user.username + '\n' + user.bio;
	}
	}
	return message;
};

// Exports
module.exports = {
	sendJobCreatedMessage
};