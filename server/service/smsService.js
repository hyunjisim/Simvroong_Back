import coolsms from 'coolsms-node-sdk'
import { config } from '../config/config.js'

export async function sendTokenToSMS(userphone) {
    const token = Math.floor(1000 + Math.random() * 9999)

    const mysms = coolsms.default

    const messageService = new mysms(config.api.apiKey, config.api.apiSecretKey)

    try {
        const result = await messageService.sendOne({
            to: `${userphone}`,
            from: `${config.api.hpNumber}`,
            text: `발신자 : [Simbureung] 인증번호 입력 -> [${token}]`
        })
        console.log('발송 성공:', result)
        return result
    } catch (err) {
        console.error('발송 실패:', err)
        return
    }
}
