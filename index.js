const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

let persons = [
    {    
        id: 1,    
        name: "Tuomas Taajama",    
        number: 04345456457
    },  
    {    
        id: 2,    
        name: "Laura Lampi",    
        number: 01023445645
    },  
    {    
        id: 3,    
        name: "Liisa Leppävirta",
        number: 030364654645
    },
    {
        id: 4,
        name: "Jesse Jänis",
        number: 139028
    }
]

morgan.token('person', (req) => {
    return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/info', (req, res) => {
    const amount = persons.length
    const date = new Date()
    res.send(`<h1>Phonebook has information for ${amount} people</h1> <p>${date}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)  
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)  
    } else {    
        res.status(404).end()  
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
  
    res.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(person => person.id))
      : 0

    const min = 100
    const randomId = Math.floor(Math.random() * (min - (maxId + 1)) + min)

    return randomId
}
  
app.post('/api/persons', (req, res) => {
    const body = req.body

    const alreadyIncluded = persons.find(person => person.name === body.name)

    if(!body.name || !body.number){
        console.log("!")
        return res.status(400).json({
            error: 'name or number missing from body'
        })
    }
    if(alreadyIncluded){
        console.log("!")
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    //console.log(person)
  
    persons = persons.concat(person)
  
    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})