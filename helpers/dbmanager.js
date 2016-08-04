/**
 * Mongo DB manager – used for all the requests to database; ideally mongoose should be required only here
 */

const mongoose = require('mongoose');

// Get schemas
const User = mongoose.model('user');
const Category = mongoose.model('category');
const Job = mongoose.model('job');
const Review = mongoose.model('review');

// User

/**
 * Getting a user with search querry from mongo db, populates 'categories', 'jobs' and 'job_draft'
 * @param  {Mongo:SearchQuery} query Search query to find user
 */
function findUser(query) {
  return new Promise(fullfill => {
    User.findOne(query)
      .populate(['categories', 'jobs', 'job_draft'])
      .exec((err, user) => {
        if (err) {
          throw err;
        } else {
          fullfill(user);
        }
      });
  });
}

/**
 * Get user from mongo by id, populates 'categories', 'jobs' and 'job_draft'
 * @param  {Mongo:ObjectId} id User id from mongo db
 */
function findUserById(id) {
  return new Promise(fullfill => {
    User.findById(id)
      .populate(['categories', 'jobs', 'job_draft'])
      .exec((err, user) => {
        if (err) {
          throw err;
        } else if (!user) {
          throw new Error('No user found');
        } else {
          fullfill(user);
        }
      });
  });
}

/**
 * Add user object to mongo db; returns existing user if user with the same 'id' field exists or creates a new one from user parameter
 * @param {Object} user Javascript object with fields for new user
 */
function addUser(user) {
  return new Promise(fullfill => {
    findUser({ id: user.id })
      .then(dbuserObject => {
        if (dbuserObject) {
          fullfill(dbuserObject);
        } else {
          let userObject = new User(user);
          userObject.save()
            .then(fullfill);
        }
      });
  });
}

/**
 * Changes user's busy field to true or false
 * @param  {Number} chatId Chat id of user that should have busy status toggled
 */
function toggleUserAvailability(chatId) {
  return new Promise(fullfill => {
    findUser({ id: chatId })
      .then(user => {
        user.busy = !user.busy;
        user.save()
          .then(fullfill);
      });
  });
}

/**
 * Adds or removes user to or from the specified category; promise returns { user: user object, isAdded: true/false if category was added ot removed}
 * @param  {Number}   chatId     Chat id of user that should have category added\removed
 * @param  {Mongo:ObjectId}   categoryId Id of category that should be added\removed to\from user
 */
function toggleCategoryForUser(chatId, categoryId) {
  return new Promise(fullfill => {
    findUser({ id: chatId })
      .then(user => {
        Category.findById(categoryId)
          .then(category => {
            let index = user.categories.map(category => String(category._id)).indexOf(String(category.id));
            if (index < 0) {
              user.categories.push(category);
              category.freelancers.push(user);
            } else {
              user.categories.splice(index, 1);
              category.freelancers.splice(category.freelancers.map(id => String(id)).indexOf(String(user._id)), 1);
            }
            user.save()
              .then(user => {
                category.save()
                  .then(category => {
                    fullfill({ user: user, isAdded: index < 0 });
                  });
              });
            });
      });
  });
}

// Categories

/**
 * Get category by it's title; populates 'freelancers', returns only freelancers available for work and with full profile, sorts them by name for now
 * @param  {String}   categoryTitle Category title
 */
function getCategory(categoryTitle) {
  return new Promise(fullfill => {
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
      .exec((err, category) => {
        if (err) {
          throw err;
        } else if (!category) {
          throw new Error('No category found');
        } else {
          fullfill(category);
        }
      });
  });
}

/**
 * Get all categories from db; populates 'freelancers', returns only freelancers available for work and with full profile, sorts them by name for now
 */
function getCategories() {
  return new Promise(fullfill => {
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
      .exec((err, categories) => {
        if (err) {
          throw err;
        } else {
          fullfill(categories);
        }
      });
  });
}

// Jobs

/**
 * Getting job from db by it's id
 * @param  {Mongo:ObjectId} id Id of job to get
 * @param  {JS Object} populate Can be String or usual JS object, this is passed to .populate()
 */
function findJobById(id, populate) {
  return new Promise(fullfill => {
    Job.findById(id)
      .populate(populate || '')
      .exec((err, job) => {
        if (err) {
          throw error;
        } else {
          fullfill(job);
        }
      });
  });
}

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
}

/**
 * Gets a list of available freelancers for job
 * @param  {Mongo:Object id} jobId Job id object for which freelancers are returned
 * @param  {Function} callback Callback (freelancers) that is called when users are obtained from db
 */
function freelancersForJobId(jobId, callback) {
  findJobById(jobId, job => {
    if (job) {
      freelancersForJob(job, users => {
        callback(users);
      });
    } else {
      callback(null);
    }
  });
}

// Review

/**
 * Get review by id
 * @param  {Mongo:ObjectId}   id       Id of review to retrieve
 * @param  {Function} callback Callback (review) that is called upon obtaining of the review from db
 * @param  {JS Object or String}   populate Option to populate fields in query result
 */
function findReviewById(id, callback, populate) {
  Review.findById(id)
  .populate(populate || '')
  .exec((err, review) => {
    if (err) {
      // todo: handle error
    } else {
      callback(review);
    }
  })
}

/**
 * Add review object
 * @param {JS Object}   review   Review template to add to db
 * @param {Function} callback Callback (review) that's called when review is added to db
 */
function addReview(review, callback) {
  const reviewObject = new Review(review);
  reviewObject.save((err, newReviewObject) => {
    if (err) {
      // todo: handle error
    } else {
      callback(newReviewObject);
    }
  });
}

// Export

module.exports = {
  // User
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
  freelancersForJobId,
  //Review
  findReviewById,
  addReview
};