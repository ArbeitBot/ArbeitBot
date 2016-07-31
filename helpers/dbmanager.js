/**
 * Mongo DB manager – used for all the requests to database; ideally mongoose should be required only here
 */

var mongoose = require('mongoose');

// Get schemas
var User = mongoose.model('user');
var Category = mongoose.model('category');
var Job = mongoose.model('job');

// User

/**
 * This method is deprecated due to not handling errors, please use 'findUser'. Used to get a User object for chat id, populates 'categories', 'jobs' and 'job_draft'
 * @param  {Number} chatId User's chat id
 * @param  {Function} callback Callback with (err, user) that is called when user is obtained from the db
 */
function getUser(chatId, callback) {
	User.findOne({ id: chatId })
	.populate(['categories', 'jobs', 'job_draft'])
	.exec(callback);
};

/**
 * Getting a user with search querry from mongo db
 * @param  {Mongo:SearchQuery} query Search query to find user
 * @param  {Function} callback Function (user) that is called when user is obtained from db
 */
function findUser(query, callback) {
	User.findOne(query)
	.populate(['categories', 'jobs', 'job_draft'])
	.exec((err, user) => {
		if (err) {
			// todo: handle error
		} else {
			callback(user);
		}
	});
};

function findUserById(id, callback) {
	User.findById(id)
	.populate(['categories', 'jobs', 'job_draft'])
	.exec((err, user) => {
		if (err) {
			// todo: handle error
		} else {
			callback(user);
		}
	});
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
		},
		options: {
			sort: { 'name': -1 } 
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
		},
		options: {
			sort: { 'name': -1 } 
		}
	})
	.exec(callback);
};

// Jobs

function findJobById(id, callback, populate) {
	Job.findById(id)
	.populate(populate || '')
	.exec((err, job) => {
		if (err) {
			// todo: handle error
		} else {
			callback(job);
		}
	})
};

function freelancersForJob(job, callback) {
	User.find({ $and: [
				{ categories: job.category },
				{ busy: false },
				{ bio: { $exists: true } },
				{ hourly_rate: { $exists: true } },
				{ _id: { $nin: job.notInterestedCandidates } }
			]})
	.exec(function(err, users) {
		if (err) {
			// todo: handle error
			console.log(err);
		} else {
			callback(users);
		}
	});
};

function freelancersForJobId(id, callback) {
	findJobById(jobId, job => {
		freelancersForJob(job, users => {
			callback(users);	
		});
	});
};

// Export

module.exports = {
  // User
  getUser,
  findUser,
  findUserById,
  addUser,
  toggleUserAvailability,
  toggleCategoryForUser,
  // Categories
  getCategory,
  getCategories,
  // Jobs
  findJobById,
  freelancersForJob,
  freelancersForJobId
};