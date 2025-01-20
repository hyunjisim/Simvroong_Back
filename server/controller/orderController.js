import * as orderQuery from '../query/orderQuery.js'
// import * as authQuery from '../query/authQuery.js'

export async function createOrder(req, res, next) {
    try {
        console.log("요청 데이터:", req.body);
        console.log("S3 업로드 경로:", req.awsUploadPath);
        const user_Id = req.mongo_id;
        const orderData = { ...req.body, user_Id };
        // S3 URL 추가
        if (req.awsUploadPath) {
            orderData.taskDetails = {
                ...orderData.taskDetails,
                photoUrl: req.awsUploadPath,
            };
        }
        console.log("최종 데이터:", orderData);
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