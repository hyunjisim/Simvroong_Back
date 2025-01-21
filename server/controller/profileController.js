import * as authRepository from '../query/authQuery.js'
import * as bcrypt from 'bcrypt'
import { config } from '../config/config.js'

// 개인정보 조회, 수정 창 들어가기
export async function userInfo(req, res, next) {
    const { password } = req.body
    const docodedToken = req.mongo_id

    const user = await authRepository.findUserbyToken(docodedToken)
    if (!user) {
        // console.log('존재하지 않는 아이디')
        return res.status(401)
    }

    const PW_CHECK = password.length === 7 ? user.password === password : await bcrypt.compare(password, user.password)

    if (!PW_CHECK) {
        return res.status(401).json({ message: '비밀번호가 틀렸습니다' })
    }

    return res.sendStatus(200)
}

// 개인정보 수정부분
export async function modifyUserInfo(req, res, next) {
    const decodeToken = req.mongo_id
    const { nickname, phoneNumber } = req.body

    try {
        const user = await authRepository.findUserbyToken(decodeToken)

        if (!user) {
            return res.status(404).send('User not found')
        }

        const verifiedNickname = await authRepository.duplicatedNickname(nickname, user.userId)

        if (verifiedNickname) {
            return res.status(400).send('이미 사용중인 닉네임입니다.')
        }

        const isModified = await authRepository.modifyUser(nickname, user.userId, phoneNumber)

        if (!isModified) {
            return res.status(400).send('수정을 실패하였습니다.')
        }

        const verified = await authRepository.checkVerified(phoneNumber)
        if (verified) {
            await authRepository.deleteVerify(phoneNumber)
        }

        return res.status(200).send('수정을 성공하였습니다!')
    } catch (error) {
        console.error('Error in modifyUserInfo:', error)
        return res.status(500).send('Internal Server Error')
    }
}

export async function updatePassword(req, res, next) {
    const { nowPassword, newPassword } = req.body
    const decodeToken = req.mongo_id

    const user = await authRepository.findUserbyToken(decodeToken)
    if (!user) {
        return res.status(400).send('존재하지 않는 사용자 입니다.')
    }

    const PW_CHECK = nowPassword.length === 7 ? user.password === nowPassword : await bcrypt.compare(nowPassword, user.password)

    if (!PW_CHECK) {
        return res.status(400).send('현재 비밀번호가 일치하지 않습니다.')
    }

    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/

    if (!strongPasswordRegex.test(newPassword)) {
        return res.status(400).json({ success: false, message: '비밀번호는 8~15자 길이로, 문자, 숫자 및 특수문자를 포함해야 합니다.' })
    }

    if (await bcrypt.compare(newPassword, user.password)) {
        return res.status(400).json({ success: false, message: '새 비밀번호는 기존 비밀번호와 달라야 합니다.' })
    }

    const hashed = bcrypt.hashSync(newPassword, config.bcrypt.saltRounds)

    const modifiedPassword = await authRepository.updatePassword(user.userId, hashed)

    if (!modifiedPassword) {
        res.status(400).json({ success: false, message: '비밀번호 변경에 실패하였습니다' })
    }

    return res.status(200).send('비밀번호 변경이 완료되었습니다.')
}

export async function updateImg(req, res) {
    const userId = req.mongo_id; // 인증된 사용자 ID (미들웨어에서 설정)
    const imageUrl = req.awsUploadPath; // S3에서 업로드된 이미지 URL

    if (!imageUrl) {
        return res.status(400).json({ message: "S3 업로드 실패로 이미지 URL을 가져올 수 없습니다." });
    }

    try {
        await authRepository.updateProfileImage(userId, imageUrl);
        res.status(201).json({
            message: "프로필 사진 업로드 및 저장 완료",
            imageUrl, // 클라이언트로 업로드된 URL 반환
        });
    } catch (error) {
        console.error("DB 저장 실패:", error);
        res.status(500).json({ message: "프로필 사진 저장 중 오류가 발생했습니다." });
    }
}

export async function getUserData(req, res) {
    // console.log('getUserData 호출됨'); // 추가 로그
    try {
        const user = await authRepository.findUserbyToken(req.mongo_id);
        if (!user) {
            console.log('사용자 정보 없음');
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        return res.status(200).json({
            nickname: user.nickname,
            photoUrl: user.photoUrl,
            stats: {
                activities: user.activities || 0,
                completedTasks: user.completedTasks || 0,
                reviewCount: user.reviewCount || 0
            },
            tasks: user.tasks || [],
            reviews: user.reviews || []
        });
    } catch (error) {
        console.error('getUserData 에러:', error);
        return res.status(500).json({ message: '서버 에러 발생' });
    }
}


