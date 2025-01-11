import Order from "../schema/TotalOrderDB.js";
import Search from "../schema/SearchSchema.js";

// 검색 결과 조회 및 검색어 저장
export async function findOrdersByTitle(userId, keyword) {
    try {
        // 검색 조건: title에 keyword 포함
        const regex = new RegExp(keyword, 'i'); // 대소문자 구분 없이 포함 검색
        const orders = await Order.find({ title: { $regex: regex } }).sort({ createdAt: -1 });

        // 검색어를 recentSearches에 저장
        const userSearchData = await Search.findOne({ userId });

        if (userSearchData) {
            // 기존 검색 기록이 있으면 업데이트
            const existingIndex = userSearchData.recentSearches.findIndex(item => item.keyword === keyword);
            if (existingIndex !== -1) {
                userSearchData.recentSearches.splice(existingIndex, 1); // 기존 검색어 제거
            }
            userSearchData.recentSearches.unshift({ keyword }); // 새로운 검색어 추가
            if (userSearchData.recentSearches.length > 10) {
                userSearchData.recentSearches.pop(); // 최대 10개 유지
            }
            await userSearchData.save();
        } else {
            // 검색 기록이 없으면 새로 생성
            const newSearchData = new Search({
                userId,
                recentSearches: [{ keyword }],
            });
            await newSearchData.save();
        }

        // 검색 결과 반환
        if (!orders || orders.length === 0) {
            return [];
        }

        return orders.map(order => ({
            taskId: order.taskId,
            title: order.title,
            photoUrl: order.taskDetails.photoUrl,
            location: order.location,
            schedule: order.schedule,
            payment: order.payment,
            likesCount: order.likes.count,
            questionsCount: order.QnA.length,
            isFeeNegotiable: order.isFeeNegotiable,
            createdAt: order.createdAt,
        }));
    } catch (error) {
        console.error("Error searching orders by title:", error);
        throw new Error("Could not fetch matching orders");
    }
}

// 최근 검색어 조회
export async function getRecentSearches(userId) {
    try {
        const userSearchData = await Search.findOne({ userId });

        if (!userSearchData || !userSearchData.recentSearches) {
            return [];
        }

        return userSearchData.recentSearches.map(search => ({
            keyword: search.keyword,
            searchedAt: search.searchedAt,
        }));
    } catch (error) {
        console.error("Error fetching recent searches:", error);
        throw new Error("Failed to fetch recent searches");
    }
}

