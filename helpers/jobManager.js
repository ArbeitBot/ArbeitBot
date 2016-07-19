let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let mongoose = require('mongoose');
let Job = mongoose.model('job');
let User = mongoose.model('user');
let strings = require('./strings');

function sendJobCreatedMessage(user, bot, job) {
	// todo: handle if user doesn't have username
	function sendKeyboard(freelancers) {
		keyboards.sendKeyboard(bot, user.id, strings.pickFreelancersMessage, keyboards.clientKeyboard, (data => {
			let keyboard = [];
			keyboard.push([{
					text: strings.jobSendAllFreelancers,
					callback_data: strings.freelancerInline+strings.inlineSeparator+strings.jobSendAllFreelancers+strings.inlineSeparator+job._id
				}]);
			for (var i in freelancers) {
				let freelancer = freelancers[i];
				keyboard.push([{
					text: freelancer.username,
					callback_data: strings.freelancerInline+strings.inlineSeparator+freelancer._id+strings.inlineSeparator+job._id
				}]);
			}
			
			keyboards.sendInline(
					bot,
					user.id,
					messageFromFreelancers(freelancers),
					keyboard);
		}));
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
	// todo: handle if user doesn't have username
	var message = '';
	for (var i in users) {
		var user = users[i];
		message = message + (i == 0 ? '' : '\n') + '@' + user.username + '\n' + user.bio;
	}
	return message;
};

function sendUserJobOffer(bot, user, job) {
	if (job.state === strings.jobStates.searchingForFreelancer) {
		let keyboard = [];
		let keys = Object.keys(strings.freelancerOptions);
		for (var i in keys) {
			let option = strings.freelancerOptions[keys[i]];
			keyboard.push([{
				text: option,
				callback_data: strings.freelancerJobInline + strings.inlineSeparator + job._id + strings.inlineSeparator + option + strings.inlineSeparator + user.username
			}]);
		}
		keyboards.sendInline(bot,
							user.id,
							job.description,
							keyboard)
	} else if (job.state === strings.jobStates.freelancerChosen) {
		// todo: handle if freelancer was already chosen
	} else if (job.state === strings.jobStates.finished) {
		// todo: handle when job is finished
	}
};

function makeInterested(bot, msg, job, user) {
	// Remove user from candidates
	var index = job.candidates.indexOf(user);
	if (index > -1) {
		job.candidates.splice(index, 1);
	}
	// Add user to interesed
	job.interestedCandidates.push(user);
	job.save((err, user) => {
		updateJobMessage(job, bot);
	});

	// todo: update freelancer's message
};

function makeNotInterested(bot, msg, job, user) {
	// Remove user from candidates
	var index = job.candidates.indexOf(user);
	if (index > -1) {
		job.candidates.splice(index, 1);
	}
	// Add user to interesed
	job.notInterestedCandidates.push(user);
	job.save((err, user) => {
		updateJobMessage(job, bot);
	});

	// todo: update freelancer's message
};

function reportJob(bot, msg, job, user) {
	//  todo: handle report
};
 
function handleFreelancerAnswer(bot, msg, answer, job, user) {
	if (answer === strings.freelancerOptions.interested) {
		makeInterested(bot, msg, job, user);
	} else if (answer === strings.freelancerOptions.notInterested) {
		makeNotInterested(bot, msg, job, user);
	} else if (answer === strings.freelancerOptions.report) {
		reportJob(bot, msg, job, user);
	}
};

function handleFreelancerAnswerInline(bot, msg) {
	let jobId = msg.data.split(strings.inlineSeparator)[1];
	let option = msg.data.split(strings.inlineSeparator)[2];
	let freelancerUsername = msg.data.split(strings.inlineSeparator)[3];

	Job.findById(jobId)
	.populate(['candidates', 'interestedCandidates', 'notInterestedCandidates'])
	.exec((err, job) => {
		if (err) {
			// todo: handle error
		} else if (job) {
			User.find({ username: freelancerUsername }, (err, user) => {
				if (err) {
					// todo: handle error
				} else if (user) {
					handleFreelancerAnswer(bot, msg, option, job, user);
				} else {
					// todo: handle if no user is there
				}
			})
		} else {
			// todo: handle if no job is there
		}
	});
};

function handleFreelancerInline(bot, msg) {
	let freelancerId = msg.data.split(strings.inlineSeparator)[1];
	let jobId = msg.data.split(strings.inlineSeparator)[2];

	if (freelancerId === strings.jobSendAllFreelancers) {
		// todo: handle send message to all freelancers
		return;
	}

	Job.findById(jobId)
	.populate(['candidates', 'interestedCandidates', 'notInterestedCandidates'])
	.exec((err, job) => {
		if (err) {
			// todo: handle error
		} else if (job) {
			User.findById(freelancerId, (err, user) => {
				if (err) {
					// todo: handle error
				} else if (user) {
					job.current_inline_chat_id = msg.message.chat.id;
					job.current_inline_message_id = msg.message.message_id;
					job.candidates.push(user);
					job.save((err, newJob) => {
						if (err) {
							// todo: handle error
						} else {
							// sendUserJobOffer(bot, user, newJob);
							updateJobMessage(job, bot);
						}
					});
				} else {
					// todo: handle if no user is there
				}
			})
		} else {
			// todo: handle if no job is there
		}
	});
};

function updateJobMessage(job, bot) {
	function updateKeyboard(users) {
		let keyboard = [];
		keyboard.push([{
				text: strings.jobSendAllFreelancers,
				callback_data: strings.freelancerInline+strings.inlineSeparator+strings.jobSendAllFreelancers+strings.inlineSeparator+job._id
			}]);
		// users.sort(user => job.notInterested.indexOf(user) > -1);
		// users.sort(user => job.interestedCandidates.indexOf(user) > -1);

		for (var i in users) {
			let freelancer = users[i];
			var postfix = '';
			if (job.candidates.indexOf(freelancer) > -1) {
				postfix = strings.pendingOption;
			} else if (job.interestedCandidates.indexOf(freelancer) > -1) {
				postfix = strings.interestedOption;
			} else if (job.notInterestedCandidates.indexOf(freelancer) > -1) {
				postfix = strings.notInterestedOption;
			}
			keyboard.push([{
				text: freelancer.username+postfix,
				callback_data: strings.freelancerInline+strings.inlineSeparator+freelancer._id+strings.inlineSeparator+job._id
			}]);
		}
		
		var send = {
			chat_id: job.current_inline_chat_id,
			message_id: job.current_inline_message_id,
			text: messageFromFreelancers(users),
			reply_markup: {
				inline_keyboard: keyboard
			}
		};

console.log(send);
		// send.reply_markup = JSON.stringify(send.reply_markup);
		// bot.editMessageReplyMarkup(send)
		// 	.catch(err => console.log(err));;
	}

	dbmanager.freelancersForJob(job, (err, users) => {
		if (err) {
			// todo: handle error
			console.log(err);
		} else {
			updateKeyboard(users);
		}
	});
};

// Exports
module.exports = {
	sendJobCreatedMessage,
	handleFreelancerInline,
	handleFreelancerAnswerInline
};