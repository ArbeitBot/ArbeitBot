/**
 * Storage for all the strings in project; change once, use everywhere ;)
 *
 * @module helpers/strings
 * @license MIT
 */

module.exports = {
  reportThankYouMessage: 'Спасибо за то, что сообщили нам о нарушении! Наши модераторы немедленно рассотрят вашу заявку и предпримут все необходимое(^_<)',
  banMessage: 'На вас подали жалобу, и наши модераторы приняли решение о вашей блокировке.  Если это ошибка, то обращайтесь к администратору @dsl1500 и мы посмотрим, что можно сделать;)',
  loadingMessage: '♔  Загрузка...',
  askForUsername: 'У вас нет никнейма! Пожалуйста заполните его в настройках телеграмма.',
  deprecatedMessage: 'Пролестните страницу вниз ⤵️',
  initialMessage: 'Добро пожаловать, это Job Maker DVFU! Мы рады, что вы пользуетесь нашими услугами и надеемся, что вы тоже останетесь довольны! (◕‿◕)	',
  mainMenuMessage: 'Выберите "Профиль" если ищите задание, либо – "Найти исполнителей".',
  noJobsExistMessage: 'У вас нет ни одного задания. Но вы можете его создать. (^_~)',
  clientMenuMessage: 'Пожалуйста, выберите оццию из меню',
  selectLanguageMessage: 'Пожалуйста, выберите язык, который вы будете использовать для написания задания, вы увидите только тех исполнителей, которые выбрали этот язык в качестве разговорного.',
  selectCategoryMessage: 'Please, select a category relevant to your job. The number of available contractors is displayed between [square brackets] for each category.',
  selectJobHourlyRateMessage: 'Please, select how much you would like to pay. The price is given in USD/hour to identify the skill levels of developers. You can negotiate a fixed price with the contractor later on. The number of available contractors is displayed between [square brackets] for each rate range.',
  addJobDescriptionMessage: 'Please, provide a job description (max 500 chars). It will be visible to contractors. Please, be brief – the details can be discussed with the contractors later on.',
  addJobDescriptionHideKeyboardMessage: 'You can cancel at any time at job creation message.',
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
  jobCreationSuccessMessage: 'Success! A new job has been created, we have sent it to you below ⤵️',
  pickFreelancersMessage: 'Please, select which contractors should receive job offers from you.',
  editBioMessage: 'Please, enter your bio (max 150 chars). Keep it brief but descriptive – the clients will see it beside your rating. Feel free to add a link to your personal website.',
  selectCandidateMessage: 'Please, select the candidate that you liked the most.',
  changedBioMessage: 'Congrats! Your new bio is:\n\n',
  notChangedBioMessage: 'Your bio not changed.\n\n',
  yourCurrentBio: 'Your current bio:',
  editHourlyRateMessage: 'What is your hourly rate? You will only receive job offers of relevant hourly rate.',
  editLanguageMessage: 'What languages do you speak? You will only receive job offers of selected languages.',
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
    findContractors: '⛑ Find freelancers',
    help: '❔ Help',
  },
  clientMenuOptions: {
    postNewJob: '🔨 Create new job',
    myJobs: '🛠 Created jobs',
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
    addLanguage: '🇺🇸 Add language',
  },
  hourlyRateOptions: [
    '$0 – $5', '$5 – $10', '$10 – $20',
    '$20 – $30', '$30 – $40', '$40 – $50',
    '$50 – $75', '$75 – $100', '$100 – $200',
    '$200+',
  ],
  selectedCategory: '✅ ',
  selectedHourlyRate: '✅ ',
  selectedLanguage: '✅ ',
  categoryLeft: '<',
  categoryRight: '>',
  inlineSeparator: '~',
  categoryInline: 'cI',
  hourlyRateInline: 'hRI',
  languageInline: 'lanI',
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
  inputLanguageInline: 'iLI',
  inputCategoryNameInline: 'iCNI',
  inputHourlyRateInline: 'iHRI',
  inputJobDescriptionInline: 'iJDI',
  jobCreationState: 'jobCreationState',
  inputBioState: 'inputBioState',
  inputLanguageState: 'inputLanguageState',
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
