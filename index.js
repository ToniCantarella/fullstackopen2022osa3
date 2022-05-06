require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

/* let persons = [
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
] */

morgan.token('person', (req) => {
    return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/info', (req, res) => {
    Person.count((err, count) => {
        console.log(count)
        const date = new Date()
        res.send(`<h1>Phonebook has information for ${count} people</h1> <p>${date}</p>`)
    })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if(person){
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

/* const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(person => person.id))
      : 0

    const min = 100
    const randomId = Math.floor(Math.random() * (min - (maxId + 1)) + min)

    return randomId
} */
  
app.post('/api/persons', (req, res, next) => {
    const body = req.body

    /* const alreadyIncluded = Person.find(person => person.name === body.name) */

    if(!body.name || !body.number){
        console.log("!")
        return res.status(400).json({
            error: 'name or number missing from body'
        })
    }
    /* if(alreadyIncluded){
        console.log("!")
        return res.status(400).json({
            error: 'name must be unique'
        })
    } */

    const person = new Person({
        /* id: generateId(), */
        name: body.name,
        number: body.number,
    })

    //console.log(person)
  
    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const {name, number} = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(
        req.params.id, 
        {name, number}, 
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}
  
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return res.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError'){
        return res.status(400).json({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})