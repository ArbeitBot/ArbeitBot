const dbmanager = require('./dbmanager');
const strings = require('./strings');
const keyboards = require('./keyboards');
const adminReports = require('./adminReports');


eventEmitter.on(strings.inputBioState, ({ msg, user, bot }) => {
  let newBio = msg.text.substring(0, 150);

  let needsCongrats = !user.bio && !!user.hourly_rate && user.categories.length > 0;

  user.bio = newBio;
  user.input_state = undefined;
  user.save()
    .then(user => {
      bot.sendMessage(msg.chat.id, strings.changedBioMessage+user.bio, {
        reply_markup: JSON.stringify({
          keyboard: keyboards.freelancerKeyboard(user),
          resize_keyboard: true
        }),
        disable_web_page_preview: 'true'
      })
        .then(data => {
          if (needsCongrats) {
            keyboards.sendKeyboard(
              bot,
              user.id,
              strings.filledEverythingMessage,
              keyboards.freelancerKeyboard(user));
          }
        })
        .catch(err => console.error(err.message));
    });
});

eventEmitter.on('cancel' + strings.inputBioState, ({ msg, user, bot }) => {
  user.input_state = undefined;
  user.save()
    .then(user => {
      bot.sendMessage(msg.chat.id, strings.notChangedBioMessage+user.bio, {
        reply_markup: JSON.stringify({
          keyboard: keyboards.freelancerKeyboard(user),
          resize_keyboard: true
        }),
        disable_web_page_preview: 'true'
      })
        .catch(err => console.error(err.message));
    });
});


function createProfile(bot, msg) {
  dbmanager.addUser(msg.from)
    .then(obj => {
      const user = obj.user;
      const isNew = obj.new;
      if (isNew) {
        adminReports.userRegistered(bot, user);
      }
      keyboards.sendMainMenu(bot, msg.chat.id, true);
    });
}

/**
 * Sends message to user asking for bio and adds relevant flags to user's object
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForBio(msg, bot) {
  dbmanager.findUser({ id: msg.chat.id })
    .then(user => {
      user.input_state = strings.inputBioState;
      user.save()
        .then(user => {
          let message = user.bio ?
          strings.editBioMessage+'\n\n'+strings.yourCurrentBio+'\n\n'+user.bio : strings.editBioMessage;
         
          bot.sendMessage(msg.chat.id, message, {
            reply_markup: JSON.stringify({
              keyboard: [[ strings.cancel ]],
              resize_keyboard: true
            }),
            disable_web_page_preview: 'true'
          }).catch(err => console.error(err.message));
        });
    });
}

function updateProfile(msg, user) {
  if (msg.from.first_name !== user.first_name || msg.from.last_name !== user.last_name || msg.from.username !== user.username) {
    user.first_name = msg.from.first_name;
    user.last_name = msg.from.last_name;
    user.username = msg.from.username;
    
    user.save()
      .catch(err => console.error(err.message));
  }
}


// Exports
module.exports = {
  createProfile,
  updateProfile,
  askForBio
};
