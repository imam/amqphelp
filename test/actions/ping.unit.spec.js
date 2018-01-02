'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_messaging_helper() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_messaging_helper() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_messaging_helper() + "/channel.helper");

let server  = require(pathfinder.to_app() + '/index');
let env  = require(pathfinder.to_env());

const sinon = require('sinon');

describe("[ Job Messaging Helper | Ping Action ]", function(){

  before(()=>{
    server.listen(3000);
  });

  describe('a correct call on ping', ()=>{
    const BROKER_USER = process.env.WEB_BROKER_DEFAULT_USER;
    const BROKER_PASS = process.env.WEB_BROKER_DEFAULT_PASS;

    let messagingChannel, messagingAction;

    let interval, clock;

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      let channel_stub = sinon.stub({
        assertQueue: () => { return Promise.resolve(true) },
        sendToQueue: () => { return 1 }
      });

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });

      clock = sinon.useFakeTimers();
    });

    it('should increase ping count', async ()=>{
      interval = await messagingAction.ping("ping testing");
      clock.tick(6000);
      expect(messagingAction.ping_count).to.equal(2);
    });

    afterEach(()=>{
      messagingChannel.create.restore();
      clearInterval(interval);
      clock.restore();
    });

  });

  after(()=>{
    server.close();
  });

});
