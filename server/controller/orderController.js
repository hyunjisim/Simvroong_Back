import * as orderQuery from '../query/orderQuery.js'
// import * as authQuery from '../query/authQuery.js'

export async function createOrder(req, res, next) {
    try {
        // const {token} = req.mongo_id

        // Order 생성
        const user_Id = req.mongo_id; // 인증된 사용자 ID
        const orderData = { ...req.body, user_Id }; // user_Id를 추가
        const order = await orderQuery.create(orderData);

        if (!order.taskId) {
            throw new Error('Order 생성 중 taskId가 없습니다.');
        }

        // console.log('생성된 Order의 taskId:', order.taskId);

        res.status(201).json({order, user_Id});
    } catch (error) {
        console.error('Order 생성 중 오류 발생:', error);
        res.status(500).json({
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
}