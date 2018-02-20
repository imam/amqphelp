const amqphelp = require('./bootstrap.js')

amqphelp.actions.subscribe('amqphelp_heartbeat', msg=>{
	console.log(msg)
})
