let dbmanager = require('./dbmanager');
let strings = require('./strings');
let keyboards = require('./keyboards');

var mongoose = require('mongoose');
var Job = mongoose.model('job');

function check(msg, callback) {
	dbmanager.getUser(msg.chat.id, (err, user) => {
		if (err) {
			// todo: handle error
			callback(false);
		} else if (user) {
			callback(user.input_state, user);
		} else {
			// todo: handle if no user
			callback(false);
		}
	});
};

function handle(msg, user, bot) {
	if (user.input_state == strings.inputBioState) {
		let newBio = msg.text.substring(0, 150);
		
		let needsCongrats = !user.bio;

		user.bio = newBio;
		user.input_state = undefined;
		user.save((err, user) => {
			bot.sendMessage({
					chat_id: msg.chat.id,
					text: strings.changedBioMessage+user.bio,
					reply_markup: JSON.stringify({
						keyboard: keyboards.freelancerKeyboard(user),
						resize_keyboard: true
				})})
				.then(function() 
				{
					if (needsCongrats &&user.hourly_rate && user.categories.length > 0) {
						keyboards.sendKeyboard(
							bot,
							user.id, 
							strings.filledEverythingMessage, 
							keyboards.freelancerKeyboard(user));
					}
				})
				.catch(function(err)
				{
					console.log(err);
				});
		});
	} else if (user.input_state == strings.inputCategoryNameState) {
		if (msg.text == strings.jobCreateCancel) {
			cancelJobCreation(msg, user, bot);
		} else if (msg.text.indexOf(' [') > -1) {
			let categoryTitle = msg.text.split(' [')[0];
			startJobDraft(categoryTitle, msg, user, bot);
		} else {
			console.log(msg);
		}
	} else if (user.input_state == strings.inputHourlyRateState) {
		if (msg.text == strings.jobCreateCancel) {
			cancelJobCreation(msg, user, bot);
		} else if (msg.text.indexOf(' [') > -1) {
			let hourlyRate = msg.text.split(' [')[0];
			addHourlyRateToJobDraft(hourlyRate, msg, user, bot);
		} else {
			console.log(msg);
		}
	} else if (user.input_state == strings.inputJobDescriptionState) {
		let description = msg.text.substring(0, 500);
		addDescriptionToJobDraft(description, msg, user, bot);
	} else {
		console.log(msg);
	}
};

function askForBio(msg, bot) {
	dbmanager.getUser(msg.chat.id, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			user.input_state = strings.inputBioState;
			user.save((err, user) => {
				if (err) {
					// todo: handle error
				} else {
					let message = user.bio ?
						strings.editBioMessage+'\n'+strings.yourCurrentBio+'\n\n'+user.bio :
						strings.editBioMessage;
					bot.sendMessage({
						chat_id: msg.chat.id,
						text: message,
						reply_markup: JSON.stringify({
							hide_keyboard: true
						})
					})
					.catch(function(err)
					{
						console.log(err);
					});
				}
			});
		} else {
			// todo: handle if no user
		}
	});
};

function askForNewJobCategory(msg, bot) {
	function saveUserCallback(user) {
		dbmanager.getCategories((err, categories) => {
			if (err) {
				// todo: handle error
			} else if (categories) {
				let categoryButtons = categories.map(category =>
				{
					return [{
						text: category.title + ' [' + category.freelancers.length + ']'
					}];
				});
				categoryButtons.unshift([{text:strings.jobCreateCancel}]);
				keyboards.sendKeyboard(
					bot,
					msg.chat.id,
					strings.selectCategoryMessage,
					categoryButtons);
			} else {
				// todo: handle if there are no categories
			}
		});
	};
	dbmanager.getUser(msg.chat.id, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			user.input_state = strings.inputCategoryNameState;
			user.save((err, user) => {
				if (err) {
					// todo: handle error
				} else {
					saveUserCallback(saveUserCallback);
				}
			});
		} else {
			// todo: handle if no user
		}
	});
};

function askForNewJobPriceRange(msg, user, bot, job, category) {
	user.input_state = strings.inputHourlyRateState;
	user.save((err, user) => {
		var keyboard = [];
		let options = strings.hourlyRateOptions;
		for (var i in options) {
			let option = options[i];

			var count = 0;
			for (var j in category.freelancers) {
				let freelancer = category.freelancers[j];
				if (freelancer.hourly_rate == option) {
					count = count + 1;
				}
			}

			keyboard.push([{
				text: option + ' [' + count + ']'
			}])
		}
		keyboard.unshift([{text:strings.jobCreateCancel}]);
		keyboards.sendKeyboard(
				bot,
				msg.chat.id,
				strings.selectJobHourlyRateMessage,
				keyboard);
	});
};

function askForNewJobDescription(msg, bot, user) {
	user.input_state = strings.inputJobDescriptionState;
	user.save((err, user) => {
		if (err) {
			// todo: handle error
		} else {
			bot.sendMessage({
				chat_id: msg.chat.id,
				text: strings.addJobDescriptionMessage,
				reply_markup: JSON.stringify({
					hide_keyboard: true
				})
			})
			.catch(function(err)
			{
				console.log(err);
			});
		}
	});
};

function cancelJobCreation(msg, user, bot) {
	user.input_state = undefined;
	user.job_draft = undefined;
	user.save((err, user) => {
		if (err) {
			// todo: handle error
		} else {
			keyboards.sendKeyboard(
				bot,
				msg.chat.id, 
				strings.clientMenuMessage, 
				keyboards.clientKeyboard);
		}
	});
};

function startJobDraft(categoryTitle, msg, user, bot) {
	dbmanager.getCategory(categoryTitle, (err, category) => {
		if (err) {
			// todo: handle error
		} else if (category) {
			let draft = new Job({
				category: category,
				client: user
			});
			draft.save((err, draft) => {
				if (err) {
					// todo: handle error
				} else {
					user.job_draft = draft;
					draft.save((err, job) => {
						if (err) {
							// todo: handle error
						} else {
							askForNewJobPriceRange(msg, user, bot, job, category);
						}
					});
				}
			});
		} else {
			// todo: handle no category
			console.log(msg);
		}
	});
};

function addHourlyRateToJobDraft(hourlyRate, msg, user, bot) {
	user.job_draft.hourly_rate = hourlyRate;
	user.job_draft.save((err, draft) => {
		if (err) {
			// todo: handle error
		} else {
			askForNewJobDescription(msg, bot, user);
		}
	})
};

function addDescriptionToJobDraft(description, msg, user, bot) {
	user.job_draft.description = description;
	let jobDraft = user.job_draft;
	user.job_draft = undefined;
	user.jobs.push(jobDraft);
	user.input_state = undefined;
	jobDraft.save((err, draft) => {
		if (err) {
			// todo: handle error
		} else {
			user.save((err, user) => {
				// todo: send a list of available freelancers for this job with inlines
				console.log('Job created yay!');
				keyboards.sendKeyboard(
				bot,
				msg.chat.id, 
				'Success! Job has been created but Nikita didn\'t quiet get to freelancers communication. But thanks for testing! :*', 
				keyboards.clientKeyboard);
			});
		}
	})
};

// Exports

module.exports = {
	check: check,
	handle: handle,
	askForBio: askForBio,
	askForNewJobCategory: askForNewJobCategory
};