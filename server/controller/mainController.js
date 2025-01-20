import * as mainQuery from '../query/mainQuery.js'

export async function getAllOrder(req, res, next) {
    try {
      const { category } = req.query;
      const decodedCategory = decodeURIComponent(category || "").trim();
      // console.log("요청된 카테고리:", decodedCategory);
  
      if (decodedCategory && decodedCategory !== "전체") {
        const categories = decodedCategory.split(",").map((cat) => cat.trim());
        const orders = await mainQuery.getCategory(categories);
  
        if (!orders || orders.length === 0) {
          return res.status(404).json({ message: "해당 카테고리에 맞는 데이터가 없습니다." });
        }
  
        return res.status(200).json({ data: orders });
      }
  
      const orders = await mainQuery.getAll();
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "데이터가 없습니다." });
      }
  
      res.status(200).json({ data: orders });
    } catch (error) {
      console.error("데이터 조회 중 오류 발생:", error);
      res.status(500).json({
        message: "서버 오류가 발생했습니다.",
        error: error.message,
      });
    }
  }