var mongoose = require('mongoose');

// Get schemas
var Freelancer = mongoose.model('freelancer');
var Employer = mongoose.model('employer');
// Uncomment when job model is done
// var Job = mongoose.model('job');

// Freelancer

function addFreelancer(freelancer, callback) {
  Freelancer.findOne({'id': freelancer.id}, (err, dbFreelancerObject) => {
    if (err) {
      callback(err);
    } else if (dbFreelancerObject) {
      callback(null, dbFreelancerObject);
    } else {
      let freelancerObject = new Freelancer(freelancer);
      freelancerObject.save(callback);
    }
  })
}

// Export

module.exports = {
  // Freelancer
  addFreelancer: addFreelancer
};