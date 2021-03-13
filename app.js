#!/usr/bin/env node
const fastify = require('fastify')({logger: true})
const fastifyCors = require('fastify-cors')
const start = async(port) => {
    console.log('server has started')
    fastify.register(fastifyCors)
    fastify.register(require('./createEndpointsFromFiles'))
    await fastify.ready((err) => {
        console.log(err)
    })
    await fastify.listen(port)
}

if (process.argv.length > 2) {
    start(process.argv[2])
}