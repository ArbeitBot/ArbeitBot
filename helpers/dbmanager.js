var mongoose = require('mongoose');

// Get schemas
var Freelancer = mongoose.model('freelancer');
var Employer = mongoose.model('employer');
var Category = mongoose.model('category');
var Job = mongoose.model('job');

// Freelancer

function getFreelancer(chatId, callback) {
	Freelancer.findOne({id: chatId})
	.populate('categories')
	.exec(callback);
};

function addFreelancer(freelancer, callback) {
	Freelancer.findOne({id: freelancer.id})
	.populate('categories')
	.exec((err, dbFreelancerObject) => {
		if (err) {
			callback(err);
		} else if (dbFreelancerObject) {
			callback(null, dbFreelancerObject);
		} else {
			let freelancerObject = new Freelancer(freelancer);
			freelancerObject.save(callback);
		}
	});
};

function addCategoryToFreelancer(freelancerId, categoryTitle, callback) {

	function findFreelancerCallback(err, freelancer, category) {
		if (err) {
	  // todo: handle error
	} else {
		if (freelancer.categories.indexOf(category) < 0) {
			freelancer.categories.push(category);
		}
		freelancer.save(callback);
	}
};

function findCategoryCallback(err, category) {
	if (err) {
		callback(err);
	} else {
		getFreelancer(freelancerId, (err, freelancer) => {
			findFreelancerCallback(err, freelancer, category);
		});
	}
}

Category.findOne({title: categoryTitle}, findCategoryCallback);
}

// Categories

function getCategories(callback) {
	Category.find({}, callback);
};

// Export

module.exports = {
  // Freelancer
  addFreelancer: addFreelancer,
  addCategoryToFreelancer: addCategoryToFreelancer,
  // Categories
  getCategories: getCategories
};