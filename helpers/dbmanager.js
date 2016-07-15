var mongoose = require('mongoose');

// Get schemas
var User = mongoose.model('user');
var Category = mongoose.model('category');
var Job = mongoose.model('job');

// User

function getUser(chatId, callback) {
	User.findOne({id: chatId})
	.populate(['categories', 'jobs', 'job_draft'])
	.exec(callback);
};

function addUser(user, callback) {
	getUser(user.id, (err, dbuserObject) => {
		if (err) {
			callback(err);
		} else if (dbuserObject) {
			callback(null, dbuserObject);
		} else {
			let userObject = new User(user);
			userObject.save(callback);
		}
	});
};

function toggleUserAvailability(chatId, callback) {
	getUser(chatId, (err, user) => {
		if (err) {
			callback(err);
		} else if (user) {
			user.busy = !user.busy;
			user.save(callback);
		} else {
			// todo: handle if user isn't there
		}
	});
};

function toggleCategoryForUser(chatId, categoryId, callback) {
	function findCategoryCallback(category, user) {
		var index = -1;
		for (var i = 0; i < user.categories.length; i++) {
			var innerCategory = user.categories[i];
			if (''+innerCategory._id == ''+category._id) {
				index = i;
				break;
			}
		}
		if (index < 0) {
			user.categories.push(category);
			category.freelancers.push(user);
		} else {
			user.categories.splice(index, 1);
			let ind = -1;//category.freelancers.indexOf(user);
			for (var i = 0; i < category.freelancers.length; i++) {
			var innerFreelancer = category.freelancers[i];
			if (''+innerFreelancer == ''+user._id) {
				ind = i;
				break;
			}
		}
			if (ind > -1) {
				category.freelancers.splice(ind, 1);
			}
		}
		user.save((err, user) => {
			category.save((err, category) => {
				if (err) {
					// todo: handle error
				} else {
					callback(err, user, index < 0);
				}
			});
		});
	};

	function findUserCallback(user) {
		Category.findById(categoryId, (err, category) => {
			if (err) {
				// todo: handle error
			} else if (category) {
				findCategoryCallback(category, user);
			} else {
				// todo: handle if category isn't there
			}
		});
	};

	getUser(chatId, (err, user) => {
		if (err) {
			callback(err);
		} else if (user) {
			findUserCallback(user);
		} else {
			// todo: handle is user isn't there
		}
	});
};

// Categories

function getCategory(categoryTitle, callback) {
	Category.findOne({ title: categoryTitle })
	.populate({
		path: 'freelancers',
		match: {
			$and: [
				{ busy: false },
				{ bio: { $exists: true } },
				{ hourly_rate: { $exists: true } }
			]
		}
	})
	.exec(callback);
};

function getCategories(callback) {
	Category.find({})
	.sort('title')
	.populate({
		path: 'freelancers',
		match: {
			$and: [
				{ busy: false },
				{ bio: { $exists: true } },
				{ hourly_rate: { $exists: true } }
			]
		}
	})
	.exec(callback);
};

// Export

module.exports = {
  // User
  getUser,
  addUser,
  toggleUserAvailability,
  toggleCategoryForUser,
  // Categories
  getCategory,
  getCategories
};