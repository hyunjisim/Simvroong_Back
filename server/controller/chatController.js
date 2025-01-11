import * as chatRepository from '../query/chatQuery.js';
import { getSocketIo } from '../socket/socket.js';
import Chat from '../schema/ChatSchema.js';
import User from '../schema/UserSchema.js';
import Order from '../schema/TotalOrderDB.js'
import Message from '../schema/MessageSchema.js';
import mongoose from 'mongoose';


export async function creatChat(req, res) {
    const { channel } = req.params;
    const { taskId, userId, currentUserId } = req.body;

    console.log('요청 데이터(req.body):', req.body);
    console.log('요청 파라미터(req.params):', req.params);

    if (!taskId || !userId || !currentUserId) {
        console.error('필수 데이터 누락:', { taskId, userId, currentUserId });
        return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
    }

    try {
        // taskId를 ObjectId로 변환
        const order = await Order.findOne({ taskId: new mongoose.Types.ObjectId(taskId) });
        console.log('Order 데이터:', order);

        if (!order) {
            console.error('Order 데이터가 없습니다:', { taskId });
            return res.status(404).json({ message: 'Order 데이터를 찾을 수 없습니다.' });
        }

        const chat = new Chat({
            taskId,
            TaskUserId: userId,
            toTaskUserId: currentUserId,
            createdAt: new Date(),
            transactionDetails: {
                title: order?.title || '제목 없음',
                price: order?.payment?.serviceFee || 0,
                category: order?.category || '카테고리 없음',
                photoUrl: order?.taskDetails?.photoUrl || '',
                status: '진행 중',
            },
        });

        const savedChat = await chat.save();
        console.log('생성된 Chat 데이터:', savedChat);

        res.status(201).json({ 
            success: true, 
            data:{
                _id: savedChat._id,
                taskId: savedChat.taskId,
                TaskUserId: savedChat.TaskUserId,
                toTaskUserId: savedChat.toTaskUserId,
                transactionDetails: savedChat.transactionDetails,
            },
        });
    } catch (error) {
        console.error('채팅방 생성 중 오류:', error.message);
        res.status(500).json({ message: '채팅방 생성 실패', error: error.message });
    }
}



export async function getChatData(req, res) {
    const { channel } = req.params; // URL 파라미터에서 channel 값을 추출
    try {
        if (!channel) {
            return res.status(400).json({ message: '채널 값이 제공되지 않았습니다.' });
        }

        const ChatData = await chatRepository.getChatData(channel);
        res.status(200).json(ChatData);
    } catch (error) {
        console.error('채팅 데이터 조회 중 오류:', error.message);
        res.status(500).json({ message: '채팅 데이터 조회 실패', error });
    }
}


// 채팅 리스트 조회
export async function getChatList(req, res) {
    const currentUserId = req.currentUserId; // 로그인한 사용자 ID
    try {
        const chatList = await Chat.fine({TaskUserId: new mongoose.Types.ObjectId(currentUserId)});
        res.status(200).json(chatList);
    } catch (error) {
        res.status(500).json({ message: '채팅 리스트 조회 실패', error });
    }
}

// 메시지 전송 저장
export async function sendMessage(req, res) {
    res.status(400).json({ message: '메시지 전송은 소켓으로 처리됩니다.' });
}

// 채팅 메시지 조회
export async function getChatMessages(req, res) {
    try {
        const { channel } = req.params;

        // ObjectId 검증
        if (!mongoose.Types.ObjectId.isValid(channel)) {
            return res.status(400).json({ message: '유효하지 않은 채널 ID입니다.' });
        }

        const chat = await Message.find({ chatRoomId: new mongoose.Types.ObjectId(channel) })
            .sort({ timestamp: 1 })


        if (!chat|| chat.length === 0) {
            return res.status(404).json({ message: '채팅 내역을 찾을 수 없습니다.' });
        }

        res.status(200).json(chat.reverse());

    } catch (error) {
        console.error('채팅 데이터 조회 중 오류:', error);
        res.status(500).json({ message: '채팅 데이터 조회 실패', error });
    }
}

// 메시지 읽음 처리
export async function markMessagesAsRead(req, res) {
    const { userId: fromUserId } = req.params; // 상대방 ID
    const toUserId = req.mongo_id; // 인증된 사용자 ID

    try {
        await chatRepository.markMessagesAsRead(toUserId, fromUserId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '읽음 처리 실패' });
    }
}


