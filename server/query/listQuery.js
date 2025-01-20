import Order from "../schema/TotalOrderDB.js";
import Favorite from "../schema/FavoriteDB.js";

export async function getLikeList(user_Id) {
    try {
        // user_Id를 조건으로 즐겨찾기(Favorite) 목록을 가져옴
        const userFavorite = await Favorite.findOne({ user_Id: user_Id });

        // favorites 배열에서 taskId만 추출
        const taskIds = userFavorite.favorites.map(fav => fav.taskId);

        // Order 컬렉션에서 taskIds를 기반으로 주문 목록 가져옴
        const orders = await Order.find({ taskId: { $in: taskIds } });

        // 필요한 데이터만 정리하여 반환
        return orders.map(order => ({
            title: order.title,
            thumnail: order.taskDetails?.thumnail || null,
            location: order.location?.area || null,
            schedule: order.schedule || null,
            payment: order.payment || 0,
            likesCount: order.likes?.count || 0,
            questionsCount: order.QnA ? order.QnA.length : 0
        }));
    } catch (error) {
        console.error('Error fetching like list:', error);
        throw new Error('Could not fetch like list');
    }
}