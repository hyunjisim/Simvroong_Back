import Order from '../schema/TotalOrderDB.js'; // TotalOrder 데이터베이스 스키마
import User from '../schema/UserSchema.js'; // User 데이터베이스 스키마


//사용자가 파트너인지 확인하는 함수
export const checkUserIsPartner = async (userId) => {
    const user = await User.findOne({ userId });
    return user.isPartner;
};

//특정 심부름이 이미 수락되었는지 확인하는 함수
export const checkOrderIsAccepted = async (taskId) => {
    const order = await Order.findOne({ taskId })
    return order
};

//심부름을 특정 파트너가 수락하도록 업데이트하는 함수
export const acceptOrder = async (taskId, userId) => {
    return await Order.findOneAndUpdate(
        { taskId },
        {
            acceptedPartnerId: userId,
            isAccepted: true,
            isActive: '진행중',
            updatedAt: Date.now(),
        },
        { new: true }
    );
};


// 특정 심부름을 취소 상태로 업데이트 하는 함수
export const cancelOrder = async (taskId) => {
    return await Order.findOneAndUpdate(
        { taskId },
        { 
            acceptedPartnerId: null,
            isAccepted: false,
            isActive: ' ',
            updatedAt: Date.now() 
        },
        { new: true }
    );
}

//특정 심부름을 완료 상태로 변경하는 함수
export const completeOrder = async (taskId) => {
    return await Order.findOneAndUpdate(
        { taskId },
        { 
            isCompleted: true, 
            isActive: '완료',
            updatedAt: Date.now() 
        },
        { new: true }
    );
};
