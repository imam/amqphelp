
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const sinon = require('sinon')
const expect = require('chai').expect;

const helper = require(pathfinder.to_app())();
const util_class = require(pathfinder.to_app() + '/util.helper').MessagingUtil;
const util = new util_class;

describe("[ Messaging Helper | Utils ]", function(){

  describe("A success call on sleep", ()=>{
    let clock, isResolved;

    beforeEach(()=>{
      clock = sinon.useFakeTimers();
    })

    it("should resolve in 10 seconds", async ()=>{

      let isResolved = false;
      let sleep = util.sleep().then(()=>{
        isResolved = true;
      })

      await clock.tick(10000)

      expect(isResolved).to.true

    })

    afterEach(()=>{
      clock.restore();
    })
  })
  
});
