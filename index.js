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
    return res.status(status).json({
        success: true,
        message,
        data,
        error: null,
    })
}

function errorResponse(res, message, details = null) {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error: details,
    })
}

const biodataSchema = Joi.object({
    id: Joi.number().integer().positive(),
    nama: Joi.string().trim().min(2).max(100).required(),
    nim: Joi.string.trim().min(5).max(20).required(),
    kelas: Joi.string.trim().min(1).max(20).required(),
})

const idSchema = Joi.object({
    id: Joi.number().integer().positive().required()
})

function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res,
                'validasi input gagal',
                400,
                error.details.map(item => ({
                    field: item.path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.body() = value
        next ()
    }
}

function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res,
                'parameter tidak valid',
                400,
                error.details.map(item => ({
                    field: item.path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.params() = value
        next ()
    }
}

app.get('/', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM biodata ORDER BY id'
    )

    return successResponse(res, 'Data berhasil diambil', result.rows)
})

app.post(
    '/biodata',
    validateBody(biodataSchema),
    async (req, res) => {
        const { id, nama, nim, kelas } = req.body
        const result = await pool.query(
            `insert into bioata (id, nama, nim, kelas)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [id ?? null, nama, nim, kelas]
        )

        return successResponse(
            res, 'Data berhail ditambahkan',
            result.rows(0),
            201
        )
    }
)

app.put(
    '/biodata',
    validateBody(biodataSchema),
    validateBody(biodataSchema.fork(
        ['nama', 'nim', 'kelas'],
        field => field.required()
    ).fork(['id'], field.forbidden())),
    async (req, res) => {
        const { id } = req.params
        const { nama, nim, kelas } = req.body

        const result = await pool.query(
            `UPDATE BIODATA
            SET NAMA = $1, nim = $2, kelas = $3
            where id = $4
            returnig *`,
            [nama, nim, kelas, id]
        )
    }
)