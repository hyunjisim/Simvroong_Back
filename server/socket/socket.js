import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'

class Socket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*'
            }
        })

        // 사용자별 소켓 ID를 저장할 맵
        this.connectedUsers = new Map()

        // 소켓 인증
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token
            if (!token) {
                return next(new Error('인증 에러: 토큰이 없습니다.'))
            }

            jwt.verify(token, config.jwt.secretKey, (error, decoded) => {
                if (error) {
                    return next(new Error('인증 에러: 잘못된 토큰입니다.'))
                }
                socket.userId = decoded.id // JWT에서 사용자 ID 추출
                next()
            })
        })

        // 연결 이벤트
        this.io.on('connection', socket => {
            console.log(`사용자 연결: ${socket.userId}`)

            // 사용자 ID와 소켓 ID 매핑
            this.connectedUsers.set(socket.userId, socket.id)

            // 연결 해제 시 소켓 ID 제거
            socket.on('disconnect', () => {
                console.log(`사용자 연결 해제: ${socket.userId}`)
                this.connectedUsers.delete(socket.userId)
            })

            // 메시지 처리
            socket.on('sendMessage', ({ toUserId, message }) => {
                this.handleMessage(socket.userId, toUserId, message)
            })
        })
    }

    // 1대1 메시지 처리
    handleMessage(fromUserId, toUserId, message) {
        const toSocketId = this.connectedUsers.get(toUserId)
        if (toSocketId) {
            this.io.to(toSocketId).emit('receiveMessage', {
                fromUserId,
                message
            })
        } else {
            console.log(`사용자 ${toUserId}는 현재 오프라인입니다.`)
            // 오프라인 사용자를 위한 추가 로직 (예: DB에 저장)
        }
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
