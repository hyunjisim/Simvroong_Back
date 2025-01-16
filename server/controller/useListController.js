import * as useListQuery from '../query/useListQuery.js';

// 심부름 등록 조회
export const findTask = async(req, res) => {
    const user_Id = req.mongo_id; // 인증된 사용자 ID
    try{
        const lists = await useListQuery.findOrderByUser(user_Id);
        if(!lists){
            return res.status(400).json({ message: '심부름을 못 가져 옵니다.' });
        }
        return res.status(200).json({ data: lists });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

// 심부름 신청 조회
// 이게 심부름 신청
export async function findPartnerTask(req, res) {
    const user_Id = req.mongo_id    
    try{
        const lists = await useListQuery.findListsByPartner(user_Id);
        if(!lists){
            return res.status(400).json({ message: '심부름을 못 가져 옵니다.' });
        }
        return res.status(200).json({ data: lists });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

// 심부름 신청상태 업데이트
export async function UpdateActive(req, res) {
    //채팅 만들어 졌는지 유저아이디로 확인해야함 ToTaskuser랑 비교해야함
    const user_Id = req.mongo_id
    const {taskId} = req.body
    try{
        const updateActive = await useListQuery.UpdateActive(taskId,user_Id);
        if(!updateActive){
            return res.status(400).json({ message: '심부름을 못 가져 옵니다.' });
        }
        return res.status(200).json({ data: updateActive });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}
