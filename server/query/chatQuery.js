import Chat from '../schema/ChatSchema.js'

export async function getChatList(userId) {
    return await Chat.aggregate([
        {
            $match: {
                $or: [
                    { fromUserId: userId }, // 내가 보낸 메시지
                    { toUserId: userId } // 내가 받은 메시지
                ]
            }
        },
        {
            $group: {
                _id: {
                    // 사용자별로 그룹화
                    partnerId: {
                        $cond: {
                            if: { $eq: ['$fromUserId', userId] },
                            then: '$toUserId',
                            else: '$fromUserId'
                        }
                    }
                },
                lastMessage: { $last: '$message' }, // 마지막 메시지
                unreadCount: {
                    $sum: {
                        $cond: [{ $and: [{ $eq: ['$toUserId', userId] }, { $eq: ['$isRead', false] }] }, 1, 0]
                    }
                },
                updatedAt: { $last: '$createdAt' } // 최신 메시지 시간
            }
        },
        {
            $sort: { updatedAt: -1 } // 최신 메시지 기준 정렬
        }
    ])
}

// 메시지 저장
export async function saveMessage({ fromUserId, toUserId, message }) {
    const newMessage = new Chat({
        fromUserId,
        toUserId,
        message
    })
    await newMessage.save()
    return newMessage
}

// 특정 사용자 간의 채팅 내역 조회
export async function getMessages(fromUserId, toUserId) {
    const messages = await Chat.find({
        $or: [
            { fromUserId, toUserId }, // 내가 보낸 메시지
            { fromUserId: toUserId, toUserId: fromUserId } // 상대가 보낸 메시지
        ]
    })
        .sort({ createdAt: 1 }) // 오래된 메시지부터 정렬
        .exec()
    return messages
}

// 메시지 읽음 처리
export async function markAsRead(fromUserId, toUserId) {
    await Chat.updateMany(
        { fromUserId, toUserId, isRead: false }, // 읽지 않은 메시지
        { $set: { isRead: true } } // 읽음 처리
    )
}

export async function getUnreadMessages(toUserId) {
    const count = await Chat.countDocuments({
        toUserId,
        isRead: false
    }).exec()
    return count
}
