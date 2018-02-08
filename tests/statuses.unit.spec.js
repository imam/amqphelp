
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;

const helper = require(pathfinder.to_app())();

describe("[ Messaging Helper | Statuses ]", function(){

  it('should return status PENDING', ()=>{
    expect(helper.statuses.PENDING).to.equal("PENDING");
  });

  it('should return status SUCCESSFUL', ()=>{
    expect(helper.statuses.SUCCESSFUL).to.equal("SUCCESSFUL");
  });

  it('should return status REJECTED', ()=>{
    expect(helper.statuses.REJECTED).to.equal("REJECTED");
  });

});
