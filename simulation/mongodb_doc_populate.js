import { mongo } from 'mongoose';

const amqphelp = require('./bootstrap.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27020/testamq')

const testRelationSchema = new Schema({
    title: String
})

const TestRelation = mongoose.model('TestRelation', testRelationSchema)

const testSchema = new Schema({
    title: String,
    test_relation_id: {type: Schema.Types.ObjectId, ref: "TestRelation"}
})

amqphelp.model('mongo', 'test', testSchema, ['jobs', 'chat' ,'halo']);

const Test = mongoose.model('Test', testSchema)

const dataRelation = new TestRelation({title: "hehehe"})

dataRelation.save().then(async ()=>{
    const data = new Test({title: 'Halooo', test_relation_id: dataRelation._id})
    let populated = await data.populate('test_relation_id').execPopulate()

    console.log(populated)

    dataRelation.remove();
})
