import { userInfo } from "../controller/profileController.js";
import Order from "../schema/TotalOrderDB.js"

//심부름 등록 조회
export async function findOrderByUser(user_Id){
    try{
        const orders = await Order.find({user_Id : user_Id})

        if (!orders || orders.length === 0) {
            throw new Error("Order 데이터가 없습니다.");
        }

        return orders.map(order => ({
            taskId: order.taskId,
            title: order.title,
            photoUrl: order.taskDetails.photoUrl,
            location: order.location,
            schedule: order.schedule,
            payment: order.payment,
            isActive: order.isActive
        }));
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw new Error('Could not fetch orders');
    }
}
//심부름 신청 조회
export async function findListsByPartner(user_Id) {
   try{
        const orders = await Order.find({ acceptedPartnerId : user_Id })

        if (!orders || orders.length === 0) {
            throw new Error("Order 데이터가 없습니다.");
        }

        return orders.map(order => ({
            taskId: order.taskId,
            title: order.title,
            photoUrl: order.taskDetails.photoUrl,
            location: order.location,
            schedule: order.schedule,
            payment: order.payment,
            isActive: order.isActive
        }));
        } catch (error) {
            console.error('Error fetching all orders:', error);
            throw new Error('Could not fetch orders');
        }
            
}