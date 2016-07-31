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
 * Getting a user with search querry from mongo db, populates 'categories', 'jobs' and 'job_draft'
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

/**
 * Get user from mongo by id, populates 'categories', 'jobs' and 'job_draft'
 * @param  {Mongo:ObjectId} id User id from mongo db
 * @param  {Function} callback Callback function (user) that is called when user is obtained from db
 */
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

/**
 * Add user object to mongo db; returns existing user if user with the same 'id' field exists or creates a new one from user parameter
 * @param {Object} user Javascript object with fields for new user
 * @param {Function} callback Callback (user) that is called when user is added to db or retrieved from db
 */
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

/**
 * Changes user's busy field to true or false
 * @param  {Number} chatId Chat id of user that should have busy status toggled
 * @param  {Function} callback Callback (err, user) that is called when user's busy status is toggled
 */
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

/**
 * Adds or removes user to or from the specified category
 * @param  {Number}   chatId     Chat id of user that should have category added\removed
 * @param  {Mongo:ObjectId}   categoryId Id of category that should be added\removed to\from user
 * @param  {Function} callback   Callback (err, user, addedCategory) that is called when category is added or removed; addedCategory specifies if category was added or removed (boolean), can't remember if it returns true or false when category is added
 */
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

/**
 * Get category by it's title; populates 'freelancers', returns only freelancers available for work and with full profile, sorts them by name for now
 * @param  {String}   categoryTitle Category title
 * @param  {Function} callback      Callback (err, category) that is called upon obtaining category from db
 */
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

/**
 * Get all categories from db; populates 'freelancers', returns only freelancers available for work and with full profile, sorts them by name for now
 * @param {Function} callback Callback (err, categories) that is called upon obtaining categories from db
 */
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

/**
 * Getting job from db by it's id
 * @param  {Mongo:ObjectId} id Id of job to get
 * @param  {Function} callback Callback (job) that is called when job is obtained from db
 * @param  {JS Object} populate Can be String or usual JS object, this is passed to .populate()
 */
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

/**
 * Gets a list of available freelancers for job
 * @param  {Mongo:Job} job Job object for which freelancers are returned
 * @param  {Function} callback Callback (freelancers) that is called when users are obtained from db
 */
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

/**
 * Gets a list of available freelancers for job
 * @param  {Mongo:Object id} job Job id object for which freelancers are returned
 * @param  {Function} callback Callback (freelancers) that is called when users are obtained from db
 */
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