const amqphelp = require('./bootstrap.js')

amqphelp.actions.subscribe('test_pubsub', msg=>{
	console.log(msg)
})
