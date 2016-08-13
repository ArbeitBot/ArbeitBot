let dbmanager = require('./dbmanager');

let admins = ['74169393', '-1001052392095'];

function handleAdminCommand(msg, bot) {
  //check if the user is admin
  if (!admins.includes(String(msg.chat.id))) return;

  if (isUnbanCommand(msg.text)) {
    handleUnbanCommand(msg, bot)
  } else if (isBanCommand(msg.text)) {
    handleBanCommand(msg, bot);
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

function handleBanCommand(msg, bot) {
  let username = /^\/ban @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({username: username})
    .then(user => {
      user.ban_state = true;
      user.save()
        .then(sendConfirmed(msg, bot));
    })
}

function handleUnbanCommand(msg, bot) {
  let username = /^\/unban @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({username: username})
    .then(user => {
      user.ban_state = false;
      user.save()
        .then(sendConfirmed(msg, bot));
    });
}

function sendConfirmed(msg, bot) {
  bot.sendMessage({
    message_id: msg.from.id,
    chat_id: msg.chat.id,
    text: 'confirmed.'
  })
}

module.exports = {
  handleAdminCommand
};