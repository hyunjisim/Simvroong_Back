import Chat from '../schema/ChatSchema.js';
import User from '../schema/UserSchema.js';
import Order from '../schema/TotalOrderDB.js'
import mongoose from 'mongoose';

export async function creatChat(taskId,userId,currentUserId){
    try {
        // console.log('creatChat 호출됨 - 전달된 값:', { taskId, userId, currentUserId });
        // Order 컬렉션에서 taskId로 데이터 조회
        const order = await Order.findOne({ taskId });
        if (!order) {
            throw new Error('해당 taskId로 Order 데이터를 찾을 수 없습니다.');
        }
        // console.log('조회된 Order 데이터:', order);

        // Chat 문서 생성
        const chat = new Chat({
            taskId,
            TaskUserId: userId,
            toTaskUserId: currentUserId,
            createdAt: new Date(),
            transactionDetails: {
                title: order.title,
                price: order.payment.serviceFee,
                category: order.category,
                photoUrl: order.taskDetails.photoUrl,
                status: '진행 중', // 기본값
            },
        });

        // Chat 저장
        return await chat.save();
    } catch (error) {
        console.error('채팅 생성 실패:', error);
        throw error;
    }
}

// 채팅 게시물 조회
export async function getChatData(channel) {
    try {
        // `channel`이 ObjectId로 변환 가능한지 확인
        if (!mongoose.Types.ObjectId.isValid(channel)) {
            throw new Error(`유효하지 않은 channel 값: ${channel}`);
        }

        // `channel`을 ObjectId로 변환
        const chatData = await Chat.findOne({ _id: new mongoose.Types.ObjectId(channel) }).select('-messages');
        if (!chatData) {
            throw new Error('해당 채널의 채팅 데이터를 찾을 수 없습니다.');
        }

        return chatData;
    } catch (error) {
        console.error('채팅 데이터 조회 중 오류:', error.message);
        throw error;
    }
}

// // 채팅 리스트 조회
// export async function getChatList(userId) {
//     return await Chat.aggregate()
// }

// 메시지 저장
export async function saveMessage(chatRoomId, senderId, content) {
    // 메시지 저장
    const newMessage = new ChatMessage({
        chatRoomId,
        sender: senderId,
        content,
    });
    await newMessage.save();

     // 채팅방 메타데이터 업데이트
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
        lastMessage: content,
        lastMessageTime: new Date(),
    });

    return await newMessage;
}

//채팅방의 최근 메시지 가져오기
async function getRecentChatRooms(userId) {
    const chatRooms = await ChatRoom.find({ participants: userId })
        .sort({ lastMessageTime: -1 }) // 최근 메시지 기준으로 정렬
        .populate('participants', 'nickname'); // 참여자 정보 로드

    return chatRooms;
}

//특정 채팅방의 메시지 가져오기
async function getMessages(chatRoomId, limit = 20, skip = 0) {
    const messages = await ChatMessage.find({ chatRoomId })
        .sort({ timestamp: -1 }) // 최신 메시지 순으로 정렬
        .skip(skip)
        .limit(limit)
        .populate('sender', 'nickname'); // 메시지 보낸 사용자 정보 로드

    return messages;
}

// // 메시지 읽음 처리
// export async function markMessagesAsRead(toUserId, fromUserId) {
//     return await Chat.updateMany(
//         { toUserId, fromUserId, isRead: false },
//         { isRead: true }
//     ).exec();
// }

// // 읽지 않은 메시지 수 조회
// export async function getUnreadMessages(toUserId) {
//     return await Chat.countDocuments({ toUserId, isRead: false }).exec();
// }

// // 거래 ID별 메시지 조회
// export async function getMessagesByTaskId(taskId) {
//     return await Chat.find({ taskId }).sort({ createdAt: 1 }).exec();
// }

// // 사용자 ID로 사용자 정보 조회
// export async function getUserById(userId) {
//     return await User.findById(userId).exec();
// }

// // 채팅 상대방 정보 조회
// export async function getChatPartner(taskId, userId) {
//     const chat = await Chat.findOne({
//         taskId,
//         fromUserId: { $ne: userId },
//     }).exec();
//     return chat ? await getUserById(chat.fromUserId) : null;
// }
