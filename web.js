const express = require('express')
const webApp = express()
const port = process.env.PORT || '3001'

webApp.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
webApp.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})