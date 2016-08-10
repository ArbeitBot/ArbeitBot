'use strict';
let expect = require("chai").expect;
let chai = require('chai');

const app = require('../app');


let sinon = require('sinon');
let strings = require('../helpers/strings');
let bot = require('../helpers/telegramBot');

let keyboards = require('../helpers/keyboards');

let mongoose = require('mongoose');

let dbmanager = require("../helpers/dbmanager");
let jobManager = require('../helpers/jobManager');


var User = mongoose.model('user');
var Category = mongoose.model('category');
var Job = mongoose.model('job');
var Review = mongoose.model('review');


describe("JobManager ", function() {

	/**
	 * Sending a message to client after job has been created; message includes inline with freelancers available and suitalbe for this job
	 * @param  {Mongoose:User} user Owner of this job
	 * @param  {Telegram:Bot} bot  Bot that should send message
	 * @param  {Mongoose:Job} job  Relevant job
	 */
	 
	describe("#sendJobCreatedMessage( user, bot, job )", function() {

            
        let deferredSuccess, freelancersForJob, sendKeyboard;

        before( ()=> {

            
            let responseData = {
            	"data": {}
            };

            deferredSuccess = new Promise( (resolve, reject)=> { resolve(responseData) });
            sendKeyboard = sinon.spy( keyboards, 'sendKeyboard').return( deferredSuccess );
  
        })

		it('should be call @dbmanager.freelancersForJob with @params: { Mongoose:job},{ Function: callback })', ()=> {
	
				let users = [ new User() ];
      
      			let user = new User();
      			let job = new Job();
      

                jobManager.sendJobCreatedMessage( user, bot, job );

        });

		after(()=> {
 		
 			sendKeyboard.restore();
		})

	});

});