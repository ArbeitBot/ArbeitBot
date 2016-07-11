var mongoose = require('mongoose');

// Get schemas
var User = mongoose.model('user');
var Category = mongoose.model('category');
var Job = mongoose.model('job');

// Freelancer

// function getFreelancer(chatId, callback) {
// 	Freelancer.findOne({id: chatId})
// 	.populate('categories')
// 	.exec(callback);
// };

function addUser(user, callback) {
	User.findOne({id: user.id})
	.populate('categories', 'jobs')
	.exec((err, dbuserObject) => {
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

// function addCategoryToFreelancer(freelancerId, categoryTitle, callback) {

// 	function findFreelancerCallback(err, freelancer, category) {
// 		if (err) {
// 	  // todo: handle error
// 	} else {
// 		if (freelancer.categories.indexOf(category) < 0) {
// 			freelancer.categories.push(category);
// 		}
// 		freelancer.save(callback);
// 	}
// };

// function findCategoryCallback(err, category) {
// 	if (err) {
// 		callback(err);
// 	} else {
// 		getFreelancer(freelancerId, (err, freelancer) => {
// 			findFreelancerCallback(err, freelancer, category);
// 		});
// 	}
// }

// Category.findOne({title: categoryTitle}, findCategoryCallback);
// }

// Categories

function getCategories(callback) {
	Category.find({}, callback);
};

// Export

module.exports = {
  // User
  addUser: addUser,
  // addCategoryToFreelancer: addCategoryToFreelancer,
  // Categories
  getCategories: getCategories
};