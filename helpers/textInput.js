let dbmanager = require('./dbmanager');
let strings = require('./strings');
let keyboards = require('./keyboards');

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

// Exports

module.exports = {
	check: check,
	handle: handle,
	askForBio: askForBio
};