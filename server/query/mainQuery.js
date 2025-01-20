import Order from "../schema/TotalOrderDB.js";

// 모든 데이터를 가져오는 함수
export async function getAll() {
    try {
        const orders = await Order.find(); // Order 스키마의 모든 데이터 가져오기

        if (!orders || orders.length === 0) {
            throw new Error("Order 데이터가 없습니다.");
        }

        return orders.map(order => ( {
            taskId : order.taskId,
            title: order.title,
            thumnail: order.taskDetails.thumnail,
            location: order.location,
            schedule: order.schedule,
            payment: order.payment,
            likesCount: order.likes.count,
            questionsCount: order.QnA.length,
            isFeeNegotiable: order.isFeeNegotiable
        }));
    } catch (error) {
        console.error('Error fetching all orders:', error); // 에러 로그 출력
        throw new Error('Could not fetch orders'); // 에러를 호출자에게 다시 전달
    }
}

export async function getCategory(categories) {
    try {
      if (!categories || categories.length === 0) {
        throw new Error("카테고리 값이 제공되지 않았습니다.");
      }
  
      const categoriesArray = categories.map(cat => cat.trim());
  
      const filteredOrders = await Order.find({
        category: { $in: categoriesArray }
      });
  
      return filteredOrders.map(order => ({
        taskId : order.taskId,
        title: order.title,
        thumnail: order.taskDetails.thumnail,
        category: order.category, // 이 값을 반환하도록 추가
        location: order.location,
        schedule: order.schedule,
        payment: order.payment,
        likesCount: order.likes.count,
        questionsCount: order.QnA.length,
        isFeeNegotiable: order.isFeeNegotiable
      }));
    } catch (error) {
      console.error("카테고리 데이터를 불러오지 못했습니다:", error.message);
      throw error;
    }
  }
