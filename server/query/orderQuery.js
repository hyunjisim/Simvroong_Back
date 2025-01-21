import Order from "../schema/TotalOrderDB.js";

export async function create(data) {
    try {
        console.log("저장할 데이터:", data);
        const newOrder = new Order(data);
        return await newOrder.save();
    } catch (error) {
        console.error("Order 생성 중 오류 발생:", error);
        throw error;
    }
}
