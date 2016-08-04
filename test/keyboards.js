'use strict';
var expect = require("chai").expect;
var chai = require('chai');
var keyboards = require('../helpers/keyboards');
var sinon = require('sinon');
let strings = require('../helpers/strings');
var bot = require('../helpers/telegramBot');
var Q = require("q");

describe("Keyboards ", function() {


    /**
     * Sends keyboard to user
     * @param  {Telegram:Bot} bot      Bot that should send keyboard
     * @param  {Number} chatId   Telegram chat id where to send keyboard
     * @param  {String} text     Text that should come along with keyboard
     * @param  {Telegram:Keyboard} keyboard Keyboard that should be sent
     * @param  {Function} then     Function that should be executed when message is delivered
    */

    describe("#sendKeyboard()", function() {

        let deferredFail = Q.defer();

        let sendMessageFail,
            sendMessageSuccess;

        let then = function (err) {
            if (err) {
                // should be send err
                expect(err).to.not.equal(null);
            }
            else {
                // should be not send err
                expect(err).to.equal(null);

            }
        };
        describe("check call callback", function() {
            
            let deferredSuccess;

            before( ()=> {
                deferredSuccess = Q.defer();
            })

            it("should be call @then if @then (function) exist", function (done) {

                sendMessageSuccess = sinon.stub(bot, 'sendMessage').returns(deferredSuccess.promise);
                var responseData = {
                    "data": {}
                }

                deferredSuccess.resolve(responseData);
      
                keyboards.sendKeyboard(bot, 213375221, 'text', [], (some)=>{ 
                    done();
                });

            });
            after(function () {
                sendMessageSuccess.restore();
            });
        })

        describe("with error answer from server", function() {
            it("should be send err in @then if @then (function) exist", function () {

                sendMessageFail = sinon.stub(bot, 'sendMessage').returns(deferredFail.promise);
                var responseData = {
                    "error": {
                        "code": 404,
                        "message": "For test 1"
                    }
                };

                deferredFail.reject(responseData);
                return keyboards.sendKeyboard(bot, 213375221, '', [], then);
            });
            after(function () {
                sendMessageFail.restore();
            });
        })
        describe("with success answer from server", function() {

            let deferredSuccess;
            before( ()=>  {
                deferredSuccess = Q.defer();
            })

            it("should be not send err in @then if @then (function) exist", function () {

                sendMessageSuccess = sinon.stub(bot, 'sendMessage').returns(deferredSuccess.promise);
                var responseData = {
                    "data": {}
                };

                deferredSuccess.resolve(responseData);
                return keyboards.sendKeyboard(bot, 213375221, 'text', [], then);
            });

            after(function () {
                sendMessageSuccess.restore();
            })
        });

    });


    /**
     * Sends inline to user
     * @param  {Telegram:Bot} bot      Bot that should send inline
     * @param  {Number} chatId   Chat id where to send inline
     * @param  {String} text     Text to send along with inline
     * @param  {Telegram:Inline} keyboard Inline keyboard to send
     */

    describe("#sendInline()", function() {

        let deferredFail = Q.defer();
        let deferredSuccess = Q.defer();

        let sendInlineFail,
            sendInlineSuccess;

        let then = function (err) {
            if( err ){
                // should be send err
                expect( err ).to.not.equal( null );
            }
            else {
                // should be not send err
                expect( err ).to.equal( null );

            }
        };


        describe("with error answer from server", function() {
            it("should be use bot.sendMessage", function () {

                sendInlineFail = sinon.stub(bot, 'sendMessage').returns(deferredFail.promise);
                var responseData  = {
                    "error": {
                        "code": 404,
                        "message": "For test 2"
                    }
                };

                deferredFail.reject(responseData);
                return keyboards.sendInline(bot, 213375221, '', []);
            });

            after(function () {
                sendInlineFail.restore();
            });
        });

        describe("with success answer from server", function() {
            it("should be use bot.sendMessage", function () {

                sendInlineSuccess = sinon.stub(bot, 'sendMessage').returns(deferredSuccess.promise);
                var responseData = {
                    "data": {}
                };

                deferredSuccess.resolve(responseData);
                return keyboards.sendInline(bot, 213375221, 'text', []);
            });

            after(function () {
                sendInlineSuccess.restore();
            });
        });

    });




    // Functions

    /**
     * Freelancer main menu keyboard; gives different keyboard depending on user's busy status, existence of bio, categories and hourly rate
     * @param  {Mongoose:User} user User object that should receive keyboard
     * @return {Telegram:Keyboard} Keyboard ready to be shown to user
    */

    describe("#freelancerKeyboard() ", function() {


        /*

            let bioText = (user.bio) ? 
                strings.freelanceMenuOptions.editBio :
                strings.freelanceMenuOptions.addBio;
            let categoriesText = (user.categories.length > 0) ?
                strings.freelanceMenuOptions.editCategories :
                strings.freelanceMenuOptions.addCategories;
            let hourlyRateText = (user.hourly_rate) ?
                strings.freelanceMenuOptions.editHourlyRate :
                strings.freelanceMenuOptions.addHourlyRate;
            let availableText = user.busy ?
                strings.freelanceMenuOptions.available :
                strings.freelanceMenuOptions.busy;
            return [
                [{ text: bioText },{ text: categoriesText }],
                [{ text: hourlyRateText }],
                [{ text: strings.freelanceMenuOptions.back },
                 { text: availableText }]

        */


        it('test 1',function(){
            let user, result, equal;

            user = {
                bio: "",
                categories: [],
                hourly_rate: 0,
                busy: false
            }

            equal =  [ [ { text: strings.freelanceMenuOptions.addBio }, { text: strings.freelanceMenuOptions.addCategories } ],
  [ { text: strings.freelanceMenuOptions.addHourlyRate } ],
  [ { text: strings.freelanceMenuOptions.back }, { text: strings.freelanceMenuOptions.busy } ] ];

    
    
            result  = keyboards.freelancerKeyboard(user);
        
            chai.assert.deepEqual( result, equal );

        })


        it('test 2',function(){
            let user, result, equal;

            user = {
                bio: "qwe",
                categories: ['some'],
                hourly_rate: 200,
                busy: true
            }

            equal =  [ [ { text: strings.freelanceMenuOptions.editBio }, { text: strings.freelanceMenuOptions.editCategories  } ],
  [ { text: strings.freelanceMenuOptions.editHourlyRate } ],
  [ { text: strings.freelanceMenuOptions.back  }, { text: strings.freelanceMenuOptions.available } ] ];

    
            result  = keyboards.freelancerKeyboard(user);
            chai.assert.deepEqual( result, equal );

        })


        it('test 3',function(){
            let user, result, equal;

            user = {
                bio: null,
                categories: [],
                hourly_rate: null,
                busy: false
            }

              equal =  [ [ { text: strings.freelanceMenuOptions.addBio }, { text: strings.freelanceMenuOptions.addCategories } ],
  [ { text: strings.freelanceMenuOptions.addHourlyRate } ],
  [ { text: strings.freelanceMenuOptions.back  }, { text: strings.freelanceMenuOptions.busy } ] ];

    
            result  = keyboards.freelancerKeyboard(user);
            chai.assert.deepEqual( result, equal );

        })
    });
});