require('dotenv').config();

const nano = require('nano')(`http://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@127.0.0.1:5984`)

const DB_NAME = 'uzytkownicy'

const db = nano.use(DB_NAME)

async function stworzUzytkownika(uzytkownikObj) {
  try {
    const response = await db.insert(uzytkownikObj)
    return response
  } catch(err) {
    throw new Error(`Błąd przy tworzeniu nowego użytkownika: ${err}`)
  }
}

async function znajdzUzytkownikaPoNazwie(nazwaUzytkownika) {
  try {
    const response = await db.find({selector: { username: nazwaUzytkownika}})
    if(response.docs.length === 0) {
      return null;
    }
    return response.docs[0]
  } catch(err) {
    throw new Error(`Błąd przy próbie znalezienia użytkownika: ${err}`)
  }
}

module.exports = { stworzUzytkownika, znajdzUzytkownikaPoNazwie }