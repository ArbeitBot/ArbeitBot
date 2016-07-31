/**
 * Handles all text inputs in bot like inputting freelancer bio or job description
 */

let dbmanager = require('./dbmanager');
let strings = require('./strings');
let keyboards = require('./keyboards');
let jobManager = require('./jobManager'); 

let mongoose = require('mongoose');
let Job = mongoose.model('job');

/**
 * Checks if state of user that sent message is one of input ones 
 * @param  {Telegram:Messahe}   msg      Message received
 * @param  {Function} callback Callback(input_state, user) that is called when check is done
 */
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

/**
 * Handler for user inputs, ran after check for input state was positive; depending on user's input state saves right values to db
 * @param  {Telegram:Message} msg  Message that was received
 * @param  {Mongoose:User} user User that sent the Message
 * @param  {Telegram:Bot} bot  Bot that should respond
 */
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

/**
 * Sends message to user asking for bio and adds relevant flags to user's object
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
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

/**
 * Sends message asking for job category of job that is being created, saves relevant flag to db for user
 * @todo: Maybe we can move this to job manager?
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForNewJobCategory(msg, bot) {
	function saveUserCallback(user) {
		dbmanager.getCategories((err, categories) => {
			if (err) {
				// todo: handle error
			} else if (categories) {
				let categoryButtons = categories
				.filter(category => category.freelancers.length > 0)
				.map(category =>
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

/**
 * Sends message asking for job hourly rate of job that is being created, saves relevant flag to db for user
 * @todo: Maybe we can move this to job manager?
 * @param  {Telegram:Message} msg Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Mongoose:Job} job Job that should be altered
 * @param  {Mongoose:Category} category Job's current category
 */
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

			if (count > 0) {
				keyboard.push([{
					text: option + ' [' + count + ']'
				}])
			}
		}
		keyboard.unshift([{text:strings.jobCreateCancel}]);
		keyboards.sendKeyboard(
				bot,
				msg.chat.id,
				strings.selectJobHourlyRateMessage,
				keyboard);
	});
};

/**
 * Sends message asking for job description of job that is being created, saves relevant flag to db for user
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 * * @param  {Mongoose:User} user Owner of job
 */
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

/**
 * Cancels job creation, removes job draft and resets user's input state
 * @param  {Telegram:Message} msg  Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 */
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

/**
 * Creates job draft for user
 * @param  {String} categoryTitle Title of job's category
 * @param  {Telegram:message} msg Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 */
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

/**
 * Adds hourly rate to job draft and sends next step
 * @param {String} hourlyRate Picked hourly rate
 * @param {Telegram:Message} msg        Message received
 * @param {Mongoose:User} user       Job owner
 * @param {Telegram:Bot} bot        Bot that should respond
 */
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

/**
 * Adds desctiption to job draft and sends next step
 * @param {String} description Description of job
 * @param {Telegram:Message} msg        Message received
 * @param {Mongoose:User} user       Job owner
 * @param {Telegram:Bot} bot        Bot that should respond
 */
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
				jobManager.sendJobCreatedMessage(user, bot, draft);
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