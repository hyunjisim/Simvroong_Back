import User from "../schema/UserSchema.js";

export async function saveExpoToken(req, res) {
    const ExpoToken = req.expoToken;
    // console.log("ExpoToken", ExpoToken); 
    const nowUser = req.mongo_id;

    try {
        const user = await User.findByIdAndUpdate(
            nowUser, // 찾을 _id
            { $set: { expoPushToken: ExpoToken } }, // 업데이트할 필드
            { new: true } // 업데이트된 문서를 반환
        );


        if (!user) {
            return res.status(404).json({
                message: "해당 사용자를 찾을 수 없습니다.",
            });
        }

        return res.status(200).json({
            message: "Expo Token User Schema Save Complete",
            user,
        });
    } catch (error) {
        console.error("Expo Token 저장 중 오류 발생:", error);
        return res.status(500).json({
            message: "서버 오류 발생",
        });
    }
}