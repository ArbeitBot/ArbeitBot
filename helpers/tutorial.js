/**
 * Used to walk user through tutorial
 *
 * @module helpers/tutorial
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const strings = require('./strings');
const adminReports = require('./adminReports');

/**
 * Called when user touches 'Tutorial' on help inline keyboard
 */
global.eventEmitter.on(strings().tutorialInline, ({ bot, user }) => {
  sendTutorial(bot, user);
});

/**
 * Called when user selects freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialInline, ({ bot, user, msg }) => {
  startFreelancerTutorial(bot, user, msg);
});

/**
 * Called when user selects interested/report/not interested option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialInterestedInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];
  sendAcceptOrRefuseFreelancerTutorial(bot, user, msg, command === strings().freelancerOptions.interested);
});

/**
 * Called when user selects accept/refuse option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialAcceptInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];

  sendRateFreelancerTutorial(bot, user, msg, command === strings().freelancerAcceptOptions.accept);
});

/**
 * Called when user selects rate/report option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialRatedInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];

  sendEndFreelancerTutorial(bot, user, msg, command === strings().jobFinishedOptions.rate);  
});

/**
 * Called when user selects rating in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialEndInline, ({ bot, user, msg }) => {
  adminReports.freelancerTutorialEnded(bot, user);

  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.freelancerTutorialEnd, []);
});

/**
 * Called when user selects client tutorial
 */
global.eventEmitter.on(strings().clientTutorialInline, ({ bot, user, msg }) => {
  startClientTutorial(bot, user, msg);
});

/**
 * Called when user selects language at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialLanguageInline, ({ bot, user, msg }) => {
  showSupercategoriesClientTutorial(bot, user, msg);
});

/**
 * Called when user selects supercategory at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialSupercategoryInline, ({ bot, user, msg }) => {
  showCategoriesClientTutorial(bot, user, msg);
});

/**
 * Called when user selects category at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialCategoryInline, ({ bot, user, msg }) => {
  showFreelancersClientTutorial(bot, user, msg);
});

/**
 * Called when user selects freelancer as a candidate at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialFreelancersInline, ({ bot, user, msg }) => {
  selectFreelancerClientTutorial(bot, user, msg);
});

/**
 * Used to send initial tutorial message to user
 * @param {Telegram:Bot} bot Bot that should send tutorial
 * @param {Mongoose:User} user User that should receive tutorial
 */
function sendTutorial(bot, user) {
  const keyboard = [
    [{ text: strings().tutorialButtons.freelancerTutorial, callback_data: strings().freelancerTutorialInline}],
    [{ text: strings().tutorialButtons.clientTutorial, callback_data: strings().clientTutorialInline}],
  ];
  keyboards.sendInline(bot, user.id, strings().tutorialMessages.initialMessage, keyboard);
}

/** Freelancer tutorial */

/**
 * Used to send first freelancer tutorial message
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 */
function startFreelancerTutorial(bot, user, msg) {
  adminReports.freelancerTutorialStarted(bot, user);

  const keyboard = [
    [{ text: strings().freelancerOptions.interested, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.interested}`}],
    [{ text: strings().freelancerOptions.notInterested, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.notInterested}`}],
    [{ text: strings().freelancerOptions.report, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.report}`}]
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.initialFreelancerMessage, keyboard);
}

/**
 * Used to send second step in freelancer tutorial about reject\accept
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 * @param {Boolean} wasInterested Identifies whether selected option was interested or not
 */
function sendAcceptOrRefuseFreelancerTutorial(bot, user, msg, wasInterested) {
  const keyboard = [];
  const message = (wasInterested) ? strings().tutorialMessages.acceptFreelancerMessage : strings().tutorialMessages.acceptFreelancerMessageNotInterested;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, `${message}\n\n${strings().loadingMessage}`, keyboard);

  setTimeout(() => {
    const keyboard = [
    [{ text: strings().freelancerAcceptOptions.accept, callback_data: `${strings().freelancerTutorialAcceptInline}${strings().inlineSeparator}${strings().freelancerAcceptOptions.accept}`}],
    [{ text: strings().freelancerAcceptOptions.refuse, callback_data: `${strings().freelancerTutorialAcceptInline}${strings().inlineSeparator}${strings().freelancerAcceptOptions.refuse}`}],
    ];
    const message = strings().tutorialMessages.acceptFreelancerMessageFinished;
    keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
    return;
  }, 10000);
}

/**
 * Used to send third step in freelancer tutorial about rating
 * @param {Telegram:Bot} bot Bot that should edit message
 * @param {Mongoose:User} user Owner of this message
 * @param {Telegram:Message} msg Message that should be modified
 * @param {Boolean} isAccept Boolean identifying if user selected accept or not
 */
function sendRateFreelancerTutorial(bot, user, msg, isAccept) {
  const keyboard = [
    [{ text: strings().jobFinishedOptions.rate, callback_data: `${strings().freelancerTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.rate}`},
    { text: strings().jobFinishedOptions.report, callback_data: `${strings().freelancerTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.report}`}],
  ];
  const message = (isAccept) ? strings().tutorialMessages.rateFreelancerMessage : strings().tutorialMessages.rateFreelancerMessageRefused;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
}

function sendEndFreelancerTutorial(bot, user, msg, isRate) {
  const keyboard = keyboards.rateKeyboard(strings().freelancerTutorialEndInline);
  const message = (isRate) ? strings().tutorialMessages.endFreelancerMessage : strings().tutorialMessages.endFreelancerMessageReport;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
}

/** Client tutorial */

/**
 * Used to send first client tutorial message
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 */
function startClientTutorial(bot, user, msg) {
  adminReports.clientTutorialStarted(bot, user);
  const keyboard = [
    [{ text: '🇺🇸', callback_data: `${strings().clientTutorialLanguageInline}${strings().inlineSeparator}🇺🇸`},
    { text: '🇷🇺', callback_data: `${strings().clientTutorialLanguageInline}${strings().inlineSeparator}🇷🇺`}],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialLanguage, keyboard);
}

/**
 * Used to send supercategory picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showSupercategoriesClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: 'Design [10]', callback_data: strings().clientTutorialSupercategoryInline }],
    [{ text: 'Development [3]', callback_data: strings().clientTutorialSupercategoryInline}],
    [{ text: 'Copywriting [57]', callback_data: strings().clientTutorialSupercategoryInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialSupercategory, keyboard);
}

/**
 * Used to send category picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showCategoriesClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: 'iOS [10]', callback_data: strings().clientTutorialCategoryInline }],
    [{ text: 'Backend development [3]', callback_data: strings().clientTutorialCategoryInline}],
    [{ text: 'Unity [57]', callback_data: strings().clientTutorialCategoryInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialCategory, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send freelancer picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showFreelancersClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: `@borodutch`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}borodutch` }],
    [{ text: `@alexzzz9`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}alexzzz9` }],
    [{ text: `@nof1000`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}nof1000` }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send select freelancer at select candidate tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function selectFreelancerClientTutorial(bot, user, msg) {
  const candidate = msg.data.split(strings().inlineSeparator)[1];
  /** 0 = empty, 1 = pending, 2 = interested */
  const states = {
    'borodutch': 0,
    'alexzzz9': 0,
    'nof1000': 0,
  }
  if (msg.data.split(strings().inlineSeparator).length > 2) {
    const data = msg.data.split(strings().inlineSeparator)[2];
    if (data.indexOf('1') > -1) {
      states['borodutch'] = 1;
    } else if (data.indexOf('2') > -1) {
      states['borodutch'] = 2;
    }
    if (data.indexOf('3') > -1) {
      states['alexzzz9'] = 1;
    } else if (data.indexOf('4') > -1) {
      states['alexzzz9'] = 2;
    }
    if (data.indexOf('5') > -1) {
      states['nof1000'] = 1;
    } else if (data.indexOf('6') > -1) {
      states['nof1000'] = 2;
    }
  }
  let needsChekmarkTimer = false;
  if (states[candidate] === 0) {
    needsChekmarkTimer = true;
    states[candidate] = 1;
  }

  let borodutchState = '';
  let alexzzz9State = '';
  let nof1000State = '';

  let extraData = '';
  Object.keys(states).forEach((key) => {
    if (key === 'borodutch') {
      if (states[key] === 1) {
        borodutchState = strings().pendingOption+' ';
        extraData = `${extraData}1`;
      } else if (states[key] === 2) {
        borodutchState = strings().acceptOption+' ';
        extraData = `${extraData}2`;
      }
    }
    if (key === 'alexzzz9') {
      if (states[key] === 1) {
        extraData = `${extraData}3`;
        alexzzz9State = strings().pendingOption+' ';
      } else if (states[key] === 2) {
        extraData = `${extraData}4`;
        alexzzz9State = strings().acceptOption+' ';
      }
    }
    if (key === 'nof1000') {
      if (states[key] === 1) {
        extraData = `${extraData}5`;
        nof1000State = strings().pendingOption+' ';
      } else if (states[key] === 2) {
        extraData = `${extraData}6`;
        nof1000State = strings().acceptOption+' ';
      }
    }
  });

  const keyboard = [
    [{ text: `${borodutchState}@borodutch`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}borodutch${strings().inlineSeparator}${extraData}` }],
    [{ text: `${alexzzz9State}@alexzzz9`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}alexzzz9${strings().inlineSeparator}${extraData}` }],
    [{ text: `${nof1000State}@nof1000`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}nof1000${strings().inlineSeparator}${extraData}` }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .then(() => {
      const randomDelay = Math.floor(Math.random() * 60) + 10;
      setTimeout(() => {
        selectFreelancerInterestedClientTutorial(bot, user, msg);
      }, randomDelay * 1000);
    })
    .catch(/** todo: handle error */);
}

/**
 * Used to send make freelancer interested at select candidate tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function selectFreelancerInterestedClientTutorial(bot, user, msg) {
  const candidate = msg.data.split(strings().inlineSeparator)[1];
  /** 0 = empty, 1 = pending, 2 = interested */
  const states = {
    'borodutch': 0,
    'alexzzz9': 0,
    'nof1000': 0,
  }
  if (msg.data.split(strings().inlineSeparator).length > 2) {
    const data = msg.data.split(strings().inlineSeparator)[2];
    if (data.indexOf('1') > -1) {
      states['borodutch'] = 1;
    } else if (data.indexOf('2') > -1) {
      states['borodutch'] = 2;
    }
    if (data.indexOf('3') > -1) {
      states['alexzzz9'] = 1;
    } else if (data.indexOf('4') > -1) {
      states['alexzzz9'] = 2;
    }
    if (data.indexOf('5') > -1) {
      states['nof1000'] = 1;
    } else if (data.indexOf('6') > -1) {
      states['nof1000'] = 2;
    }
  }
  states[candidate] = 2;

  let borodutchState = '';
  let alexzzz9State = '';
  let nof1000State = '';

  let extraData = '';
  Object.keys(states).forEach((key) => {
    if (key === 'borodutch') {
      if (states[key] === 1) {
        borodutchState = strings().pendingOption+' ';
        extraData = `${extraData}1`;
      } else if (states[key] === 2) {
        borodutchState = strings().acceptOption+' ';
        extraData = `${extraData}2`;
      }
    }
    if (key === 'alexzzz9') {
      if (states[key] === 1) {
        extraData = `${extraData}3`;
        alexzzz9State = strings().pendingOption+' ';
      } else if (states[key] === 2) {
        extraData = `${extraData}4`;
        alexzzz9State = strings().acceptOption+' ';
      }
    }
    if (key === 'nof1000') {
      if (states[key] === 1) {
        extraData = `${extraData}5`;
        nof1000State = strings().pendingOption+' ';
      } else if (states[key] === 2) {
        extraData = `${extraData}6`;
        nof1000State = strings().acceptOption+' ';
      }
    }
  });

  const keyboard = [
    [{ text: `${borodutchState}@borodutch`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}borodutch${strings().inlineSeparator}${extraData}` }],
    [{ text: `${alexzzz9State}@alexzzz9`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}alexzzz9${strings().inlineSeparator}${extraData}` }],
    [{ text: `${nof1000State}@nof1000`, callback_data: `${strings().clientTutorialFreelancersInline}${strings().inlineSeparator}nof1000${strings().inlineSeparator}${extraData}` }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .catch(/** todo: handle error */);
}

/** Exports */
module.exports = {
  sendTutorial,
};