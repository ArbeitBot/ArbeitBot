/**
 * Storage for all the strings in project; change once, use everywhere ;)
 *
 * @module helpers/strings
 * @license MIT
 */

const englishObjectId = '581d0b8db33e47e7008726bd'
const russianObjectId = '581d0b8db33e47e7008726be'

const english = {
  tutorialMessages: {
    initialMessage:
      'Not sure how this bot works? No worries — we got you covered. Just try one of the tutorials below.\n\nIf you are looking for freelancers, please select "Client tutorial"; if you are a freelancer looking for a job, please select "Freelancer tutorial".',
    initialFreelancerMessage:
      'The main purpose of @arbeit_bot is to provide potential clients with the list of all available freelancers who suit their needs. After a client creates a job, we send the list of freelancers with their bios and ratings. The client then reads through the bios and decides which freelancers should receive the initial job offers. If the client decides that you fit job requirements, you will get a message with the job description, buttons like the ones following this text and the client\'s rating if applicable.\n\nIf you select the "Report" or "Not interested" options, you will disappear from the list of available freelancers for this job. Selecting "Interested" will notify client about your interest in this job offer and add you to the list of the interested candidates. In case of the "Interested" and "Not interested" options you can change your mind after selection. Go ahead, respond to this job offer!\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    acceptFreelancerMessage:
      'Good job! We have notified the simulation of a client about your interest. On this step you should expect the client to contact you in the private messages to discuss the job details (in this case nobody will contact you in the private messages — this is just a tutorial). Please note that clients send their initial offers to multiple freelancers and multiple freelancers can indicate their interest.\n\nAfter the client has at least one interested candidate, the job can be offered to the one who suits it the best. If you are the chosen one, you receive the final job offer with two buttons: "Accept" and "Reject".\n\nLet us simulate the waiting period — please wait for 10 seconds while our client simulation is considering you for the job.\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    acceptFreelancerMessageNotInterested:
      'Looks like you did not like the job or the client rating — we respect your choice. This action would remove you from the available freelancers for this job, but for the sake of this tutorial we have picked the "Interested" option for you. Maybe, choice is only an illusion.\n\nWe have notified the simulation of a client about your interest. On this step you should expect the client to contact you in the private messages to discuss the job details (in this case nobody will contact you in the private messages — this is just a tutorial). Please note that clients send their initial offers to multiple freelancers and multiple freelancers can indicate their interest. After the client has at least one interested candidate, the job can be offered to the one who suits it the best. If you are the chosen one, you receive the final job offer with two buttons: "Accept" and "Reject".\n\nLet us simulate the waiting period — please wait for 10 seconds while our client simulation is considering you for the job.\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    acceptFreelancerMessageFinished:
      'We have notified the simulation of a client about your interest. On this step you should expect the client to contact you in the private messages to discuss the job details (in this case nobody will contact you in the private messages — this is just a tutorial). Please note that clients send their initial offers to multiple freelancers and multiple freelancers can indicate their interest. After the client has at least one interested candidate, the job can be offered to the one who suits it the best. If you are the chosen one, you receive the final job offer with two buttons: "Accept" and "Reject".\n\nLet us simulate the waiting period — please wait for 10 seconds while our client simulation is considering you for the job.\n\nIf you read this message, 10 seconds have passed, and it looks like the client preferred you to the other interested freelancers — now you see the username of the client and buttons "Accept" and "Refuse". It would be a great idea to finalize the terms and the details of the job in private messages with the client before choosing whether to accept or reject the final job offer.\n\nPlease note that refusing a job offer is the same as selecting "Not interested" — it gets you out of the available freelancers list. Be careful though — refusing a job offer cannot be undone. Also you can finally see the client\'s username.\n\n@arbeit_bot ⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    rateFreelancerMessage:
      'Wonderful! You have just accepted the job offer. The next step would be to complete the job in real life and either rate the client or report if you find that something was inappropriate. Reporting a client will trigger a moderators investigation.\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    rateFreelancerMessageRefused:
      'Wow! Did not see that coming — you dropped the job offer. Keep in mind that in this case the client will not be able to send you a job offer again.\n\nFor the sake of this tutorial, let\'s assume that you have just accepted the job offer. The next step would be to complete the job in real life and either rate the client or report if you find that something was inappropriate. Reporting a client will trigger a moderators investigation.\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    endFreelancerMessage:
      'Selecting "Rate" triggers the very last step of the job process — rating your experience with a particular client. Later on, when this client will create a new job, freelancers will be able to see this rating. Let\'s pretend that the job is done; go ahead — rate the client!\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    endFreelancerMessageReport:
      'Ugh, this happens sometimes — you reported the client for something nasty. In this case our moderators will start investigation and will try to dispense the justice. But let\'s pretend that the job is done and everything went well.\n\nSelecting "Rate" triggers the very last step of the job process — rating your experience with a particular client. Later on, when this client will create a new job, freelancers will be able to see this rating. Go ahead — rate the client!\n\n⭐️⭐️⭐️⭐️ (10)\n[Web backend]\nWe need a web-service to be built. We already have a mobile developer on our team as well as a frontend developer. We believe that this is going to be the next big thing. Just three words: "Facebook for cats" — imagine the market size and the potential we have. Our perfect candidate knows C#, PHP and JavaScript well.',
    freelancerTutorialEnd:
      'Congratulations! You have successfully completed our freelancer tutorial. That was all you need to receive job offers and respond to them. Please, make sure to complete your "Profile" so that clients can send you job offers like the one simulated today.\n\nAlso, it would be a good idea to try our client tutorial to understand how job process works on the other side — you can do that by going to "Help" first. Good luck!',
    clientTutorialLanguage:
      "Welcome to the client tutorial of @abreit_bot! Here you will learn how to create jobs and search for the freelancers. We tried to simulate the job creation process as close to real life as possible.\n\nLet's create your first job. Don't worry — nobody will see it and it will not be live — this is just a simulation.\n\nPlease, proceed by picking the language of your job. If you select English, only the freelancers who picked English as one of their languages (they can pick multiple languages) will be visible to you for this job. Same applies to Russian. We would suggest picking Russian only when you write the job description in Russian.",
    clientTutorialSupercategory:
      'Well done! Now please select the category relevant to the job. Keep in mind that you can only select one category per job. As well as note that we have more than 3 categories — you see the short list for the sake of this tutorial.\n\nYou can see the number of available freelancers for each category between the [square brackets].',
    clientTutorialCategory:
      'Let\'s assume that you have selected "Development" on the previous step that had 68 available freelancers.\n\nPlease, also select a relevant subcategory for the job. You can see the number of available freelancers for each subcategory between the [square brackets].',
    clientTutorialInterestedFreelancers:
      'Wonderful! Aside of adding a language, a category and a subcategory to your job, you will be required to add an hourly rate and a description in the real-life scenario. But we will keep this tutorial short.\n\nLet\'s make another assumption: say, you have selected "Backend development" subcategory that had only one freelancer available. As soon as you finish creating a job, we send you the list of all the available freelancers that match the job requirements with their bio and rating (if applicable).\n\nNow you can click the buttons with the usernames of the freelancers whose bios you liked, and they will receive an initial offer. 🕒 beside a freelancer indicates that they have received your initial offer. Then freelancers can either select the "Interested" or "Not interested" option. ✅ beside a freelancer indicates their interest in the job offer. If a freelancer indicated that they are not interested in the job, they would simply disappear from the list of the available freelancers.\n\nWe tried to simulate the difference between 🕒 and ✅ by making the simulations of freelancers to respond with the "Interested" option in 10 seconds after receiving a job offer.\n\nAfter at least one freelancer becomes interested in your job, you unlock the "Select contractor" button — clicking it will allow you to select the freelancer from interested candidates. This freelancer will actually do the job for you.\n\nGo ahead — give a job offer to @borodutch and after he indicates the interest, select him as a contractor.\n\n@borodutch\nBackend developer — Node.js, Python, RoR expert. Fully capable of architecting complex structures.',
    clientTutorialPickFreelancer:
      'Looks like @borodutch was the only one who indicated the interest in the job. At this point you would contact all the interested candidates in the private messages, discuss the job details with them and decide who should receive the final job offer.\n\nGo on — select @borodutch as your contractor for this job!\n\n@borodutch\nBackend developer — Node.js, Python, RoR expert. Fully capable of architecting complex structures.',
    clientTutorialRate:
      "Great! Almost there. You selected @borodutch as your contractor. Now it's the time to do the work. Please communicate with the selected freelancer in private messages. When the job is done you can either rate or report the freelancer.",
    clientTutorialFinishRate:
      'Woohoo! Looks like everything is done. Let\'s say that your job is completed — the only thing left is to rate the experience with your freelancer. This rating will be visible to the other clients on @arbeit_bot. Note that after you select "Report" button our fellow moderators will start investigation to dispense the justice.\n\nGo ahead and rate the freelancer!',
    clientTutorialFinishRateReport:
      'Well, this happens sometimes. You have reported @borodutch for some nasty reason. After you select the "Report" option our fellow moderators start investigation to dispense the justice.\n\nHowever, let\'s assume that the "Rate" button was pressed. The only thing left is rating the experience with the freelancer. This rating will be visible to the other clients on @arbeit_bot. Go ahead and rate the freelancer!',
    clientTutorialEnd:
      'Congratulations! You have successfully completed the client tutorial. That was all you need to create and distribute job offers.\n\nAs a side note, it would be a good idea to try the freelancer tutorial to understand how the job process looks like from the other side — you can do that by going to the "Help" first.\n\nYou are all set — go ahead and create your first job. Good luck!',
  },
  tutorialButtons: {
    freelancerTutorial: 'Freelancer tutorial',
    clientTutorial: 'Client tutorial',
  },
  tutorialButton: 'Launch tutorial',
  tutorialInline: 'tI',
  freelancerTutorialInline: 'fTI',
  freelancerTutorialInterestedInline: 'fTII',
  freelancerTutorialAcceptedInline: 'fTAI',
  freelancerTutorialRatedInline: 'fTRI',
  freelancerTutorialEndInline: 'fTEI',
  clientTutorialInline: 'cTI',
  clientTutorialLanguageInline: 'cTLI',
  clientTutorialSupercategoryInline: 'cTSI',
  clientTutorialCategoryInline: 'cTCI',
  clientTutorialFreelancersInline: 'cTFI',
  clientTutorialSelectFreelancer: 'cTSF',
  clientTutorialAcceptFreelancerInline: 'cTAFI',
  clientTutorialRatedInline: 'cTRI',
  clientTutorialEndInline: 'cTEI',
  showBio: 'Show bio',
  resubscribe: 'Resubscribe',
  unsubscribe: 'Unsubscribe',
  hideButtons: 'Keep',
  jobCreationFindFreelancerReminderMessage1:
    'It looks like you created this job yesterday:',
  jobCreationFindFreelancerReminderMessage2:
    "but didn't have a chance to find the freelancers. If you need assitance, please contact our support by clicking the button below. Thank you!",
  anotherJobDraftErrorMessage:
    'You are already entering description for another job draft. Please either cancel the currently active job draft or provide us with the job description for the currently active job draft.',
  reportThankYouMessage:
    'Thank you for reporting this suspicious activity! Our moderators will take immediate action to prevent reported behaviour in the future.',
  banMessage:
    'It looks like you have been reported, and our moderators decided that there was a reason to ban you. If this is a mistake, please let us know @borodutch – we will see what we can do 👍',
  loadingMessage: '🦄 Loading...',
  askForUsername:
    "It looks like you don't have a username. Please, set it up in Telegram settings.",
  deprecatedMessage:
    'This message is deprecated, please scroll down to see the new message ⤵️',
  initialMessage:
    'Welcome to the first free opensource Telegram freelance market.\n\nIf you are looking for a job, please fill out your "Profile". Otherwise, you can proceed to "Find freelancers". Click "Help" if you have any questions.\n\nThank you for joining our friendly family!',
  mainMenuMessage:
    'Select "Profile" if you are looking for a job, otherwise – "Find freelancers".',
  noJobsExistMessage:
    'You do not have any jobs yet. You can create one by clicking "Create new job" button.',
  clientMenuMessage: 'Please, select an option from the menu below.',
  selectLanguageMessage:
    'Please, select what language will you use for your job description. You will only see the freelancers who selected this language as one of their means of communication.',
  selectSupercategoryMessage:
    'Please, select a category relevant to your job. The number of available contractors is displayed between [square brackets] for each category.',
  selectCategoryMessage:
    'Please, select a subcategory relevant to your job. The number of available contractors is displayed between [square brackets] for each subcategory.',
  selectJobHourlyRateMessage:
    'Please, select how much you would like to pay. The price is given in USD/hour to identify the skill levels of developers. You can negotiate a fixed price with the contractor later on. The number of available contractors is displayed between [square brackets] for each rate range.',
  addJobDescriptionMessage:
    'Please, provide a job description (100-500 chars). It will be visible to contractors. Please, be brief – the details can be discussed with the contractors later on.',
  jobDescriptionErrorMessage:
    'Please make sure that your job description is between 100 and 500 chars.',
  bioErrorMessage: 'Please make sure that your bio fits in 150 chars.',
  addJobDescriptionHideKeyboardMessage:
    'You can cancel at any time at job creation message.',
  addBioHideKeyboardMessage: 'You can cancel at any time.',
  filledEverythingMessage:
    'You did it! Your profile is now complete. Now just sit back and wait for job offers.',
  fullFreelancerMessageAvailable:
    'Your profile is complete! Now just sit back and wait for job offers.',
  fullFreelancerMessageBusy:
    'Your profile is complete! However, clients will not contact you since your status is "Busy".',
  emptyFreelancerMessage:
    'Welcome to your freelancer profile! Please, fill out your bio, select your hourly rate and categories of expertise.',
  missingFreelancerMessage:
    'Welcome to your freelancer profile! You need both to fill out your bio and select your hourly rate and categories of expertise so that clients can see you.',
  helpMessage:
    'If you want to learn more about this bot, please go to arbeitbot.com.\n\nIf you have any questions, concerns or just found a bug, please read our support channel @borodutch_support.\n\nIf you would like to learn how this bot works, please click the relevant button below.\n\nIn case you want to see the code of @arbeit_bot on GitHub, please follow the link provided below. We would appreciate if you could star our repository as well.\n\nThank you a lot for your support!',
  becameBusyMessage:
    'You just set your status to "Busy". You will not receive any new job offers until you switch back to "Available".',
  becameAvailableMessage:
    'You just switched to "Available" status. You will now receive relevant job offers until you switch back to "Busy".',
  missingBecameBusyMessage:
    'You just changed your status to "Busy". But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  missingBecameAvailableMessage:
    'You just changed to "Available" status.  But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  jobCreationSuccessMessage:
    'Success! A new job has been created, we have sent it to you below ⤵️',
  pickFreelancersMessage:
    'Please, select which contractors should receive job offers from you.',
  editBioMessage:
    'Please, enter your bio (max 150 chars). Keep it brief but descriptive – the clients will see it beside your rating. Feel free to add a link to your personal website.',
  selectCandidateMessage:
    'Please, select the candidate that you liked the most.',
  changedBioMessage: 'Congrats! Your new bio is:\n\n',
  notChangedBioMessage: 'Your bio not changed.\n\n',
  yourCurrentBio: 'Your current bio:',
  editHourlyRateMessage:
    'What is your hourly rate? You will only receive job offers of relevant hourly rate.',
  editLanguageMessage:
    'What languages do you speak? You will only receive job offers of selected languages.',
  editInterfaceLanguageMessage:
    'Please select your language of preference. This option will only affect the user interface of the bot. It will not affect your ability to receive or post job offers.',
  pickCategoriesMessage:
    'Please, select your skills. You will only receive job offers in categories you select.',
  suggestCategoryMessage: 'Suggest your own category',
  waitContractorResponseMessage:
    'You sent an offer to one of the freelancers. Please, wait until the freelancer accepts or rejects your offer, or simply select another freelancer if you do not want to wait anymore.',
  acceptOrRejectMessage:
    'Congrats! You received a job offer! Please, accept or reject it.',
  freelancerInterestedNotification: ' became interested in ',
  contactWithFreelancerMessage:
    'Wonderful! The contractor has accepted your offer! Please, contact them directly, and rate your contractor after the job is done.',
  contactWithClientMessage:
    'Great! You have accepted this offer. Now please communicate with the client directly, and rate your experience as soon as you finish the job.',
  rateFreelancerMessage:
    'The only thing left is to rate your contractor. How well was the job done?',
  rateClientMessage:
    'The only thing left is to rate your client. How good was your experience with this client?',
  reviewFreelancerMessage: 'reviewFreelancerMessage',
  reviewClientMessage: 'reviewClientMessage',
  thanksReviewMessage: 'Thanks for the review!',
  youWereRated: 'You have received a new rating from ',
  clientHasChosenAnotherFreelancer: 'The client has chosen another freelancer.',
  noCandidatesMessage:
    'There are no available candidates right now 😥 Please, check back later or create a new job.',
  thisWorkIsRemoved: 'This job has been deleted ✌️',
  thisDraftIsRemoved: 'This job draft has been deleted ✌️',
  shareProfile: 'Share profile',
  mainMenuOptions: {
    findJobs: '👤 Profile',
    findContractors: '⛑ Find freelancers',
    help: '❔ Help',
    chooseLanguage: '📣 Choose language',
  },
  clientMenuOptions: {
    postNewJob: '🔨 Create new job',
    myJobs: '🛠 Created jobs',
    back: '🔙 Back',
  },
  changeTo: 'Change to: ',
  back: '🔙 Back',
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
    '$0 – $5',
    '$5 – $10',
    '$10 – $20',
    '$20 – $30',
    '$30 – $40',
    '$40 – $50',
    '$50 – $75',
    '$75 – $100',
    '$100 – $200',
    '$200+',
  ],
  hourlyRateAllRatesOption: 'All hourly rates',
  selectedCategory: '✅ ',
  selectedHourlyRate: '✅ ',
  selectedLanguage: '✅ ',
  categoryLeft: '<',
  categoryRight: '>',
  inlineSeparator: '~',
  categoryInline: 'cI',
  hourlyRateInline: 'hRI',
  interfaceLanguageInline: 'iLanI',
  languageInline: 'lanI',
  adminBanInline: 'abI',
  freelancerInline: 'fI',
  freelancerPageInline: 'fPI',
  jobManageInline: 'jMI',
  freelancerJobInline: 'fJI',
  freelancerJobEditInline: 'fJEI',
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
  categoryBackInline: 'cBaI',
  supercategoryBackInline: 'sCBaI',
  hourlyRateBackInline: 'hRBaI',
  cancelBioEnterInline: 'cBEI',
  inputLanguageInline: 'iLI',
  inputSupercategoryNameInline: 'iSCNI',
  inputCategoryNameInline: 'iCNI',
  inputHourlyRateInline: 'iHRI',
  inputJobDescriptionInline: 'iJDI',
  inputBioCancelInline: 'iBCI',
  unsubscripeFromGodvoiceInline: 'uFGI',
  hideButtonsGodvoiceInline: 'hBGI',
  resubscribeGodvoiceInline: 'rGVI',
  showBioInline: 'sBI',
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
    /** todo: need to delete this later */
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
  rateOptionsArray: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
  shouldUpdateJobMessage: 'shouldUpdateJobMessage',
  shouldUpdateFreelancerMessage: 'shouldUpdateFreelancerMessage',
  shouldMakeInterested: 'shouldMakeInterested',
  newReview: 'newReview',
}

const russian = {
  showBio: 'Show bio',
  resubscribe: 'Переподписаться',
  unsubscribe: 'Отписаться',
  hideButtons: 'Оставить',
  jobCreationFindFreelancerReminderMessage1: 'Похоже, Вы вчера создали работу:',
  jobCreationFindFreelancerReminderMessage2:
    'но так и не выбрали фрилансера. Если Вам нужна какая-либо помощь или у Вас есть какие-либо вопросы, пожалуйста, напишите нам в техподдержку, нажав на кнопку ниже. Спасибо!',
  anotherJobDraftErrorMessage:
    'Вы уже вводите описание для другого черновика работы. Пожалуйста, либо отмените активный черновик работы, либо введите описание работы.',
  reportThankYouMessage:
    'Спасибо за репорт! Модераторы уже занимаются этим вопросом. Постараемся избежать подобных казусов в будущем.',
  banMessage:
    'Похоже, Вас кто-то зарепортил, а модераторы решили, что было за что. В итоге, Вас забанили. Пожалуйста, напишите нам в поддержку @borodutch, если произошла какая-то ошибка — разберемся 👍',
  loadingMessage: '🦄 Загрузка...',
  askForUsername:
    'Похоже, у Вас еще нет юзернейма в Телеграме. Пожалуйста, зайдите в настройки Телеграма и установите себе юзернейм. Спасибо!',
  deprecatedMessage:
    'Это сообщение устарело. Пожалуйста, пролистайте вниз, чтобы увидеть новую версию сообщения ⤵️',
  initialMessage:
    'Добро пожаловать на первую бесплатную фриланс-биржу с открытым кодом в Телеграме.\n\nЕсли вы ищете работу, пожалуйста, заполните свой "Профиль". Если вы ищете фрилансеров, пройдите в "Найти фрилансеров". Жмите "Помощь", если у вас есть какие-либо вопросы.\n\nСпасибо за то, что стали частью нашей дружной семьи!',
  mainMenuMessage:
    'Выберите "Профиль", если ищете работу. Если ищете фрилансеров — выберите "Найти фрилансеров".',
  noJobsExistMessage:
    'У вас еще нет созданных работ. Вы можете создать работу, нажав на "Создать работу".',
  clientMenuMessage: 'Пожалуйста, выберите пункт меню.',
  selectLanguageMessage:
    'Пожалуйста, выберите, на каком языке будет работа. Мы покажем Вам только тех фрилансеров, которые умеют говорить на этом языке.',
  selectSupercategoryMessage:
    'Пожалуйста, выберите категорию своей работе. Количество готовых к работе фрилансеров для каждой категории обозначено [квадратными скобками].',
  selectCategoryMessage:
    'Please, select a subcategory relevant to your job. The number of available contractors is displayed between [square brackets] for each subcategory.',
  selectJobHourlyRateMessage:
    'Please, select how much you would like to pay. The price is given in USD/hour to identify the skill levels of developers. You can negotiate a fixed price with the contractor later on. The number of available contractors is displayed between [square brackets] for each rate range.',
  addJobDescriptionMessage:
    'Please, provide a job description (100-500 chars). It will be visible to contractors. Please, be brief – the details can be discussed with the contractors later on.',
  jobDescriptionErrorMessage:
    'Please make sure that your job description is between 100 and 500 chars.',
  bioErrorMessage: 'Please make sure that your bio fits in 150 chars.',
  addJobDescriptionHideKeyboardMessage:
    'You can cancel at any time at job creation message.',
  addBioHideKeyboardMessage: 'You can cancel at any time.',
  filledEverythingMessage:
    'You did it! Your profile is now complete. Now just sit back and wait for job offers.',
  fullFreelancerMessageAvailable:
    'Your profile is complete! Now just sit back and wait for job offers.',
  fullFreelancerMessageBusy:
    'Your profile is complete! However, clients will not contact you since your status is "Busy".',
  emptyFreelancerMessage:
    'Welcome to your freelancer profile! Please, fill out your bio, select your hourly rate and categories of expertise.',
  missingFreelancerMessage:
    'Welcome to your freelancer profile! You need both to fill out your bio and select your hourly rate and categories of expertise so that clients can see you.',
  helpMessage:
    'If you want to learn more about this bot, please go to arbeitbot.com.\n\nIf you have any questions, concerns or just found a bug, please, read our support channel @borodutch_support.\n\nIf you would like to learn how this bot works, please click the relevant button below.\n\nIn case you want to see the code of @arbeit_bot on GitHub, please follow the link provided below. We would appreciate if you could star our repository as well.\n\nThank you a lot for your support!',
  becameBusyMessage:
    'You just set your status to "Busy". You will not receive any new job offers until you switch back to "Available".',
  becameAvailableMessage:
    'You just switched to "Available" status. You will now receive relevant job offers until you switch back to "Busy".',
  missingBecameBusyMessage:
    'You just changed your status to "Busy". But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  missingBecameAvailableMessage:
    'You just changed to "Available" status.  But this doesn\'t make much difference since clients will not be able to find you without properly filled bio, categories and hourly rate.',
  jobCreationSuccessMessage:
    'Success! A new job has been created, we have sent it to you below ⤵️',
  pickFreelancersMessage:
    'Please, select which contractors should receive job offers from you.',
  editBioMessage:
    'Please, enter your bio (max 150 chars). Keep it brief but descriptive – the clients will see it beside your rating. Feel free to add a link to your personal website.',
  selectCandidateMessage:
    'Please, select the candidate that you liked the most.',
  changedBioMessage: 'Congrats! Your new bio is:\n\n',
  notChangedBioMessage: 'Your bio not changed.\n\n',
  yourCurrentBio: 'Your current bio:',
  editHourlyRateMessage:
    'What is your hourly rate? You will only receive job offers of relevant hourly rate.',
  editLanguageMessage:
    'What languages do you speak? You will only receive job offers of selected languages.',
  editInterfaceLanguageMessage:
    'Please select your language of preference. This option will only affect the user interface of the bot. It will not affect your ability to receive or post job offers.',
  pickCategoriesMessage:
    'Please, select your skills. You will only receive job offers in categories you select.',
  suggestCategoryMessage: 'Suggest your own category',
  waitContractorResponseMessage:
    'You sent an offer to one of the freelancers. Please, wait until the freelancer accepts or rejects your offer, or simply select another freelancer if you do not want to wait anymore.',
  acceptOrRejectMessage:
    'Congrats! You received a job offer! Please, accept or reject it.',
  freelancerInterestedNotification: ' became interested in ',
  contactWithFreelancerMessage:
    'Wonderful! The contractor has accepted your offer! Please, contact them directly, and rate your contractor after the job is done.',
  contactWithClientMessage:
    'Great! You have accepted this offer. Now please communicate with the client directly, and rate your experience as soon as you finish the job.',
  rateFreelancerMessage:
    'The only thing left is to rate your contractor. How well was the job done?',
  rateClientMessage:
    'The only thing left is to rate your client. How good was your experience with this client?',
  reviewFreelancerMessage: 'reviewFreelancerMessage',
  reviewClientMessage: 'reviewClientMessage',
  thanksReviewMessage: 'Thanks for the review!',
  youWereRated: 'You have received a new rating from ',
  clientHasChosenAnotherFreelancer: 'The client has chosen another freelancer.',
  noCandidatesMessage:
    'There are no available candidates right now 😥 Please, check back later or create a new job.',
  thisWorkIsRemoved: 'This job has been deleted ✌️',
  thisDraftIsRemoved: 'This job draft has been deleted ✌️',
  shareProfile: 'Share profile',
  mainMenuOptions: {
    findJobs: '👤 Профиль',
    findContractors: '⛑ Найти фрилансеров',
    help: '❔ Помощь',
    chooseLanguage: '📣 Сменить язык',
  },
  clientMenuOptions: {
    postNewJob: '🔨 Создать работу',
    myJobs: '🛠 Созданные работы',
    back: '🔙 Назад',
  },
  changeTo: 'Сменить на: ',
  back: '🔙 Назад',
  freelanceMenuOptions: {
    editBio: '🖊 Редактировать био',
    addBio: '🖊 Добавить био',
    editCategories: '📌 Редактировать категории',
    addCategories: '📌 Добавить категории',
    editHourlyRate: '💲 Редактировать часовую ставку',
    addHourlyRate: '💲 Добавить часовую ставку',
    back: '🔙 Назад',
    busy: '⚒ Заняты',
    available: '✅ Доступны',
    addLanguage: '🇺🇸 Добавить язык',
  },
  hourlyRateOptions: [
    '$0 – $5',
    '$5 – $10',
    '$10 – $20',
    '$20 – $30',
    '$30 – $40',
    '$40 – $50',
    '$50 – $75',
    '$75 – $100',
    '$100 – $200',
    '$200+',
  ],
  hourlyRateAllRatesOption: 'All hourly rates',
  selectedCategory: '✅ ',
  selectedHourlyRate: '✅ ',
  selectedLanguage: '✅ ',
  categoryLeft: '<',
  categoryRight: '>',
  inlineSeparator: '~',
  categoryInline: 'cI',
  hourlyRateInline: 'hRI',
  interfaceLanguageInline: 'iLanI',
  languageInline: 'lanI',
  adminBanInline: 'abI',
  freelancerInline: 'fI',
  freelancerPageInline: 'fPI',
  jobManageInline: 'jMI',
  freelancerJobInline: 'fJI',
  freelancerJobEditInline: 'fJEI',
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
  categoryBackInline: 'cBaI',
  supercategoryBackInline: 'sCBaI',
  hourlyRateBackInline: 'hRBaI',
  cancelBioEnterInline: 'cBEI',
  inputLanguageInline: 'iLI',
  inputSupercategoryNameInline: 'iSCNI',
  inputCategoryNameInline: 'iCNI',
  inputHourlyRateInline: 'iHRI',
  inputJobDescriptionInline: 'iJDI',
  inputBioCancelInline: 'iBCI',
  unsubscripeFromGodvoiceInline: 'uFGI',
  hideButtonsGodvoiceInline: 'hBGI',
  resubscribeGodvoiceInline: 'rGVI',
  showBioInline: 'sBI',
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
    /** todo: need to delete this later */
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
  rateOptionsArray: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
  shouldUpdateJobMessage: 'shouldUpdateJobMessage',
  shouldUpdateFreelancerMessage: 'shouldUpdateFreelancerMessage',
  shouldMakeInterested: 'shouldMakeInterested',
  newReview: 'newReview',
}

/**
 * Function to get the right language file
 * @param {Mongoose:User} user User that requests file
 * @return {Object[String:String]} Object containing localization strings
 */
function locale(user) {
  if (
    !user ||
    !user.interfaceLanguage ||
    String(user.interfaceLanguage._id) === englishObjectId ||
    String(user.interfaceLanguage) === englishObjectId
  ) {
    return english
  } else {
    return russian
  }
}

/** Exports */
module.exports = locale
