import * as chatRepository from '../query/chatQuery.js';
import { getSocketIo } from '../socket/socket.js';

// 채팅 리스트 조회
export async function getChatList(req, res) {
    const userId = req.mongo_id; // 로그인한 사용자 ID
    try {
        const chatList = await chatRepository.getChatList(userId);
        res.status(200).json(chatList);
    } catch (error) {
        res.status(500).json({ message: '채팅 리스트 조회 실패', error });
    }
}

// 메시지 전송
export async function sendMessage(req, res) {
    const { userId: toUserId, roomId } = req.params; // URL에서 상대방 ID와 방 ID 추출
    const { message } = req.body;
    const fromUserId = req.mongo_id; // 인증 미들웨어에서 가져온 사용자 ID

    try {
        // 메시지 저장
        const savedMessage = await chatRepository.saveMessage({
            fromUserId,
            toUserId,
            roomId,
            message,
        });

        // 실시간 메시지 전송
        const io = getSocketIo();
        const toSocketId = io.connectedUsers.get(toUserId); // 상대방 소켓 ID 가져오기
        console.log(toSocketId);

        if (toSocketId) {
            io.to(roomId).emit('receiveMessage', savedMessage);
        }

        res.status(201).json({ success: true, message: savedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '메시지 전송 실패' });
    }
}

// 채팅 메시지 조회
export async function getChatMessages(req, res) {
    const { userId: chatPartnerId, roomId } = req.params;
    const userId = req.mongo_id; // 인증된 사용자 ID

    try {
        const messages = await chatRepository.getMessagesByUser(userId, chatPartnerId);
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: '메시지 조회 실패' });
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


