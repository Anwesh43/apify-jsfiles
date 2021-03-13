const { default: fastify } = require('fastify')
const fs = require('fs')
const filterPostEndpoints = (fnName) => fnName.endsWith('.post.js')
const filterGetEndpoints = (fnName) => !filterPostEndpoints(fnName)


const createGetEndpoint = (fastify, endpointpath, fnName, fn) => {
    let ep = endpointpath.replace('.get', '')
    if (typeof fn === "function") {
        fastify.get(`/${ep}/${fnName}`, (req, res) => {
            try {
                const result = fn.apply(null, Object.values(req.query))
                console.log("Result is", result)
                res.code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({result})
            
            } catch(error) {
                console.log(error)
                res.code(500)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({error})
            }
        })
        console.log(`registered get endpoint /${ep}/${fnName}`)
    }
}


const createPostEndpoint = (fastify, endpointpath, fnName, fn) => {
    let ep = endpointpath.replace('.post', '')
    if (typeof fn === "function") {
        fastify.post(`/${ep}/${fnName}`, (req, res) => {
            try {
                const result = fn.apply(null, Object.values(req.body))
                res.code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({result})
            } catch(error) {
                res.code(500)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send({error})
            }
        })
        console.log(`registered post endpoint /${ep}/${fnName}`)
    }    
}

const createEndpointFromJsFile = (fastify, jsFiles, type = 'GET') => {
    jsFiles.forEach((jsFile) => {
        try {
            const module = require(`./${jsFile}`)
            let endpointpath = jsFile.replace('.js', '')
            Object.keys(module).forEach((fnName) => {
                const fn = module[fnName]
                if (type === 'GET') {
                    createGetEndpoint(fastify, endpointpath, fnName, fn)
                }
                if (type === 'POST') {
                    createPostEndpoint(fastify, endpointpath, fnName, fn)
                }
            })
        } catch(ex) {
            console.log(`Error while registering module ${jsFile}`, ex)
        }
    })
}

const scanJsFiles = (fastify, options, done) => {
    const files =  fs.readdirSync(__dirname)
    const jsFiles = files
                        .filter((file) => file.endsWith('.js'))
                        .filter((file) => file !== "app.js")
                        .filter((file) => file.charCodeAt(0) >= 97)
    const postJsFiles = jsFiles.filter(filterPostEndpoints)
    const getJsFiles = jsFiles.filter(filterGetEndpoints)
    createEndpointFromJsFile(fastify, getJsFiles)
    createEndpointFromJsFile(fastify, postJsFiles, 'POST')
    done()
 }
 
 module.exports = scanJsFiles