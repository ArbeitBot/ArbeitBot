if (answer === strings.jobFinishedOptions.rate) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(job.selectedCandidate)
          .then(user => {
            writeReview(bot, msg, job, user, options, strings.reviewTypes.byFreelancer);
          });
      });
  }

//////////
   else if (answer === strings.freelancerAcceptOptions.accept) {
                makeAccepted(true, bot, msg, job, user);
              } else if (answer === strings.freelancerAcceptOptions.refuse) {
                makeAccepted(false, bot, msg, job, user);
              }

/////////
 else if (freelancerId === strings.jobFinishedOptions.report) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(options[3])
          .then(user => {
            reportFreelancer(bot, msg, job, user);
          });
      });
  } else if (freelancerId === strings.jobFinishedOptions.rate) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(job.client)
          .then(user => {
            writeReview(bot, msg, job, user, options, strings.reviewTypes.byClient);
          });
      });
  } 
  ///////////
else if (freelancerId === strings.selectAnotherFreelancerInline) {
    selectAnotherFreelancerForJob(bot, jobId);
  } 