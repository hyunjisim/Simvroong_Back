import express from "express";
import { expoToken } from "../middleware/expoToken.js"; // 미들웨어 불러오기
import { isAuth } from "../middleware/isProfile.js";
import * as expoPushController from '../controller/expoPushController.js'
import { Expo } from "expo-server-sdk";
const router = express.Router();
const expo = new Expo();

// Send Notification with Middleware
// router.post("/send-notification", expoToken, async (req, res) => {
//   const { title, body } = req.body;
//   const token = req.expoToken; // 미들웨어에서 전달된 유효한 토큰

  
//   try {
//     const messages = [
//       {
//         to: token,
//         sound: "default",
//         title: "테스트 용도",
//         body: "이유진 그는 신인가",
//         data: { additionalData: "some data" },
//       },
//     ];


//     const ticketChunk = await expo.sendPushNotificationsAsync(messages);
//     console.log("Notification Sent:", ticketChunk);

//     res.status(200).json({ message: "알림 전송 성공", ticketChunk });
//   } catch (error) {
//     console.error("알림 전송 오류:", error);
//     res.status(500).json({ message: "알림 전송 실패" });
//   }
// });

router.post('/saveToken', isAuth, expoToken, expoPushController.saveExpoToken)

export default router;

