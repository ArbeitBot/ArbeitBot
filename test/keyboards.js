'use strict';
var expect = require("chai").expect;
var chai = require('chai');
var keyboards = require('../helpers/keyboards');
var sinon = require('sinon');

var bot = require('../helpers/telegramBot');
var Q = require("q");

describe("Keyboards ", function() {

    describe("#sendKeyboard()", function() {

        let deferredFail = Q.defer();
        let deferredSuccess = Q.defer();

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

        describe("with error", function() {
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

        describe("with success", function() {
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

        describe("with error", function() {
            it("should be send err in @then if @then (function) exist", function () {

                sendInlineFail = sinon.stub(bot, 'sendMessage').returns(deferredFail.promise);
                var responseData = {
                    "error": {
                        "code": 404,
                        "message": "For test 2"
                    }
                };

                deferredFail.reject(responseData);
                return keyboards.sendInline(bot, 213375221, '', [], then);
            });

            after(function () {
                sendInlineFail.restore();
            });
        });

        describe("with success", function() {
            it("should be not send err in @then if @then (function) exist", function () {

                sendInlineSuccess = sinon.stub(bot, 'sendMessage').returns(deferredSuccess.promise);
                var responseData = {
                    "data": {}
                };

                deferredSuccess.resolve(responseData);
                return keyboards.sendInline(bot, 213375221, 'text', [], then);
            });

            after(function () {
                sendInlineSuccess.restore();
            });
        });

    });
    /*
    
    todo-wsmichel: Create test for #freelancerKeyboard()

    describe("#freelancerKeyboard() ", function() {
        it('',function () {

            let bioText = "";
            let categoriesText = "";
            let hourlyRateText = "";
            let freelanceMenuOptions = "";
            let availableText = "";

            let data = [
                [{ text: bioText },{ text: categoriesText }],
                [{ text: hourlyRateText }],
                [{ text: freelanceMenuOptions },
                    { text: availableText }]
            ];
        })
    });
    */
});