import express from 'express'
import pg from 'pg'
import Joi from 'joi'

const app = express()
const port = 3000
const { Pool } = pg

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mahasiswa',
    password: 'ijulganteng',
    port: 5432
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    const start = Date.now()
    
    req.on('finish', () => {
        const duration = Date.now() - start

        console.log({
            method: req.method,
            url: req.originalurl,
            status: res.statusCode,
            duration: `$(duration)ms`
        })
    })

    next ()
})

function successResponse(res, message, data, status = 2000) {
    return res.status(status).json
}