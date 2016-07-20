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

	dbmanager.freelancersForJob(job, (err, users) => {
		if (err) {
			// todo: handle error
			console.log(err);
		} else {
			sendKeyboard(users);
		}
	});
};

function handleFreelancerInline(bot, msg) {
	// Get essential info
	let freelancerId = msg.data.split(strings.inlineSeparator)[1];
	let jobId = msg.data.split(strings.inlineSeparator)[2];

	// Check if select all touched
	if (freelancerId === strings.jobSendAllFreelancers) {
		Job.findById(jobId, (err, job) => {
			if (err) {
				// todo: handle error
			} else if (job) {
				dbmanager.freelancersForJob(job, (err, users) => {
					if (err) {
						// todo: handle error
						console.log(err);
					} else {
						addFreelancersToCandidates(jobId, users, msg, bot, job);
					}
				});
			} else {
				// todo: handle if no job is there
			}
		});
	} else {
		User.findById(freelancerId, (err, user) => {
			if (err) {
				// todo: handle error
			} else if (user) {
				addFreelancersToCandidates(jobId, [user], msg, bot);
			} else {
				// todo: handle if no user is there
			}
		});
	}
};

function handleFreelancerAnswerInline(bot, msg) {
	let jobId = msg.data.split(strings.inlineSeparator)[1];
	let option = msg.data.split(strings.inlineSeparator)[2];
	let freelancerUsername = msg.data.split(strings.inlineSeparator)[3];

	Job.findById(jobId, (err, job) => {
		if (err) {
			// todo: handle error
		} else if (job) {
			User.findOne({ username: freelancerUsername }, (err, user) => {
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

// Helpers

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
		Job.findById(jobId, (err, job) => {
			if (err) {
				// todo: handle error
			} else if (job) {
				jobCallback(job);
			} else {
				// todo: handle if no job is there
			}
		});
	}
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
	for (var i in freelancers) {
		// Get freelancer
		let freelancer = freelancers[i];
		// Get postfix
		var postfix = '';
		if (job.candidates.indexOf(freelancer._id) > -1) {
			postfix = strings.pendingOption;
		} else if (job.interestedCandidates.indexOf(freelancer._id) > -1) {
			postfix = strings.interestedOption;
		} else if (job.notInterestedCandidates.indexOf(freelancer._id) > -1) {
			postfix = strings.notInterestedOption;
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
	}
	return keyboard;
};

function updateJobMessage(job, bot) {
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
		bot.editMessageReplyMarkup(send)
			.catch(err => console.log(err));
	}

	dbmanager.freelancersForJob(job, (err, users) => {
		if (err) {
			// todo: handle error
		} else {
			updateKeyboard(users);
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

function sendUsersJobOffer(bot, users, job) {
	if (job.state === strings.jobStates.searchingForFreelancer) {
		for (var i in users) {
			var user = users[i];

			let keyboard = [];
			let keys = Object.keys(strings.freelancerOptions);
			for (var i in keys) {
				let option = strings.freelancerOptions[keys[i]];
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
		reply_markup: {
			inline_keyboard: []
		}
	};
	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageReplyMarkup(send)
		.then(data => {
			bot.editMessageText({
				chat_id: msg.message.chat.id,
				message_id: msg.message.message_id,
				text: prefix + job.description,
			}).catch(err => console.log(err));
		}).catch(err => console.log(err));
};

// Freelancer options

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
	} else {
		job.notInterestedCandidates.push(user._id);
	}
	job.save((err, newJob) => {
		updateJobMessage(newJob, bot);
		updateFreelancerMessage(bot, msg, user, newJob);
	});
};

function reportJob(bot, msg, job, user) {
	//  todo: handle report
};

// Exports
module.exports = {
	sendJobCreatedMessage,
	handleFreelancerInline,
	handleFreelancerAnswerInline
};