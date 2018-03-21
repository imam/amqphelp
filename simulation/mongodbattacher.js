import { mongo } from 'mongoose';

const amqphelp = require('./bootstrap.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27020/testamq')

const testSchema = new Schema({
    title: String
})

amqphelp.model('mongo', 'test', testSchema, ['jobs', 'chat' ,'halo']);

const Test = mongoose.model('Test', testSchema)

const data = new Test({title: 'Halooo', subtitle: "ho"})

data.save(err=>{
    if(err) console.log(err);

    data.update({title: 'yaaa'}, err=>{
        if(err) console.log(err)
    })

    data.remove()
})
