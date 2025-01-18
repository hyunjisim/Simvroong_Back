import express from 'express'
import User from '../schema/UserSchema.js' // User 데이터베이스 스키마
import { isAuth } from '../middleware/isProfile.js'
import { sendPushNotification } from '../middleware/firebaseAdmin.js'
const router = express.Router()

// FCM 토큰 저장
router.post('/save-fcm-token', isAuth, async (req, res) => {
    const { fcmToken } = req.body
    const userId = req.mongo_id
    console.log(`userId`, userId)
    try {
        const user = await User.findByIdAndUpdate({ _id: userId }, { fcmToken: fcmToken }, { new: true })
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
        }

        res.status(200).json({ message: 'FCM 토큰이 성공적으로 저장되었습니다.', user })
    } catch (error) {
        console.error('FCM 토큰 저장 오류:', error)
        res.status(500).json({ message: '서버 오류가 발생했습니다.' })
    }
})

// 백엔드 푸시 알림 처리
router.post('/send-notification', isAuth, async (req, res) => {
    const { title, body } = req.body
    const userId = req.mongo_id // 인증된 사용자 ID

    try {
        // 사용자 정보를 가져와 FCM 토큰 확인
        const user = await User.findById(userId)
        if (!user || !user.fcmToken) {
            return res.status(404).json({ message: '푸시 알림을 보낼 FCM 토큰이 없습니다.' })
        }

        // 푸시 알림 전송
        const response = await sendPushNotification(user.fcmToken, title, body)
        res.status(200).json({ message: '푸시 알림 전송 성공', response })
    } catch (error) {
        console.error('푸시 알림 전송 오류:', error)
        res.status(500).json({ message: '푸시 알림 전송 실패' })
    }
})

export default router
