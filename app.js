const fastify = require('fastify')({logger: true})
const fs = require('fs')
const os = require('os')
const path = require('path')
const start = async(port) => {
    console.log('server has started')
    inspectFileContents()
    await fastify.listen(port)
}

const inspectFileContents = () => {
   const files =  fs.readdirSync(__dirname)
   const jsFiles = files.filter((file) => file.endsWith('.js')).filter((file) => file !== "app.js")
   jsFiles.forEach((jsFile) => {
       const module = require(`./${jsFile}`)
       const endpointpath = jsFile.replace('.js', '')
       Object.keys(module).forEach((fnName) => {
           console.log(fnName)
           const fn = module[fnName]
           if (typeof fn === "function") {
               fastify.get(`/${endpointpath}/${fnName}`, (req, res) => {
                   const result = fn.apply(null, Object.values(req.query))
                   res.send(result)
               })
               console.log(`registered /${endpointpath}/${fnName}`)
           }
       })
   })
}
if (process.argv.length > 2) {
    start(process.argv[2])
}