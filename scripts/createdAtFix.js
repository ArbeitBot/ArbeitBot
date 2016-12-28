const mongoose = require('mongoose');
const db = require('../helpers/dbmanager');

global.Promise = require('bluebird');

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect('');

db.findUsers({$or: [{ createdAt: null }, { createdAt: {$exists: false }}]})
  .then((chats) => {
    let ops = [];
    chats.forEach((chat) => {
      console.log(chat.id);
      chat.createdAt = chat._id.getTimestamp();
      ops.push(new Promise((resolve, reject) => {
        chat.save()
          .then(resolve)
          .catch(reject);
      }));
    });
    Promise.all(ops)
      .then(() => {
        console.log('All timestamps recovered');
      })
      .catch((err) => {
        console.log('Error: ' + err.message);
      });
  });
