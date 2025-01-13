import Chat from '../schema/ChatSchema.js'
import User from '../schema/UserSchema.js'
import * as authRepository from '../query/authQuery.js'
import mongoose from 'mongoose';

export async function getChatRoomList(req, res) {
    // const userId = req.user.id; // 사용자 인증 미들웨어로 가져온 사용자 ID
    const mongo_id = req.mongo_id; // 로그인한 사용자 ID
    console.log('로그인한 사용자 ID:', mongo_id);

    try {
        // const taskUserRooms = await Chat.find({ TaskUserId: new mongoose.Types.ObjectId(mongo_id) })
        // .sort({ lastMessageTime: -1 })
        // .select('_id lastMessage lastMessageTime TaskUserId toTaskUserId');
    
        // // toTaskUserId로 검색
        // const toTaskUserRooms = await Chat.find({ toTaskUserId: new mongoose.Types.ObjectId(mongo_id) })
        //     .sort({ lastMessageTime: -1 })
        //     .select('_id lastMessage lastMessageTime TaskUserId toTaskUserId');
        
        // // 두 검색 결과를 합치기
        // const chatRooms = [...taskUserRooms, ...toTaskUserRooms];
        
        // console.log('검색된 채팅방 리스트:', chatRooms,taskUserRooms,toTaskUserRooms);


        // // 닉네임 정보 추가
        // const otherUserNickname = await Promise.all(
        //     chatRooms.map(async (room) => {
        //         const otherUserId =
        //             room.TaskUserId.toString() === mongo_id
        //                 ? room.toTaskUserId
        //                 : room.TaskUserId;

        //         // 다른 사용자의 닉네임 가져오기
        //         const otherUser = await User.findById(otherUserId).select('nickname');

        //         return {
        //             _id: room._id,
        //             lastMessage: room.lastMessage,
        //             lastMessageTime: room.lastMessageTime,
        //             otherUserNickname: otherUser?.nickname || 'Unknown User',
        //         };
        //     })
        // );
        // console.log('채팅방 리스트:', otherUserNickname);
        // 이제 닉네임도 같이 보내면됨
        //  다만 TaskUserId로 찾았다면 toTaskUserId로 User.find로 닉네임을 찾아서 보내야하고
        // toTaskUserId로 찾았다면 TaskUserId로 User.find로 닉네임을 찾아서 보내면 됨

        // TaskUserId로 검색
        const taskUserRooms = await Chat.find({ TaskUserId: new mongoose.Types.ObjectId(mongo_id) })
            .sort({ lastMessageTime: -1 })
            .select('_id lastMessage lastMessageTime TaskUserId toTaskUserId');

        // toTaskUserId로 검색
        const toTaskUserRooms = await Chat.find({ toTaskUserId: new mongoose.Types.ObjectId(mongo_id) })
            .sort({ lastMessageTime: -1 })
            .select('_id lastMessage lastMessageTime TaskUserId toTaskUserId');

        // 두 검색 결과 합치기
        const chatRooms = [...taskUserRooms, ...toTaskUserRooms];

        // 닉네임 정보 추가
        const chatRoomsWithNicknames = await Promise.all(
            chatRooms.map(async (room) => {
                let otherUserId;
                let otherUserNickname;

                // TaskUserId로 데이터를 찾았을 경우
                if (room.TaskUserId.toString() === mongo_id) {
                    otherUserId = room.toTaskUserId; // 상대방 ID는 toTaskUserId
                }
                // toTaskUserId로 데이터를 찾았을 경우
                else if (room.toTaskUserId.toString() === mongo_id) {
                    otherUserId = room.TaskUserId; // 상대방 ID는 TaskUserId
                }
                console.log('otherUserId',otherUserId);

                // 상대방 ID로 닉네임 조회
                if (otherUserId) {
                    const otherUser = await User.findById(new mongoose.Types.ObjectId(otherUserId))
                        .select('nickname');
                    otherUserNickname = otherUser?.nickname || 'Unknown User';
                } else {
                    otherUserNickname = 'Unknown User';
                }

                return {
                    _id: room._id,
                    lastMessage: room.lastMessage,
                    lastMessageTime: room.lastMessageTime,
                    otherUserNickname: otherUserNickname
                };
            })
        );

        console.log('채팅방 리스트:', chatRoomsWithNicknames);

        res.status(200).json({ success: true, data: chatRoomsWithNicknames });

        // res.status(200).json({ success: true, data: chatRooms });
    } catch (error) {
        console.error('채팅룸 리스트 조회 중 오류:', error);
        res.status(500).json({ success: false, message: '채팅룸 리스트 조회 실패', error });
    }
}