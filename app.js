import express from 'express'
import profileRoutes from './server/router/profileRouter.js'
import authRoutes from './server/router/authRouter.js'
import { config } from './server/config/config.js'
import connectDB from './server/query/connectDBQuery.js'
import cors from 'cors'
import path from "path";
import { fileURLToPath } from "url";

import PartnerRouter from './server/router/PartnershipRouter.js'

const app = express()

// ES Module 환경에서 __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 경로 설정
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
    cors({
        origin: '*',
        credentials: true
    })
)

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use("/partnership", PartnerRouter)

connectDB()
    .then(() => {
        const server = app.listen(config.host.port)
    })
    .catch(console.log)
