/**
 * Storage for all the strings in project; change once, use everywhere ;)
 *
 * @module helpers/strings
 * @license MIT
 */

module.exports = {
  reportThankYouMessage: 'Thank you for reporting this suspicious activity! Our moderators will take immediate action to prevent reported behaviour in the future.',
  banMessage: 'It looks like you have been reported, and our moderators decided that there was a reason to ban you. If this is a mistake, please let my creator @borodutch know – we will see what we can do ;)',
  loadingMessage: '🦄 Loading...',
  askForUsername: 'It looks like you don\'t have a username. Please, set it up in Telegram settings.',
  deprecatedMessage: 'This message is deprecated, please scroll down to see the new message ⤵️',
  initialMessage: 'Welcome to the first free opensource Telegram freelance market.\n\nIf you are looking for a job, please fill out your "Profile". Otherwise, you can proceed to "Find contractors". Click "Help" if you have any questions.\n\nThank you for joining our friendly family!',
  mainMenuMessage: 'Select "Profile" if you are looking for a job, otherwise – "Find contractors".',
  noJobsExistMessage: 'You do not have any jobs yet. You can create one by clicking "Post new job" button.',
  clientMenuMessage: 'Please, select an option from the menu below.',
  selectCategoryMessage: 'Please, select a category relevant to your job. The number of available contractors is displayed between [square brackets] for each category.',
  selectJobHourlyRateMessage: 'Please, select how much you would like to pay. The price is given in USD/hour to identify the skill levels of developers. You can negotiate a fixed price with the contractor later on. The number of available contractors is displayed between [square brackets] for each rate range.',
  addJobDescriptionMessage: 'Please, provide a job description (max 500 chars). It will be visible to contractors. Please, be brief – the details can be discussed with the contractors later on.',
  addJobDescriptionMessageCancel: 'You can cancel at any time',
  filledEverythingMessage: 'You did it! Your profile is now complete. Now just sit back and wait for job offers.',
  fullFreelancerMessageAvailable: 'Your profile is complete! Now just sit back and wait for job offers.',
  fullFreelancerMessageBusy: 'Your profile is complete! However, clients will not contact you since your status is "Busy".',
  emptyFreelancerMessage: 'Welcome to your freelancer profile! Please, fill out your bio, select your hourly rate and categories of expertise.',
  missingFreelancerMessage: 'Welcome to your freelancer profile! You need both to fill out your bio and select your hourly rate and categories of expertise so that clients can see you.',
  helpMessage: 'If you want to learn more about this bot, please go to arbeitbot.com.\n\nIf you have any requests, suggestions, concerns or just want to chat, please contact my creator by clicking the button bellow.',
  becameBusyMessage: 'You just set your status to "Busy". You will not receive any new job offers until you switch back to "Available".',
  becameAvailableMessage: 'You just switched to "Available" status. You will now receive relevant job offers until you switch back to "Busy".',
  missingBecameBusyMessage: 'You just changed your status to "Busy". But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  missingBecameAvailableMessage: 'You just changed to "Available" status.  But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  pickFreelancersMessage: 'Success! A new job has been created. Please, select which contractors should receive job offers from you.',
  editBioMessage: 'Please, enter your bio (max 150 chars). Keep it brief but descriptive – the clients will see it beside your rating. Feel free to add a link to your personal website.',
  selectCandidateMessage: 'Please, select the candidate that you liked the most.',
  changedBioMessage: 'Congrats! Your new bio is:\n\n',
  notChangedBioMessage: 'Your bio not changed.\n\n',
  yourCurrentBio: 'Your current bio:',
  editHourlyRateMessage: 'What is your hourly rate? You will only receive job offers of relevant hourly rate.',
  pickCategoriesMessage: 'Please, select your skills. You will only receive job offers in categories you select.',
  suggestCategoryMessage: 'Suggest your own category',
  waitContractorResponseMessage: 'You sent an offer to one of the freelancers. Please, wait until the freelancer accepts or rejects your offer, or simply select another freeelancer if you do not want to wait anymore.',
  acceptOrRejectMessage: 'Congrats! You received a job offer! Please, accept or reject it.',
  contactWithFreelancerMessage: 'Wonderful! The contractor has accepted your offer! Please, contact them directly, and rate your contractor after the job is done.',
  contactWithClientMessage: 'Great! You have accepted this offer. Now please communicate with the client directly, and rate your experience as soon as you finish the job.',
  rateFreelancerMessage: 'The only thing left is to rate your contractor. How well was the job done?',
  rateClientMessage: 'The only thing left is to rate your client. How good was your experience with this client?',
  reviewFreelancerMessage: 'reviewFreelancerMessage',
  reviewClientMessage: 'reviewClientMessage',
  thanksReviewMessage: 'Thanks for the review!',
  youWereRated: 'You have received a new rating from ',
  clientHasChosenAnotherFreelancer: 'The client has chosen another freelancer.',
  noCandidatesMessage: 'There are no available candidates right now 😥 Please, check back later or create a new job.',
  thisWorkIsRemoved: 'This job has been deleted ✌️',
  shareProfile: 'Share profile',
  mainMenuOptions: {
    findJobs: '👤 Profile',
    findContractors: '⛑ Find contractors',
    help: '❔ Help',
  },
  clientMenuOptions: {
    postNewJob: '🔨 Post new job',
    myJobs: '🛠 My jobs',
    back: '🔙 Back',
  },
  freelanceMenuOptions: {
    editBio: '🖊 Edit bio',
    addBio: '🖊 Add bio',
    editCategories: '📌 Edit categories',
    addCategories: '📌 Add categories',
    editHourlyRate: '💲 Edit hourly rate',
    addHourlyRate: '💲 Add hourly rate',
    back: '🔙 Back',
    busy: '⚒ Busy',
    available: '✅ Available',
  },
  hourlyRateOptions: [
    '$0 – $5', '$5 – $10', '$10 – $20',
    '$20 – $30', '$30 – $40', '$40 – $50',
    '$50 – $75', '$75 – $100', '$100 – $200',
    '$200+',
  ],
  selectedCategory: '✅ ',
  selectedHourlyRate: '✅ ',
  categoryLeft: '<',
  categoryRight: '>',
  inlineSeparator: '~',
  categoryInline: 'cI',
  hourlyRateInline: 'hRI',
  adminBanInline: 'abI',
  freelancerInline: 'fI',
  freelancerPageInline: 'fPI',
  jobManageInline: 'jMI',
  freelancerJobInline: 'fJI',
  selectFreelancerInline: 'sFI',
  selectAnotherFreelancerInline: 'sAFI',
  freelancerAcceptInline: 'fAI',
  askRateClientInline: 'aRCI',
  askRateFreelancerInline: 'aRFI',
  rateClientInline: 'rCI',
  rateFreelancerInline: 'rFI',
  completeJobInline: 'cJI',
  reportJobInline: 'rpJI',
  reportFreelancerInline: 'rpFI',
  reportClientInline: 'rpCI',
  cancelJobCreationInline: 'cJCI',
  cancelBioEnterInline: 'cBEI',
  inputBioState: 'inputBioState',
  inputCategoryNameState: 'inputCategoryNameState',
  inputHourlyRateState: 'inputHourlyRateState',
  inputJobDescriptionState: 'inputJobDescriptionState',
  inputReportMessage: 'inputReportMessage',
  cancel: '❌ Cancel',
  jobCreateCancel: '❌ Cancel',
  selectFreelancerCancel: '❌ Cancel',
  jobSendAllFreelancers: 'Send to all',
  jobRefresh: 'Refresh',
  jobDelete: 'Delete',
  jobEdit: 'Edit',
  jobSelectFreelancer: 'Select contractor',
  jobSelectAnotherFreelancer: 'Select another contractor',
  jobBackPage: '<',
  jobNextPage: '>',
  interestedOption: '✅',
  notInterestedOption: '❌',
  acceptOption: '✅',
  refuseOption: '❌',
  pendingOption: '🕒',
  star: '⭐',
  bioReviews: 'Reviews:',
  saveReviewOption: 'saveReview',
  adminNotifications: {
    adminBanReviewInline: 'aBRI',
    adminDeleteReviewInline: 'aDRI',
    adminOkReviewInline: 'aORI',
    adminReviewDecision: 'Moderators have made a decision about the review.',
  },
  jobStates: {
    searchingForFreelancer: 'searchingForFreelancer',
    freelancerChosen: 'freelancerChosen',
    finished: 'finished',
    // todo: need to delete this later
    frozen: 'frozen',
    banned: 'banned',
    rated: 'rated',
    removed: 'removed',
  },
  reviewTypes: {
    byClient: 'byCl',
    byFreelancer: 'byFl',
  },
  freelancerOptions: {
    interested: 'Interested',
    notInterested: 'Not interested',
    report: '❗️ Report',
  },
  freelancerAcceptOptions: {
    accept: '✅ Accept',
    refuse: '❌ Refuse',
  },
  jobFinishedOptions: {
    rate: '⭐ Rate',
    report: '❗️ Report',
  },
  report: {
    thanks: 'Thanks you for your alertness!',
    reason: 'What is the report reason?',
  },
  rateOptions: {
    back: '🔙 Back',
    oneStar: '⭐',
    twoStars: '⭐⭐',
    threeStars: '⭐⭐⭐',
    fourStars: '⭐⭐⭐⭐',
    fiveStars: '⭐⭐⭐⭐⭐',
  },
  rateOptionsArray: [
    '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐',
  ],
  shouldUpdateJobMessage: 'shouldUpdateJobMessage',
  shouldUpdateFreelancerMessage: 'shouldUpdateFreelancerMessage',
  shouldMakeInterested: 'shouldMakeInterested',
  newReview: 'newReview',
};
