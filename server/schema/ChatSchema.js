import { virtualId } from '../query/connectDBQuery.js'
import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema({
    taskId: {type: mongoose.Schema.Types.ObjectId,required: true},
    TaskUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    toTaskUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // 거래 내역 (상단 박스)
    transactionDetails: {
        title: { type: String, required: true }, // 심부름 제목
        price: { type: Number, required: true }, // 금액
        category: { type: String, required: true }, // 카테고리
        photoUrl: { type: String, default: '' }, // 거래 사진
        status: {
            type: String,
            enum: ['진행 중', '완료', '취소'],
            default: '진행 중'
        }
    },
    lastMessage: { type: String }, // 마지막 메시지 내용
    lastMessageTime: { type: Date }, // 마지막 메시지 시간
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
virtualId(ChatSchema)

// User모델 생성
const Chat = mongoose.model('Chat', ChatSchema)

export default Chat
