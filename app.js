import express from 'express'
import bodyParser from 'body-parser'
// import mainRoutes from './server/router/mainRouter.js'
// import listsRoutes from './server/router/listsRouter.js'
// import chatRoutes from './server/router/chatRouter.js'
// import profileRoutes from './server/router/profileRouter.js'
import authRoutes from './server/router/authRouter.js'
// import partnershipRoutes from './server/router/partnershipRouter.js'
import { config } from './server/config/config.js'
// import { db } from './server/config/database.js'
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

// app.use('/main', mainRoutes)
// app.use('/lists', listsRoutes)
// app.use('/chat', chatRoutes)
// app.use('/profile', profileRoutes)
app.use('/auth', authRoutes)
// app.use('/partnership', partnershipRoutes)

connectDB()
    .then(() => {
        app.listen(config.host.port)
    })
    .catch(console.log)
