
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;

describe("[ Pathfinder ]", function(){

  let root_path = process.env.PWD;

  it('should return absolute home path', ()=>{
    expect(pathfinder.to_root()).to.equal(root_path);
  });

  it('should return to app path', ()=>{
    expect(pathfinder.to_app()).to.equal(`${root_path}/helpers`);
  });

  it('should return to configs path', ()=>{
    expect(pathfinder.to_configs()).to.equal(`${root_path}/configs`);
  });

  it('should return to tests path', ()=>{
    expect(pathfinder.to_tests()).to.equal(`${root_path}/tests`);
  });

});
