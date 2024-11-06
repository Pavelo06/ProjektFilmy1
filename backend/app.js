require('dotenv').config();

const nano = require('nano')(`http://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@127.0.0.1:5984`)
const argon = require('argon2')
const colors = require('colors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const express = require('express')
const cors = require('cors')

const IUser = require('./user.interface')

const DB_NAME = 'filmy'
const PORT = 5555

// Instancje bibliotek
const app = express()
const db = nano.use(DB_NAME)

app.use(cors())
app.use(bodyParser.json())


app.get('/api/v1/filmy', (request, response) => {
  db.list({include_docs: true}, (err, data) => {
    if(err) {
      response.status(500).json({error: `Wewnętrzny błąd serwera: ${err}`})
      return
    }

    const wszystkieDokumenty = data.rows.map(row => row.doc)
    response.status(200).json(wszystkieDokumenty)
  })
})

app.post('/api/v1/filmy/nowa', async (request, response) => {
  console.log('witamy dane')
  response.status(200)
})

app.post('/api/v1/user/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const hashHaslo = await argon.hash(password)

    const nowyUzytkownik = { username, password: hashHaslo }

    await IUser.stworzUzytkownika(nowyUzytkownik)

    res.status(201).json({message: "Stworzono nowego użytkownika"})

  } catch(error) {
    res.status(500).json({message: `Wewnętrzny błąd serwera: ${error}`})
  }
})

app.post('/api/v1/user/login', async (request, response) => {
  const { username, password } = request.body

  try {
    const user = await IUser.znajdzUzytkownikaPoNazwie(username)
    if(!user) {
      return response.status(401).json({message: "Nie znaleziono użytkownika o podanej nazwie"})
    }

    const haslaTakieSame = await argon.verify(user.password, password)
    if(!haslaTakieSame) {
      return response.status(401).json({message: "Błędne dane logowania"})
    }

    const token = jwt.sign({userId: user._id, login: user.username}, process.env.TOKEN_SIGN, { expiresIn: '1h' })

    response.status(200).json(token)
  } catch(error) {
    response.status(500).json({message: `Wewnętrzny błąd serwera: ${error}`})
  }
})
app.listen(PORT, () => {
  console.log(`Serwer działa na adresie http://localhost:${PORT}`.underline.blue)
})
