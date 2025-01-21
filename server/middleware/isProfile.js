import jwt, { decode } from 'jsonwebtoken'
import * as authRepository from '../query/authQuery.js'
import { config } from '../config/config.js'

const AUTH_ERROR = { message: '인증에러' }

export const isAuth = async (req, res, next) => {
    // console.log('isAuth 미들웨어 호출됨'); // 호출 여부 확인
    const authHeader = req.get('Authorization');
    if (!(authHeader && authHeader.startsWith('Bearer '))) {
        console.log('헤더 에러:', authHeader); // 헤더 없거나 잘못된 경우 로그
        return res.status(401).json({ message: '인증 실패: Authorization 헤더가 없음 또는 잘못됨' });
    }

    const token = authHeader.split(' ')[1];
    // console.log('받은 토큰:', token); // 받은 토큰 확인

    jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
        if (error) {
            console.log('토큰 검증 에러:', error); // 토큰 검증 실패 로그
            return res.status(401).json({ message: '인증 실패: 토큰 검증 오류' });
        }

        const user = await authRepository.findUserbyToken(decoded.id);
        if (!user) {
            console.log('존재하지 않는 사용자:', decoded.id); // 유효하지 않은 사용자 로그
            return res.status(401).json({ message: '인증 실패: 사용자 존재하지 않음' });
        }

        // console.log('인증 성공:', user._id); // 인증 성공 확인
        req.mongo_id = user._id; // 사용자 ID 저장
        next();
        // console.log('isAuth 미들웨어에서 next 호출됨'); // 추가 로그
    });
};

