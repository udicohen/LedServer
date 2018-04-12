const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3101, () => console.log('Example app listening on port 3101!'))