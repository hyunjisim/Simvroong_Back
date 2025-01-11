import Chat from '../schema/ChatSchema.js'
import mongoose from 'mongoose';

export async function getChatRoomList(req, res) {
    const userId = req.user.id; // 사용자 인증 미들웨어로 가져온 사용자 ID

    try {
        const taskUserRooms = await Chat.find({ TaskUserId: userId })
        .sort({ lastMessageTime: -1 })
        .populate('participants', 'nickname profileImage')
        .select('channel lastMessage lastMessageTime participants');
    
        // toTaskUserId로 검색
        const toTaskUserRooms = await Chat.find({ toTaskUserId: userId })
            .sort({ lastMessageTime: -1 })
            .populate('participants', 'nickname profileImage')
            .select('channel lastMessage lastMessageTime participants');
        
        // 두 검색 결과를 합치기
        const chatRooms = [...taskUserRooms, ...toTaskUserRooms];
        
        console.log('검색된 채팅방 리스트:', chatRooms,taskUserRooms,toTaskUserRooms);

        res.status(200).json({ success: true, data: chatRooms });
    } catch (error) {
        console.error('채팅룸 리스트 조회 중 오류:', error);
        res.status(500).json({ success: false, message: '채팅룸 리스트 조회 실패', error });
    }
}