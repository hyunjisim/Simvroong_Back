import * as matchQuery from '../query/matchQuery.js';
import User from '../schema/UserSchema.js';

// 심부름 수락 처리
export const handleAcceptOrder = async (req, res) => {
    const user_Id = req.mongo_id; // 인증된 사용자 ID
    const { taskId } = req.params; // URL에서 taskId 가져오기
    const user = await User.findById(user_Id);
    const userId = user.userId;

    try {
        // 1. 사용자 파트너 여부 확인
        const isPartner = await matchQuery.checkUserIsPartner(userId);
        if (!isPartner) {
            return res.status(400).json({ message: '파트너가 아닙니다.' });
        }

        // 2. 이미 수락된 심부름인지 확인
        const order = await matchQuery.checkOrderIsAccepted( taskId );
        if (order.isAccepted) {
            return res.status(400).json({ message: '이미 수락된 심부름입니다.' });
        }

        // 3. 조건 충족 시 심부름 수락
        const acceptedOrder = await matchQuery.acceptOrder(taskId, user_Id);
        if (!acceptedOrder) {
            return res.status(500).json({ message: '심부름 수락 중 오류가 발생했습니다.' });
        }

        return res.status(200).json({
            message: '심부름이 성공적으로 수락되었습니다.',
            order: acceptedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 심부름 취소 처리
export const handleCancelOrder = async (req, res) => {
    const { taskId } = req.params; // URL에서 taskId 가져오기
    try {
        const completedOrder = await matchQuery.cancelOrder(taskId);
        if (!completedOrder) {
            return res.status(500).json({ message: '심부름 취소 처리 중 오류가 발생했습니다.' });
        }

        return res.status(200).json({
            message: '심부름이 취소되었습니다.',
            order: completedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}


// 심부름 완료 처리
export const handleCompleteOrder = async (req, res) => {
    const { taskId } = req.params; // URL에서 taskId 가져오기

    try {
        const completedOrder = await matchQuery.completeOrder(taskId);
        if (!completedOrder) {
            return res.status(500).json({ message: '심부름 완료 처리 중 오류가 발생했습니다.' });
        }

        return res.status(200).json({
            message: '심부름이 완료되었습니다.',
            order: completedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};