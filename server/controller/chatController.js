import * as chatRepository from '../query/chatQuery.js'
import * as authRepository from '../query/authQuery.js'

export async function getChatList(req, res) {
    const userId = req.mongo_id // 로그인한 사용자 ID

    try {
        const chatList = await chatRepository.getChatList(userId)
        res.status(200).json(chatList)
    } catch (error) {
        res.status(500).json({ message: '채팅 리스트 조회 실패', error })
    }
}

// 1대1 채팅 내역 조회
export async function getChatMessages(req, res) {
    const fromUserId = req.mongo_id // 현재 로그인한 사용자 ID (isAuth에서 추출)
    const toUserId = req.params.userId // 상대방 사용자 ID (URL에서 추출)

    try {
        const messages = await chatRepository.getMessages(fromUserId, toUserId)
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: '채팅 내역 조회 실패', error })
    }
}

// 읽음 처리
export async function markMessagesAsRead(req, res) {
    const fromUserId = req.params.userId // 메시지를 보낸 사용자 ID
    const toUserId = req.mongo_id // 현재 로그인한 사용자 ID

    try {
        await chatRepository.markAsRead(fromUserId, toUserId)
        res.status(200).json({ message: '읽음 처리 완료' })
    } catch (error) {
        res.status(500).json({ message: '읽음 처리 실패', error })
    }
}

// 새 메시지 전송
export async function sendMessage(req, res) {
    const fromUserId = req.mongo_id // 현재 로그인한 사용자 ID
    const toUserId = req.params.userId // 메시지를 받을 사용자 ID
    const { message } = req.body // 메시지 내용

    try {
        const user = await authRepository.findUserById(toUserId)

        const newMessage = await chatRepository.saveMessage({ fromUserId, toUserId: user._id, message })
        res.status(201).json(newMessage)
    } catch (error) {
        res.status(500).json({ message: '메시지 전송 실패', error })
    }
}
