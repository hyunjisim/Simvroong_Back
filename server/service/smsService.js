import coolsms from 'coolsms-node-sdk'
import { config } from '../config/config.js'
export async function sendTokenToSMS(phone) {
    const code = Math.floor(1000 + Math.random() * 9000)
    const mysms = coolsms.default
    const messageService = new mysms(config.api.apiKey, config.api.apiSecretKey)
    try {
        const result = await messageService.sendOne({
            to: phone,
            from: `${config.api.hpNumber}`,
            text: `발신자 : [Simbureung] 인증번호 입력 -> [${code}]`
        })
        return code
    } catch (err) {
        console.error('발송 실패:', err)
        return
    }
}