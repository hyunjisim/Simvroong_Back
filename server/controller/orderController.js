import * as orderQuery from "../query/orderQuery.js";
export const createOrder = async (req, res) => {
    try {
      console.log("요청 데이터:", req.body);
  
      // 데이터 검증: req.body가 올바른지 확인
      if (!req.body.category || !req.body.title || !req.body.taskDetails) {
        return res.status(400).json({ message: "필수 데이터가 누락되었습니다." });
      }
  
      const user_Id = req.mongo_id;
      const orderData = { ...req.body, user_Id };
  
      console.log("저장할 데이터:", orderData); // 최종 데이터 확인
  
      const order = await orderQuery.create(orderData);
      if (!order) {
        throw new Error("Order 생성에 실패했습니다.");
      }
  
      res.status(201).json({ order });
    } catch (error) {
      console.error("Order 생성 중 오류 발생:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
    }
  };
  