'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const chai = require('chai')
const chai_as_promised = require('chai-as-promised')

chai.use(chai_as_promised)

const expect = chai.expect;
const { MessagingAction } = require(pathfinder.to_app() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_app() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_app() + "/channel.helper");

const sinon = require('sinon');

describe("[ Messaging Helper | Create Task Action ]", function(){


  const BROKER_HOST = 'localhost';
  const BROKER_USER = 'guest';
  const BROKER_PASS = 'guest';

  let messagingChannel, messagingAction;

  let channel_stub;

  const QUEUE_NAME = 'testing_queue';
  const MESSAGE = 'testing_queue';


  describe('a correct call on receive', ()=>{
    beforeEach(async ()=>{

      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = sinon.stub({
        assertQueue() { return Promise.resolve(true) },
        consume() { return true },
      });

      let settings = {
        connection: {
          host: BROKER_HOST,
          options: {
            user: BROKER_USER,
            pass: BROKER_PASS
          }
        }
      }

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_HOST, BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ settings: settings, MessagingChannel: messagingChannel });
    });

    it('should call assertQueue once', async function(){
      await messagingAction.receive(QUEUE_NAME, ()=>{})
      expect(channel_stub.assertQueue.calledOnce).to.equal(true);
    });


    it('should call consume once', async function(){
      await messagingAction.receive(QUEUE_NAME, ()=>{})
      expect(channel_stub.consume.calledOnce).to.equal(true);
    });

    afterEach(()=>{
      messagingChannel.create.restore();
    });

  });

  describe("a call on receive, check channel.consume", ()=>{
    const BROKER_HOST = 'localhost';
    const BROKER_USER = 'guest';
    const BROKER_PASS = 'guest';

    let messagingChannel, messagingAction;

    let channel_stub;

    const QUEUE_NAME = 'testing_queue';
    const MESSAGE = 'testing_queue';

    beforeEach(async ()=>{

      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = {
        assertQueue() { return Promise.resolve(true) },
        consume: sinon.stub().callsFake((_, callback)=>{
          callback({
            content: 'kdsklaj'
          })
        }),
        ack: sinon.stub()
      };

      let settings = {
        connection: {
          host: BROKER_HOST,
          options: {
            user: BROKER_USER,
            pass: BROKER_PASS
          }
        }
      }

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_HOST, BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ settings: settings, MessagingChannel: messagingChannel });
    });


    it("should call ack once", async ()=>{
      await messagingAction.receive(QUEUE_NAME, ()=>{})
      expect(channel_stub.ack.calledOnce).to.equal(true)
    })


    it("should call callback", async ()=>{
      let callback = sinon.stub()
      await messagingAction.receive(QUEUE_NAME, callback)
      expect(callback.calledOnce).to.equal(true)
    })

    afterEach(()=>{
      messagingChannel.create.restore()
    })
  })

  describe("an error call on subscribe", () => {


    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = sinon.stub({
        assertQueue() { return Promise.resolve(true) },
        consume() { return true },
      });

      let settings = {
        connection: {
          host: BROKER_HOST,
          options: {
            user: BROKER_USER,
            pass: BROKER_PASS
          }
        }
      }

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_HOST, BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ settings: settings, MessagingChannel: messagingChannel });
    });

    it("should reject if queue name undefined", ()=>{
      expect(
        messagingAction.receive(undefined, ()=>{}) 
      ).to.be.rejectedWith(TypeError)
    })

    it("should reject if callback undefined", ()=>{
      expect(
        messagingAction.receive('_', undefined) 
      ).to.be.rejectedWith(TypeError)
    })

    afterEach(()=>{
      messagingChannel.create.restore()
    })
  })

});
