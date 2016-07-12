let dbmanager = require('./dbmanager');
let strings = require('./strings');

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
		user.bio = newBio;
		user.input_state = undefined;
		user.save((err, user) => {
			bot.sendMessage({
						chat_id: msg.chat.id,
						text: strings.changedBioMessage+user.bio
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
					bot.sendMessage({
						chat_id: msg.chat.id,
						text: strings.editBioMessage+'\n'+strings.yourCurrentBio+'\n\n'+user.bio
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