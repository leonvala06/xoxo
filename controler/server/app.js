const express = require('express')
const app = express()
const port = 4000
<<<<<<< HEAD
const path_react_app = 'C:/Users/leloune/OneDrive - IMT MINES ALES/Documents/MINES/S8/UFRJ/ProgAv/alattaque/client_3000/build'

app.use(express.static(path_react_app))

app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`)
  })
=======

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
>>>>>>> 38b86f042ec010b22d7e21951b407a59c43c2198
