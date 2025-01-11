import { virtualId } from '../query/connectDBQuery.js'
import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }, // 채팅방 ID
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 메시지 보낸 사용자
    content: { type: String, required: true }, // 메시지 내용
    timestamp: { type: Date, default: Date.now }, // 전송 시간
});

virtualId(MessageSchema)

// User모델 생성
const Message = mongoose.model('Message', MessageSchema)

export default Message