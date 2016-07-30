let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let mongoose = require('mongoose');
let Job = mongoose.model('job');
let User = mongoose.model('user');
let strings = require('./strings');

// Main functions

function sendJobCreatedMessage(user, bot, job) {
	// todo: handle if user doesn't have username
	function sendKeyboard(freelancers) {
		keyboards.sendKeyboard(bot, 
			user.id, 
			strings.pickFreelancersMessage, 
			keyboards.clientKeyboard,
			(data => {
				keyboards.sendInline(
						bot,
						user.id,
						messageFromFreelancers(freelancers),
						jobInlineKeyboard(freelancers, job));
			}));
	};

	dbmanager.freelancersForJob(job, users => {
		sendKeyboard(users);
	});
};

function handleClientInline(bot, msg) {
	// Get essential info
	let options = msg.data.split(strings.inlineSeparator);
	let freelancerId = options[1];
	let jobId = options[2];
	// Check if select all touched
	if (freelancerId === strings.jobSendAllFreelancers) {
		dbmanager.freelancersForJobId(jobId, users => {
			addFreelancersToCandidates(jobId, users, msg, bot, null);
		});
	} else if (freelancerId === strings.jobSelectFreelancer) {
		dbmanager.findJobById(jobId, job => {
			showSelectFreelancers(msg, job, bot);
		}, 'interestedCandidates');
	} else {
		dbmanager.findUserById(freelancerId, user => {
			addFreelancersToCandidates(jobId, [user], msg, bot);
		})
	}
};

function handleSelectFreelancerInline(bot, msg) {
	// Get essential info
	let freelancerId = msg.data.split(strings.inlineSeparator)[1];
	let jobId = msg.data.split(strings.inlineSeparator)[2];

	if (freelancerId === strings.selectFreelancerCancel || true) {
		dbmanager.findJobById(jobId, job => {
			updateJobMessage(job, bot);
		});
	} else {
		selectFreelancerForJob(bot, msg, freelancerId, jobId);
	}
};

function handleFreelancerAnswerInline(bot, msg) {
	let options = msg.data.split(strings.inlineSeparator);
	let jobId = options[1];
	let option = options[2];
	let freelancerUsername = options[3];
	dbmanager.findJobById(jobId, job => {
		dbmanager.findUser({ username: freelancerUsername }, user => {
			handleFreelancerAnswer(bot, msg, option, job, user);
		});
	});
};

// Client side

function addFreelancersToCandidates(jobId, users, msg, bot, job) {
	function jobCallback(job) {
		job.current_inline_chat_id = msg.message.chat.id;
		job.current_inline_message_id = msg.message.message_id;
		users.forEach(user => job.candidates.push(user));
		job.save((err, newJob) => {
			if (err) {
				// todo: handle error
			} else {
				sendUsersJobOffer(bot, users, newJob);
				updateJobMessage(newJob, bot);
			}
		});
	};
	if (job) {
		jobCallback(job);
	} else {
		dbmanager.findJobById(jobId, newJob => {
			jobCallback(newJob);
		});
	}
};

function jobSelectCandidateKeyboard(job) {
	let keyboard = [];
	keyboard.push([{
			text: strings.selectFreelancerCancel,
			callback_data: 
				strings.selectFreelancerInline +
				strings.inlineSeparator +
				strings.selectFreelancerCancel +
				strings.inlineSeparator + 
				job._id
		}]);
	job.interestedCandidates.forEach(freelancer => {
		keyboard.push([{
			text: freelancer.username,
			callback_data: 
				strings.selectFreelancerInline + 
				strings.inlineSeparator + 
				freelancer._id +
				strings.inlineSeparator +
				job._id
		}]);
	});
	return keyboard;
};

function jobInlineKeyboard(freelancers, job) {
	let keyboard = [];
	if (job.interestedCandidates.length > 0) {
		keyboard.push([{
				text: strings.jobSelectFreelancer,
				callback_data: 
					strings.freelancerInline +
					strings.inlineSeparator +
					strings.jobSelectFreelancer +
					strings.inlineSeparator + 
					job._id
			}]);
	}
	keyboard.push([{
			text: strings.jobSendAllFreelancers,
			callback_data: 
				strings.freelancerInline +
				strings.inlineSeparator +
				strings.jobSendAllFreelancers +
				strings.inlineSeparator + 
				job._id
		}]);
	freelancers.forEach(freelancer => {
		// Get postfix
		var postfix = '';
		if (job.candidates.indexOf(freelancer._id) > -1) {
			postfix = strings.pendingOption;
		} else if (job.interestedCandidates.indexOf(freelancer._id) > -1) {
			postfix = strings.interestedOption;
		}
		// Add freelancer button
		keyboard.push([{
			text: freelancer.username + ' ' + postfix,
			callback_data: 
				strings.freelancerInline + 
				strings.inlineSeparator + 
				freelancer._id +
				strings.inlineSeparator +
				job._id
		}]);
	});
	return keyboard;
};

function showSelectFreelancers(msg, job, bot) {
	bot.editMessageText({
		chat_id: msg.message.chat.id,
		message_id: msg.message.message_id,
		reply_markup: JSON.stringify({
			inline_keyboard: jobSelectCandidateKeyboard(job)
		}),
		text: strings.selectCandidateMessage
	}).catch(err => console.log(181, err));
};

function updateJobMessage(job, bot) {
	// todo: handle when freelancer is selected
	if (job.state === strings.jobStates.searchingForFreelancer) {
		updateJobMessageForSearch(job, bot);
	} else if (job.state === strings.jobStates.freelancerChosen) {
		updateJobMessageForSelected(job, bot);
	} else if (job.state === strings.jobStates.finished) {
		updateJobMessageForFinished(job, bot);
	}
};

function updateJobMessageForSearch(job, bot) {
	function updateKeyboard(users) {
		var send = {
			chat_id: job.current_inline_chat_id,
			message_id: job.current_inline_message_id,
			text: messageFromFreelancers(users),
			reply_markup: {
				inline_keyboard: jobInlineKeyboard(users, job)
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
			.catch(err => console.log(207, err));
	}

	dbmanager.freelancersForJob(job, users => {
		updateKeyboard(users);
	});
};

function updateJobMessageForSelected(job, bot) {
	var send = {
			chat_id: job.current_inline_chat_id,
			message_id: job.current_inline_message_id,
			text: messageFromFreelancers(users),
			reply_markup: {
				inline_keyboard: jobInlineKeyboard(users, job)
			}
		};
	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageText(send)
		.catch(err => console.log(226, err));
};

function updateJobMessageForFinished(job, bot) {
	// todo: update job when it is finished
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

function selectFreelancerForJob(bot, msg, userId, jobId) {
	dbmanager.findJobById(jobId, job => {
		dbmanager.findUserById(userId, user => {
			job.selectedCandidate = user._id;
			job.state = strings.jobStates.freelancerChosen;
			job.save((err, newJob) => {
				if (err) {
					// todo: handle error
				} else {
					updateJobMessage(newJob, bot);
				}
			})
		});
	});
};

// Freelancers side 

function sendUsersJobOffer(bot, users, job) {
	if (job.state === strings.jobStates.searchingForFreelancer) {
		for (var i in users) {
			var user = users[i];

			let keyboard = [];
			let keys = Object.keys(strings.freelancerOptions);
			for (var j in keys) {
				let option = strings.freelancerOptions[keys[j]];
				keyboard.push([{
					text: option,
					callback_data: 
						strings.freelancerJobInline + 
						strings.inlineSeparator + 
						job._id + 
						strings.inlineSeparator + 
						option + 
						strings.inlineSeparator + 
						user.username
				}]);
			}
			keyboards.sendInline(bot,
								user.id,
								job.description,
								keyboard)
		}
	} else if (job.state === strings.jobStates.freelancerChosen) {
		// todo: handle if freelancer was already chosen
	} else if (job.state === strings.jobStates.finished) {
		// todo: handle when job is finished
	}
};

function updateFreelancerMessage(bot, msg, user, job) {
	var prefix = 'chacha';
	if (job.interestedCandidates.indexOf(user._id) > -1) {
		prefix = strings.interestedOption + 
		' ' + 
		strings.freelancerOptions.interested
	} else if (job.notInterestedCandidates.indexOf(user._id) > -1) {
		prefix = strings.notInterestedOption + 
		' ' + 
		strings.freelancerOptions.notInterested
	}
	prefix = prefix + '\n\n';
	var send = {
		chat_id: msg.message.chat.id,
		message_id: msg.message.message_id,
		text: prefix + job.description,
		reply_markup: {
			inline_keyboard: []
		}
	};
	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageText(send)
		.catch(err => console.log(316, err));
};

function sendUser() {

};

function handleFreelancerAnswer(bot, msg, answer, job, user) {
	if (answer === strings.freelancerOptions.interested) {
		makeInterested(true, bot, msg, job, user);
	} else if (answer === strings.freelancerOptions.notInterested) {
		makeInterested(false, bot, msg, job, user);
	} else if (answer === strings.freelancerOptions.report) {
		reportJob(bot, msg, job, user);
	}
};

function makeInterested(interested, bot, msg, job, user) {
	// Remove user from candidates
	var candIndex = job.candidates.indexOf(user._id);
	var intIndex = job.interestedCandidates.indexOf(user._id);
	var notIntIndex = job.notInterestedCandidates.indexOf(user._id);
	if (candIndex > -1) {
		job.candidates.splice(candIndex, 1);
	}
	if (intIndex > -1) {
		job.interestedCandidates.splice(intIndex, 1);
	}
	if (notIntIndex > -1) {
		job.notInterestedCandidates.splice(notIntIndex, 1);
	}
	// Add user to interesed or not interested
	if (interested) {
		job.interestedCandidates.push(user._id);
		job.freelancer_inline_message_id = msg.message.id;
		job.freelancer_inline_chat_id = msg.message.chat.id;
	} else {
		job.notInterestedCandidates.push(user._id);
	}
	job.save((err, newJob) => {
		updateJobMessage(newJob, bot);
		updateFreelancerMessage(bot, msg, user, newJob);
	});
};

function reportJob(bot, msg, job, user) {
	
};

// Exports
module.exports = {
	sendJobCreatedMessage,
	handleClientInline,
	handleSelectFreelancerInline,
	handleFreelancerAnswerInline
};