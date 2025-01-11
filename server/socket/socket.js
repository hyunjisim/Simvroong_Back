import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import Order from '../schema/TotalOrderDB.js'
import User from '../schema/UserSchema.js'

class Socket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        })

        this.connectedUsers = new Map()

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token
            if (!token) {
                return next(new Error('인증 에러: 토큰이 없습니다.'))
            }

            jwt.verify(token, config.jwt.secretKey, (error, decoded) => {
                if (error) {
                    return next(new Error('인증 에러: 잘못된 토큰입니다.'))
                }
                socket.userId = decoded.id
                next()
            })
        })

        this.io.on('connection', socket => {
            console.log('새로운 클라이언트 연결')

            socket.on('joinRoom', async ({ taskId, token }) => {
                try {
                    // 토큰 검증 및 사용자 정보 조회
                    const decoded = jwt.verify(token, config.jwt.secretKey)
                    const currentUser = await User.findById(decoded.id)
                    const task = await Order.findById(taskId).populate('chatPartner') // chatPartner 정보 포함

                    if (!task) {
                        return socket.emit('error', { message: '작업을 찾을 수 없습니다.' })
                    }

                    // 방에 참가
                    socket.join(taskId)

                    // 방 데이터 전송
                    socket.emit('roomData', {
                        messages: task.messages, // 메시지 리스트
                        currentUser,
                        chatPartner: task.chatPartner
                    })
                } catch (error) {
                    console.error('방 참가 오류:', error)
                    socket.emit('error', { message: '방에 참가할 수 없습니다.' })
                }
            })

            socket.on('sendMessage', async messageData => {
                const { taskId, userId, message, timestamp } = messageData
                try {
                    // 메시지 데이터베이스에 저장
                    const order = await Order.findById(taskId)
                    const newMessage = { fromUserId: userId, message, timestamp }
                    order.messages.push(newMessage)
                    await order.save()

                    // 메시지 전송
                    this.io.to(taskId).emit('newMessage', newMessage)
                } catch (error) {
                    console.error('메시지 전송 오류:', error)
                }
            })

            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제')
            })
        })
    }
}

let socket

export function initSocket(server) {
    if (!socket) {
        socket = new Socket(server)
    }
}

export function getSocketIo() {
    if (!socket) {
        throw new Error('먼저 initSocket을 호출하세요.')
    }
    return socket.io
}
