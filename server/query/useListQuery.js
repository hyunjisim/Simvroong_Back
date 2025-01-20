import { userInfo } from "../controller/profileController.js";
import Order from "../schema/TotalOrderDB.js"
import Chat from "../schema/ChatSchema.js";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb'; // MongoDB의 ObjectId 가져오기

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
            thumnail: order.taskDetails.thumnail,
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
//chat에서 가져와야함 chat에서 userid찾아서 있으면 그 챗 안에 태스크 아이디 찾아서 그 태스크 아이디값으로 게시물 정보 가져오기
export async function findListsByPartner(user_Id) {
    try{
            
            const chat = await Chat.find({ toTaskUserId : user_Id })
            // chat 안에 있는 태스크 아이디 모두 반환하게 하고싶어

            if (!chat || chat.length === 0) {
                throw new Error("chat 데이터가 없습니다.");
            }


            // chat 배열에서 taskId를 문자열로 변환 후 중복 제거
            const uniqueTaskIds = [...new Set(chat.map(chatItem => chatItem.taskId.toString()))];

            // 중복 제거된 문자열 taskId를 다시 ObjectId로 변환
            const taskIds = uniqueTaskIds.map(id => new ObjectId(id));

            console.log('Unique taskIds:', taskIds);
            console.log('Is ObjectId:', taskIds.every(id => id instanceof ObjectId));

            // 추출된 taskId로 Order 데이터 가져오기
            const orders = await Order.find({ taskId: { $in: taskIds } });

            console.log('orders:', orders);

            if (!orders || orders.length === 0) {
                throw new Error("해당하는 Order 데이터를 찾을 수 없습니다.");
            }

            return orders.map(order => ({
                taskId: order.taskId,
                title: order.title,
                thumnail: order.taskDetails.thumnail,
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

// 심부름 신청상태 업데이트
export async function UpdateActive(taskId,user_Id,channel) {
    try{
        // 토탈오더에있는 isActive
        // 업데이트해야함 '완료'로
        // 메세지에 있는 거래완료는 개인별 돈을 왔다갔다 하는걸로 다르게 정의해야함
        // 프론트에서는 토탈오더가 완료로 처리되어있으면 채팅에있는거 거래완료 버튼 흑백 처리하고 post에있는 신청 버튼도 없애야함
        // 돈거래는 거래완료를 게시물 당사자가 누르면 중간 어디에 돈은 머물러 두게하고
        //  생각해보니까 중간에 두는게 이상함..그럼 심부름 수행완료 버튼도 어딘가에 만들어야함 그럼 부릉 리스트에서 심부름까지 완료했을떄 게시물 올린 당사자가 완료 버튼을 눌렀을때 나가게 해야하는데........
        // 심부름과정까지 완료되면 완전히 돈을 보내고 완료중으로 바꿔야함
        // console.log(channel);
        const chat = await Chat.findOne(
            {_id : channel,TaskUserId : user_Id},
            // 찾은 전체 데이터 반환
        )
        // console.log(chat);
        // console.log('taskId',taskId);


        const orders = await Order.findOneAndUpdate(
            { taskId : taskId},
            { $set: { isCompleted: true,isActive: '거래완료', updatedAt: new Date() } },
            { new: true } // 업데이트된 데이터를 반환
        )
        // console.log('orders',orders);

        if (!orders || orders.length === 0) {
            throw new Error("Order 데이터가 없습니다.");
        }

        return orders
        } catch (error) {
            console.error('Error fetching all orders:', error);
            throw new Error('Could not fetch orders');
        }
}


// 심부름 신청상태 가져오기
export async function GetActive(taskId,user_Id,channel) {
    try{
        // console.log(channel);
        const chat = await Chat.findOne(
            {_id : channel, TaskUserId : user_Id},
        )
        // console.log(chat);
        // console.log('taskId',taskId);


        const orders = await Order.findOne(
            { taskId : taskId},
        )
        // console.log('orders',orders);

        if (!orders || orders.length === 0) {
            throw new Error("Order 데이터가 없습니다.");
        }

        return orders
        } catch (error) {
            console.error('Error fetching all orders:', error);
            throw new Error('Could not fetch orders');
        }
}
