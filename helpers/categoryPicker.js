/**
 * Category picker is a file that manages category picking for
 * freelancers through inline keyboards
 *
 * @module helpers/categoryPicker
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const strings = require('./strings');

const pageSize = 10;

/**
 * Handles incoming message that's send when user selects an inline button
 *
 * @param  {Telegram:Bot} bot - Bot that should send a response to this action
 * @param  {Telegram:Message} - msg Message that was received upon clicking an inline button
 */
global.eventEmitter.on(strings.categoryInline, ({ msg, bot }) => {
  const command = msg.data.split(strings.inlineSeparator)[1];
  const page = parseInt(msg.data.split(strings.inlineSeparator)[2], 10);

  if (command === strings.categoryLeft) {
    editPage(bot, msg, page - 1);
  } else if (command === strings.categoryRight) {
    editPage(bot, msg, page + 1);
  } else {
    dbmanager.toggleCategoryForUser(msg.message.chat.id, command)
      .then(({ user, isAdded }) => {
        if (isAdded) {
          if (user.bio && user.hourly_rate && user.categories.length === 1) {
            keyboards.sendKeyboard(
              bot,
              user.id,
              strings.filledEverythingMessage,
              keyboards.freelancerKeyboard(user)
            );
          }
        }

        editPage(bot, msg, page);
      })
      .catch(/** todo: handle error */);
  }
});

/**
 * Sends freelancer list of categories with inline buttons to pick categories
 *
 * @param  {Telegram:Bot} bot - Bot that should send keyboard
 * @param  {Number} chatId - Chat id of user that should receive keyboard
 */
function sendCategories(bot, chatId) {
  dbmanager.findUser({ id: chatId })
    .then(user =>
      dbmanager.getCategories()
        .then((categories) => {
          getCategoriesCallback(categories, user, bot);
        })
    )
    .catch(/** todo: handle error */);
}

/**
 * Callback function that is used when user and categories are obtained
 * from Mongo DB – triggers sending of categories picker to user
 *
 * @param  {[Mongoose:Category]} categories - A list of categories that
 *    should be available for picking
 * @param  {Mongoose:User} user - User that should receive a keyboard
 * @param  {Telegram:Bot} bot - Bot that should send a keyboard
 */
function getCategoriesCallback(categories, user, bot) {
  const keyboard = categoriesKeyboard(categories, user, 0);

  keyboards.sendInline(
    bot,
    user.id,
    strings.pickCategoriesMessage,
    keyboard
  );
}

/**
 * Edits message and it's inline buttons for category picker message –
 * mainly used for paging and if we need to update message with category
 * picker
 *
 * @param  {Telegram:Bot} bot - Bot that should edit message
 * @param  {Telegram:Message} msg - Message that should be editted,
 *    usually obtained with inline button click callback
 * @param  {Number} page - Page of the list of categories that should be displayed
 */
function editPage(bot, msg, page) {
  dbmanager.findUser({ id: msg.message.chat.id })
    .then(user =>
      dbmanager.getCategories()
        .then((categories) => {
          keyboards.editInline(
            bot,
            msg.message.chat.id,
            msg.message.message_id,
            categoriesKeyboard(categories, user, page)
          );
        })
    )
    .catch(/** todo: handle error*/);
}

/**
 * Returns inline keyboard for freelancer; decorates it with checkmark if
 * category is picked, supports multiple categories to be picked; shows
 * picked categories on top of the list; supports paging
 *
 * @param  {[Mongoose:Category]} categories - A list of all categories that should be shown
 * @param  {Mongoose:User} user - User that requested keyboards
 * @param  {Number} page - Page for which the keyboard should be sent;
 *    i.e. page 1 will return categories 0 through pageSize, page 2 will
 *    return pages pageSize through pageSize*2
 * @return {Telegram:InlineKeyboard} Keyboard with paging buttons if
 *    required and a list of categories with picked indicator for
 *    specified user
 */
function categoriesKeyboard(categories, user, page) {
  const categoriesLeft = [];

  categories.forEach((cat) => {
    let shouldAdd = true;

    user.categories.forEach((category) => {
      if (String(category._id) === String(cat._id)) shouldAdd = false;
    });

    if (shouldAdd) categoriesLeft.push(cat);
  });

  let allCategories = user.categories.concat(categoriesLeft);
  allCategories = allCategories.slice(page * pageSize, (page * pageSize) + pageSize);

  const keyboard = [];
  let tempRow = [];
  for (let i = 0; i < allCategories.length; i += 1) {
    const isOdd = (i % 2) === 1;
    const isLast = i === allCategories.length - 1;
    const currentCategory = allCategories[i];

    const text = ((user.categories.indexOf(currentCategory) > -1) ?
      strings.selectedCategory + currentCategory.title :
      currentCategory.title
    );

    tempRow.push({
      text,
      callback_data: strings.categoryInline +
        strings.inlineSeparator +
        currentCategory._id +
        strings.inlineSeparator +
        page,
    });

    if (isOdd || isLast) {
      keyboard.push(tempRow);
      tempRow = [];
    }
  }

  const navButtons = [];
  if (page > 0) {
    navButtons.push({
      text: strings.categoryLeft,
      callback_data: strings.categoryInline +
        strings.inlineSeparator +
        strings.categoryLeft +
        strings.inlineSeparator +
        page,
    });
  }

  const remainder = categories.length % pageSize;
  let lastPage = (categories.length - remainder) / pageSize;

  if (remainder > 0) lastPage += 1;
  if (page + 1 < lastPage) {
    navButtons.push({
      text: strings.categoryRight,
      callback_data: strings.categoryInline +
        strings.inlineSeparator +
        strings.categoryRight +
        strings.inlineSeparator +
        page,
    });
  }

  keyboard.push(navButtons);

  if (page + 1 === lastPage) {
    keyboard.push([{
      text: strings.suggestCategoryMessage,
      url: 'http://telegram.me/borodutch',
    }]);
  }

  return keyboard;
}

/** Exports */
module.exports = {
  sendCategories,
};
