const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()

// Trust the first proxy (Render)
app.set('trust proxy', 1)

app.use(cors())


app.use(express.json())

// Rate limiting middleware - More generous limits for development
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // limit each IP to 50 requests per minute (increased for development)
    message: {
        message: "Too many requests. Please wait a minute before trying again."
    },
    standardHeaders: true,
    legacyHeaders: false,
})

app.use('/ai', limiter)

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/ai', aiRoutes)

module.exports = app