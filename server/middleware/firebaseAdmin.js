import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname 구현
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// JSON 파일 경로 설정
const serviceAccountPath = path.resolve(__dirname, '../config/push-4de95-firebase-adminsdk-m9s5y-f4ca2c1ae9.json')
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

// Firebase Admin 초기화
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

// 푸시 알림 함수
export const sendPushNotification = async (token, title, body) => {
    const message = {
        notification: {
            title,
            body
        },
        token
    }
    console.log(`message`, message)

    try {
        const response = await admin.messaging().send(message)
        console.log('푸시 알림 전송 성공:', response)
        return response
    } catch (error) {
        console.error('푸시 알림 전송 실패:', error)
        throw error
    }
}
