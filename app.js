import express from 'express'
import profileRoutes from './server/router/profileRouter.js'
import authRoutes from './server/router/authRouter.js'
import { config } from './server/config/config.js'
import connectDB from './server/query/connectDBQuery.js'
import cors from 'cors'

const app = express()

app.use(
    cors({
        origin: '*',
        credentials: true
    })
)

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

connectDB()
    .then(() => {
        const server = app.listen(config.host.port)
    })
    .catch(console.log)
