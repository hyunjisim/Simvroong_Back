import express from 'express'
import profileRoutes from './server/router/profileRouter.js'
import authRoutes from './server/router/authRouter.js'
import chatRoutes from './server/router/chatRouter.js'
import mainRoutes from './server/router/mainRouter.js'
import orderRoutes from './server/router/orderRouter.js'
import { config } from './server/config/config.js'
import connectDB from './server/query/connectDBQuery.js'
import cors from 'cors'
import http from 'http'
import { initSocket } from './server/socket/socket.js'
import path from "path";
import { fileURLToPath } from "url";
import PartnerRouter from './server/router/PartnershipRouter.js'
import likeListRoutes from './server/router/likeListsRouter.js'
import matchRoutes from './server/router/matchRouter.js'
import listRoutes from './server/router/useListRouter.js'
import searchRoutes from './server/router/searchRouter.js'
import MoneyRouter from './server/router/MoneyRouter.js'
import notification from './server/router/notificationRouter.js'

const app = express()


// http 서버 생성
const server = http.createServer(app)
// const io = new Server(server);

initSocket(server)

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

app.use('/list', listRoutes)
app.use('/main', mainRoutes)
app.use('/order', orderRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/chat', chatRoutes)
app.use('/likelists', likeListRoutes)
app.use('/check', matchRoutes)
app.use("/partnership", PartnerRouter)
app.use("/search", searchRoutes)
app.use("/money", MoneyRouter)
app.use("/notification", notification)

connectDB()
    .then(() => {
        server.listen(config.host.port, () => {
            console.log('서버 실행중')
        })
    })
    .catch(console.log)

initSocket(server);