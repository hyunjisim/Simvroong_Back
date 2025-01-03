import Chat from '../schema/ChatSchema.js';
import User from '../schema/UserSchema.js';

// 채팅 리스트 조회
export async function getChatList(userId) {
    return await Chat.aggregate([
        {
            $match: {
                $or: [
                    { fromUserId: userId }, // 내가 보낸 메시지
                    { toUserId: userId },   // 내가 받은 메시지
                ],
            },
        },
        {
            $group: {
                _id: {
                    partnerId: {
                        $cond: {
                            if: { $eq: ['$fromUserId', userId] },
                            then: '$toUserId',
                            else: '$fromUserId',
                        },
                    },
                },
                lastMessage: { $last: '$message' }, // 마지막 메시지
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$toUserId', userId] }, { $eq: ['$isRead', false] }] },
                            1,
                            0,
                        ],
                    },
                },
                updatedAt: { $last: '$createdAt' }, // 최신 메시지 시간
            },
        },
        { $sort: { updatedAt: -1 } }, // 최신 메시지 기준 정렬
    ]);
}

// 메시지 저장
export async function saveMessage({ fromUserId, toUserId, taskId, message }) {
    const chatMessage = new Chat({
        fromUserId,
        toUserId,
        taskId,
        message,
        isRead: false, // 기본값: 읽지 않음
        createdAt: new Date(),
    });
    return await chatMessage.save();
}

// 사용자 간 메시지 조회
export async function getMessagesByUser(fromUserId, toUserId) {
    return await Chat.find({
        $or: [
            { fromUserId, toUserId },
            { fromUserId: toUserId, toUserId: fromUserId },
        ],
    })
        .sort({ createdAt: 1 }) // 시간순 정렬
        .exec();
}

// 메시지 읽음 처리
export async function markMessagesAsRead(toUserId, fromUserId) {
    return await Chat.updateMany(
        { toUserId, fromUserId, isRead: false },
        { isRead: true }
    ).exec();
}

// 읽지 않은 메시지 수 조회
export async function getUnreadMessages(toUserId) {
    return await Chat.countDocuments({ toUserId, isRead: false }).exec();
}

// 거래 ID별 메시지 조회
export async function getMessagesByTaskId(taskId) {
    return await Chat.find({ taskId }).sort({ createdAt: 1 }).exec();
}

// 사용자 ID로 사용자 정보 조회
export async function getUserById(userId) {
    return await User.findById(userId).exec();
}

// 채팅 상대방 정보 조회
export async function getChatPartner(taskId, userId) {
    const chat = await Chat.findOne({
        taskId,
        fromUserId: { $ne: userId },
    }).exec();
    return chat ? await getUserById(chat.fromUserId) : null;
}
