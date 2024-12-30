import { virtualId } from '../query/connectDBQuery.js'
import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema({
    // TotalOrder 기준으로 생성
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TotalOrder', // 심부름(거래) 건별 연결
        required: true
    },

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

    // 메시지 내역
    messages: [
        {
            fromUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            toUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: { type: String, required: true },
            type: {
                type: String,
                enum: ['text', 'image', 'file'],
                default: 'text'
            },
            timestamp: { type: Date, default: Date.now },
            isRead: { type: Boolean, default: false }
        }
    ],

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
