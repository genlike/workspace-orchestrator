'use-strict'

const { spawn } = require('child_process')
const path = require('path')

module.exports = {
  async startLanguageServer (languagePath, port) {
    return new Promise(function (resolve, reject) {
      const baseDir = path.dirname(path.resolve(languagePath))
      console.log("Start Language Server")
      console.log(languagePath)
      console.log(port)
      console.log("////////////////////")
      try {
        const ls = spawn(`java -jar ${languagePath} ` + port, {
          shell: true,
          cwd: baseDir
        })

        ls.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`)
        })

        ls.stderr.on('data', (data) => {
          // Waiting for the string that indicates the successfull start
          if (/(.)*INFO(.)*Server started(.)*/.test(data)) {
            resolve()
          }
        })

        ls.on('close', (code) => {
          if (code !== 0) {
            throw new Error(`Error: language server exited with code: ${code}\nHINT: Try to wait ~10 sec before next start. This gives the system the necessary time for it's cleanup processes.`)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}