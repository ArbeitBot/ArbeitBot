let dbmanager = require('./dbmanager');

let admins = ['74169393', '-1001052392095'];

function handleAdminCommand(msg, bot) {
  //check if the user is admin
  if (!admins.includes(String(msg.chat.id))) return;
  let messageText = msg.text;
  if (isUnbanCommand(messageText)) {
    handleUnbanCommand(msg, bot);
  } else if (isBanCommand(messageText)) {
    handleBanCommand(msg, bot);
  } else if (isGodVoiceCommand(messageText)) {
    handleGodVoiceCommand(msg, bot);
  } else {
    console.log('Admin sent command which we dont have');
  }
}

function isUnbanCommand(messageText) {
  return messageText.indexOf('/unban') == 0;
}

function isBanCommand(messageText) {
  return messageText.indexOf('/ban') == 0;
}

function isGodVoiceCommand(messageText) {
  return messageText.indexOf('/godvoice') == 0;
}

function handleGodVoiceCommand(msg, bot) {
  // todo: change to regex
  // let message = /^\/godvoice@?[^ ]* +(.*)$/.exec(msg.text)[1];
  let message = msg.text.split('/godvoice@arbeit_bot ')[1];
  if (!message || message.length <= 0) {
    return;
  }
  dbmanager.getAllUsers()
    .then(users => {
      users.forEach(user => {
        bot.sendMessage(user.id, message, {
          disable_web_page_preview: 'true'
        }).catch(err => console.log(err.message));
      });
    })
}

function handleBanCommand(msg, bot) {
  let username = /^\/ban@?.* @(.*)$/.exec(msg.text)[1];
  console.log(username);
  dbmanager.findUser({username: username})
    .then(user => {
      user.ban_state = true;
      user.save()
        .then(sendConfirmed(msg, bot));
    })
}

function handleUnbanCommand(msg, bot) {
  let username = /^\/unban@?.* @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({username: username})
    .then(user => {
      user.ban_state = false;
      user.save()
        .then(sendConfirmed(msg, bot));
    });
}

function sendConfirmed(msg, bot) {
  bot.sendMessage(msg.chat.id, 'confirmed.');
}

module.exports = {
  handleAdminCommand
};