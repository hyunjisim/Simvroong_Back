import * as searchQuery from "../query/searchQuery.js";

// 검색 요청 처리
export async function findSearch(req, res, next) {
    try {
        console.log("Received keyword:", req.query.keyword);
        const user_Id = req.mongo_id; // 인증된 사용자 ID
        const rawKeyword = req.query.keyword;

        if (!rawKeyword) {
            return res.status(400).json({ error: "검색어를 입력해주세요." });
        }
        const decodedKeyword = decodeURIComponent(rawKeyword.trim().replace(/"/g, ""));

        // 검색 및 검색어 저장
        const matchingOrders = await searchQuery.findOrdersByTitle(user_Id, decodedKeyword);

        if (matchingOrders.length === 0) {
            return res.status(404).json({ message: "검색 결과가 없습니다." });
        }

        return res.status(200).json({ results: matchingOrders });
    } catch (error) {
        console.error("Error in findSearch controller:", error);
        next(error);
    }
}

// 최근 검색어 조회 요청 처리
export async function recentSearch(req, res, next) {
    try {
        const user_Id = req.mongo_id; // 인증된 사용자 ID

        if (!user_Id) {
            return res.status(400).json({ error: "사용자 인증이 필요합니다." });
        }

        const recentSearches = await searchQuery.getRecentSearches(user_Id);

        if (recentSearches.length === 0) {
            return res.status(404).json({ message: "최근 검색어가 없습니다." });
        }

        return res.status(200).json({ recentSearches });
    } catch (error) {
        console.error("Error in getRecentSearches controller:", error);
        next(error);
    }
}

