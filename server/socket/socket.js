import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import Chat from '../schema/ChatSchema.js'
import Message from '../schema/MessageSchema.js'
import mongoose from "mongoose";
import User from '../schema/UserSchema.js'
import { Expo } from "expo-server-sdk";

const expo = new Expo();

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

            // Join Room
            socket.on('joinRoom', async ({ channel, token }) => {
                try {
                    console.log(`Joining room: ${channel}`);
                    // 방에 참가
                    socket.join(channel);
                    console.log(`Socket Rooms: `, socket.rooms); // 현재 소켓이 속한 방 출력

                } catch (error) {
                    console.error('방 참가 오류:', error);
                    socket.emit('error', { message: '방에 참가할 수 없습니다.' });
                }
            });


            // Send Message
            socket.on('sendMessage', async (messageData) => {
                try {
                    const { channel, userId, message, timestamp, taskId } = messageData;
                    // console.log(messageData);
                    // console.log('channel:',channel,'sender',userId);
                    let newMessage;
                    let lastMessageSave

                    // 메시지를 데이터베이스에 저장
                    const chat = await Message.findOne({chatRoomId: new mongoose.Types.ObjectId(channel) });
                    if (!chat) {
                        // 메시지 추가
                        newMessage = new Message({
                            chatRoomId: new mongoose.Types.ObjectId(channel),
                            sender: userId,
                            content: message,
                            timestamp: timestamp || new Date(),
                        });
                        await newMessage.save(); // 메시지 저장

                            // 기존 Chat 문서 업데이트
                        lastMessageSave = await Chat.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(channel) },
                            {
                                lastMessage: message,
                                lastMessageTime: timestamp || new Date(),
                            }
                        );

                        // console.log('새 채팅방의 첫 번째 메시지 저장 성공:', newMessage);
                        // console.log('Chat에 lastMessage 저장 성공:', lastMessageSave);
                    }else {
                        // 채팅방이 이미 존재하면 메시지 추가
                        newMessage = new Message({
                            chatRoomId: chat.chatRoomId,
                            sender: new mongoose.Types.ObjectId(userId),
                            content: message,
                            timestamp: timestamp || new Date(),
                        });
                        await newMessage.save(); // 메시지 저장

                            // 기존 Chat 문서 업데이트
                        lastMessageSave = await Chat.findOneAndUpdate(
                            { _id: new mongoose.Types.ObjectId(channel) },
                            {
                                lastMessage: message,
                                lastMessageTime: timestamp || new Date(),
                            }
                        );

                        // console.log('기존 채팅방에 메시지 저장 성공:', newMessage);console.log('Chat에 lastMessage 저장 성공:', lastMessageSave);
                    }
                    
                    const chatting = await Chat.findOne({ taskId : new mongoose.Types.ObjectId(taskId) })
                    if (userId === String(chatting.TaskUserId)) {
                        const user = await User.findById(chatting.toTaskUserId)
                        const token = user.expoPushToken
                        const pushAlarm = [
                            {
                                to: token,
                                sound: 'default',
                                title: user.nickname,
                                body: message,
                                data: { additionalData: "some data"}
                            }
                        ]

                        await expo.sendPushNotificationsAsync(pushAlarm);
                    }else{
                        const user = await User.findById(chatting.TaskUserId)
                        const token = user.expoPushToken
                        const pushAlarm = [
                            {
                                to: token,
                                sound: 'default',
                                title: user.nickname,
                                body: message,
                                data: { additionalData: "some data"}
                            }
                        ]

                        await expo.sendPushNotificationsAsync(pushAlarm);
                    }
                    

                    // // 저장된 메시지를 클라이언트에 전송
                    this.io.to(channel).emit('newMessage', newMessage);
                } catch (error) {
                    console.error('메시지 저장 중 오류:', error);
                }
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제');
            });
        });
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
