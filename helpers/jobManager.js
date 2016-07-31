/**
 * Handles thw whole life cycle of job after creation: from showing a list 
 * of available freelancers to client to rating client and freelancer
 * Please see docs/job_process.txt to get better idea on job life cycle
 */

let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let mongoose = require('mongoose');
let Job = mongoose.model('job');
let User = mongoose.model('user');
let strings = require('./strings');

// Main functions

/**
 * Sending a message to client after job has been created; message includes inline with freelancers available and suitalbe for this job
 * @param  {Mongoose:User} user Owner of this job
 * @param  {Telegram:Bot} bot  Bot that should send message
 * @param  {Mongoose:Job} job  Relevant job
 */
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
}

// Handles

/**
 * Handles case when client selects a freelancer (that should receive a job offer from client later on) from the list of available freelancers; also handles option when sending to all freelancers
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
function handleClientInline(bot, msg) {
	// Get essential info
	let options = msg.data.split(strings.inlineSeparator);
	let freelancerId = options[1];
	let jobId = options[2];
	// Check if select all touched
	if (freelancerId === strings.jobSendAllFreelancers) {
		dbmanager.freelancersForJobId(jobId, users => {
			addFreelancersToCandidates(jobId, users, msg, bot);
		});
	} else if (freelancerId === strings.jobSelectFreelancer) {
		dbmanager.findJobById(jobId, job => {
			showSelectFreelancers(msg, job, bot);
		}, 'interestedCandidates');
	} else if (freelancerId === strings.jobFinishedOptions.report) {
		dbmanager.findJobById(jobId, job => {
			dbmanager.findUserById(options[3], user => {
				reportFreelancer(bot, msg, job, user);
			});
		});
	} else {
		dbmanager.findUserById(freelancerId, user => {
			addFreelancersToCandidates(jobId, [user], msg, bot);
		})
	}
}

/**
 * Handles case when freelancer should be selected for job from client
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
function handleSelectFreelancerInline(bot, msg) {
	// Get essential info
	let freelancerId = msg.data.split(strings.inlineSeparator)[1];
	let jobId = msg.data.split(strings.inlineSeparator)[2];

	if (freelancerId === strings.selectFreelancerCancel) {
		dbmanager.findJobById(jobId, job => {
			updateJobMessage(job, bot);
		});
	} else if (freelancerId === strings.selectAnotherFreelancerInline) {
		selectAnotherFreelancerForJob(bot, jobId);
	} else {
		selectFreelancerForJob(bot, msg, freelancerId, jobId);
	}
}

function handleFreelancerAnswerInline(bot, msg) {
	let options = msg.data.split(strings.inlineSeparator);
	let jobId = options[1];
	let answer = options[2];
	let freelancerUsername = options[3];

	dbmanager.findJobById(jobId, job => {
		dbmanager.findUser({ username: freelancerUsername }, user => {
			if (answer === strings.freelancerOptions.interested) {
				makeInterested(true, bot, msg, job, user);
			} else if (answer === strings.freelancerOptions.notInterested) {
				makeInterested(false, bot, msg, job, user);
			} else if (answer === strings.freelancerOptions.report) {
				reportClient(bot, msg, job, user);
			} else if (answer === strings.freelancerAcceptOptions.accept) {
				makeAccepted(true, bot, msg, job, user);
			} else if (answer === strings.freelancerAcceptOptions.refuse) {
				makeAccepted(false, bot, msg, job, user);
			} else if (answer === strings.jobFinishedOptions.rate) {
				reviewClient(bot, msg, job, user);
			}
		});
	});
}


//// Client side

// Functions

function sendUsersJobOffer(bot, users, job) {
	if (users === strings.selectAnotherFreelancerInline) {
		let send = {
			chat_id: job.freelancer_inline_chat_id,
			message_id: job.freelancer_inline_message_id,
			text: strings.clientHasChosenAnotherFreelancer,
			reply_markup: {
				inline_keyboard: []
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
		.catch(err => console.log(err));
	} else if (job.state === strings.jobStates.searchingForFreelancer) {
		for (let i in users) {
			let user = users[i];
				let keyboard = [];
				let keys = Object.keys(strings.freelancerOptions);
				for (let j in keys) {
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
				keyboards.sendInline(bot, user.id, job.description, keyboard);
		}
	} else if (job.state === strings.jobStates.freelancerChosen) {
		let user = users[0];

		let keyboard = [];
		let keys = Object.keys(strings.freelancerAcceptOptions);
		for (let i in keys) {
			let option = strings.freelancerAcceptOptions[keys[i]];
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

		let message = {
			chat_id: user.id,
			text: job.description,
			reply_markup: {
				inline_keyboard: keyboard
			}
		};
		message.reply_markup = JSON.stringify(message.reply_markup);
		bot.sendMessage(message)
		.catch(err => console.log(err))
		.then(data => {
			job.freelancer_inline_chat_id = data.chat.id;
			job.freelancer_inline_message_id = data.message_id;
			job.save((err, newJob) => {
				if (err) {
					// todo: handle error
				}
			})
		});
	} else if (job.state === strings.jobStates.finished) {
		// todo: handle when job is finished
	}
}

function showSelectFreelancers(msg, job, bot) {
	bot.editMessageText({
		chat_id: msg.message.chat.id,
		message_id: msg.message.message_id,
		reply_markup: JSON.stringify({
			inline_keyboard: jobSelectCandidateKeyboard(job)
		}),
		text: strings.selectCandidateMessage
	}).catch(err => console.log(err));
}

function reportFreelancer(bot, msg, job, user) {
	//  todo: handle report
}

// Management freelancers

function addFreelancersToCandidates(jobId, users, msg, bot, job) {
	function jobCallback(job) {
		if (job) {
			users = users.filter((user) => {
				return !job.candidates || (job.candidates.indexOf(user._id) === -1 && job.interestedCandidates.indexOf(user._id) === -1 && job.notInterestedCandidates.indexOf(user._id) === -1);
			});
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
		} else {
			// todo: handle error
		}
	}
	if (job) {
		jobCallback(job);
	} else {
		dbmanager.findJobById(jobId, newJob => {
			jobCallback(newJob);
		});
	}
}

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
					sendUsersJobOffer(bot, [user], newJob);
				}
			})
		});
	});
}

function selectAnotherFreelancerForJob(bot, jobId) {
	dbmanager.findJobById(jobId, job => {
		dbmanager.findUserById(job.selectedCandidate, user => {
			job.selectedCandidate = null;
			job.state = strings.jobStates.searchingForFreelancer;
			job.save((err, newJob) => {
				if (err) {
					// todo: handle error
				} else {
					updateJobMessage(newJob, bot);
					sendUsersJobOffer(bot, strings.selectAnotherFreelancerInline, newJob);
				}
			})
		});
	});
}

// Update message

function updateJobMessage(job, bot) {
	if (job.state === strings.jobStates.searchingForFreelancer) {
		updateJobMessageForSearch(job, bot);
	} else if (job.state === strings.jobStates.freelancerChosen) {
		updateJobMessageForSelected(job, bot);
	} else if (job.state === strings.jobStates.finished) {
		updateJobMessageForFinished(job, bot);
	}
}

function updateJobMessageForSearch(job, bot) {
	function updateKeyboard(users) {
		let send = {
			chat_id: job.current_inline_chat_id,
			message_id: job.current_inline_message_id,
			text: messageFromFreelancers(users),
			reply_markup: {
				inline_keyboard: jobInlineKeyboard(users, job)
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
		.catch(err => {
			if (err.error.description !== 'Bad Request: message is not modified') {
				console.log(err);
			}
		});
	}

	dbmanager.freelancersForJob(job, users => {
		updateKeyboard(users);
	});
}

function updateJobMessageForSelected(job, bot) {
	let send = {
		chat_id: job.current_inline_chat_id,
		message_id: job.current_inline_message_id,
		text: strings.waitContractorResponseMessage,
		reply_markup: {
			inline_keyboard: [[{
				text: strings.jobSelectAnotherFreelancer,
				callback_data:
				strings.selectFreelancerInline +
				strings.inlineSeparator +
				strings.selectAnotherFreelancerInline +
				strings.inlineSeparator +
				job._id
			}]]
		}
	};
	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageText(send)
	.catch(err => {
		if (err.error.description !== 'Bad Request: message is not modified') {
			console.log(err);
		}
	});
}

function updateJobMessageForFinished(job, bot) {
	dbmanager.findUserById(job.selectedCandidate, user => {
		let keyboard = [[{
				text: strings.jobFinishedOptions.rate,
				callback_data: strings.freelancerInline + strings.inlineSeparator + strings.jobFinishedOptions.rate + strings.inlineSeparator + job._id + strings.inlineSeparator + user._id
			},
			{
				text: strings.jobFinishedOptions.report,
				callback_data: strings.freelancerInline + strings.inlineSeparator + strings.jobFinishedOptions.report + strings.inlineSeparator + job._id + strings.inlineSeparator + user._id
			}
		]];

		let send = {
			chat_id: job.current_inline_chat_id,
			message_id: job.current_inline_message_id,
			text: `${strings.contactWithFreelancerMessage} @${user.username}`,
			reply_markup: {
				inline_keyboard: keyboard
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
		.catch(err => {
			if (err.error.description !== 'Bad Request: message is not modified') {
				console.log(err);
			}
		});
	});
}

// Keyboards

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
}

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
}

// Helpers

function messageFromFreelancers(users) {
	// todo: handle if user doesn't have username
	var message = '';
	for (var i in users) {
		var user = users[i];
		message = message + (i == 0 ? '' : '\n') + '@' + user.username + '\n' + user.bio;
	}
	return message;
}

//// End client side


//// Freelancers side

// Functions

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
		if (err) {
			// todo: handle error
		} else {
			updateJobMessage(newJob, bot);
			updateFreelancerMessage(bot, msg, user, newJob);
		}
	});
}

function makeAccepted(accept, bot, msg, job, user) {
	var intIndex = job.interestedCandidates.indexOf(user._id);

	if (''+job.selectedCandidate === ''+user._id) {
		if (!accept) {
			job.selectedCandidate = null;

			if (intIndex > -1) {
				job.interestedCandidates.splice(intIndex, 1);
			}

			job.notInterestedCandidates.push(user._id);
		}

		job.state = (accept) ? strings.jobStates.finished : strings.jobStates.freelancerChosen;

		job.save((err, newJob) => {
			updateFreelancerMessage(bot, msg, user, newJob);
		});
	} else {
		var send = {
			chat_id: msg.from.id,
			message_id: msg.message.message_id,
			text: strings.clientHasChosenAnotherFreelancer,
			reply_markup: {
				inline_keyboard: []
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
		.catch(err => console.log(err));
	}
}

function reviewClient(bot, msg, job, user) {

	/*
	if ('' === strings.rateClientFreelancerInline) {

	} else if ('' === strings.reviewClientFreelancerInline) {

	}*/
}

function reportClient(bot, msg, job, user) {
	//  todo: handle report
}

// Update message

function updateFreelancerMessage(bot, msg, user, job) {
	if (job.state === strings.jobStates.searchingForFreelancer) {
		updateFreelancerMessageForSearch(bot, msg, user, job);
	} else if (job.state === strings.jobStates.freelancerChosen) {
		updateFreelancerMessageForSelected(bot, msg, user, job);
	} else if (job.state === strings.jobStates.finished) {
		updateFreelancerMessageForFinished(bot, msg, user, job);
	}
}

function updateFreelancerMessageForSearch(bot, msg, user, job) {
	let prefix = 'chacha';
	if (job.interestedCandidates.indexOf(user._id) > -1) {
		prefix = `${strings.interestedOption} ${strings.freelancerOptions.interested}\n\n`;
	} else if (job.notInterestedCandidates.indexOf(user._id) > -1) {
		prefix = `${strings.notInterestedOption} ${strings.freelancerOptions.notInterested}\n\n`;
	}

	let send = {
		chat_id: msg.message.chat.id,
		message_id: msg.message.message_id,
		text: `${prefix}\n\n${job.description}`,
		reply_markup: {
			inline_keyboard: []
		}
	};

	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageText(send)
	.catch(err => {
		if (err.error.description !== 'Bad Request: message is not modified') {
			console.log(err);
		}
	});
}

function updateFreelancerMessageForSelected(bot, msg, user, job) {
	if (job.state == strings.jobStates.freelancerChosen) {
		let prefix = `${strings.refuseOption} ${strings.freelancerAcceptOptions.refuse}`;

		let send = {
			chat_id: msg.message.chat.id,
			message_id: msg.message.message_id,
			text: `${prefix}\n\n${job.description}`,
			reply_markup: {
				inline_keyboard: []
			}
		};

		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageText(send)
		.catch(err => {
			if (err.error.description !== 'Bad Request: message is not modified') {
				console.log(err);
			}
		})
		.then(data => {
			job.freelancer_inline_chat_id = data.chat.id;
			job.freelancer_inline_message_id = data.message_id;
			job.save((err, newJob) => {
				if (err) {
					// todo: handle error
				}
			})
		});

		job.state = strings.jobStates.searchingForFreelancer;
		job.save((err, newJob) => {
			updateJobMessage(newJob, bot);
		});
	}
}

function updateFreelancerMessageForFinished(bot, msg, user, job) {
	let prefix = `${strings.acceptOption} ${strings.freelancerAcceptOptions.accept}\n${strings.waitClientResponseMessage}`;

	let keyboard = [[{
			text: strings.jobFinishedOptions.rate,
			callback_data: strings.freelancerJobInline + strings.inlineSeparator + job._id + strings.inlineSeparator + strings.jobFinishedOptions.rate + strings.inlineSeparator + user.username
		},
		{
			text: strings.jobFinishedOptions.report,
			callback_data: strings.freelancerJobInline + strings.inlineSeparator + job._id + strings.inlineSeparator + strings.jobFinishedOptions.report + strings.inlineSeparator + user.username
		}
	]];

	let send = {
		chat_id: msg.message.chat.id,
		message_id: msg.message.message_id,
		text: `${prefix}\n\n${job.description}`,
		reply_markup: {
			inline_keyboard: keyboard
		}
	};

	send.reply_markup = JSON.stringify(send.reply_markup);
	bot.editMessageText(send)
	.catch(err => {
		if (err.error.description !== 'Bad Request: message is not modified') {
			console.log(err);
		}
	});

	updateJobMessage(job, bot);
}

//// End Freelancers side


// Exports
module.exports = {
	sendJobCreatedMessage,
	handleClientInline,
	handleSelectFreelancerInline,
	handleFreelancerAnswerInline
};