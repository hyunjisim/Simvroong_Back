import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const expoToken = async (req, res, next) => {
    const pushToken = req.body.token;
    // console.log('확인전',pushToken)
    if (!pushToken) {
        console.error("Push token이 제공되지 않았습니다."); // 오류 로그 추가
        return res.status(208).json({ message: "Push token이 제공되지 않았습니다." });
    }
    const CleanToken = pushToken.replace(/"/g, "")
    // Expo Push Token 유효성 검사
    if (!Expo.isExpoPushToken(CleanToken)) {
        console.error("유효하지 않은 Expo Push Token입니다:", CleanToken); // 유효성 검사
        return res.status(400).json({ message: "유효하지 않은 Expo Push Token입니다." });
    }

    try {
        req.expoToken = CleanToken; // 요청 객체에 토큰 추가
        // console.log("Push token 처리 완료:", CleanToken);
        next(); // 다음 미들웨어로 전달
    } catch (error) {
        console.error("Push token 처리 중 오류:", error);
        res.status(500).json({ message: "서버 오류 발생." });
    }
};
