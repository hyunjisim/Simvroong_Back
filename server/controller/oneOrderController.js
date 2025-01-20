import * as oneOrderQuery from '../query/oneOrderQuery.js';
import * as authQuery from '../query/authQuery.js';
import User from '../schema/UserSchema.js';

export async function getOrderById(req, res) {
    const { taskId } = req.params // 요청된 심부름 ID
    try {
        const result = await oneOrderQuery.getById(taskId)
        if (!result) {
            return res.status(404).json({ message: '관련 데이터를 찾을 수 없습니다.' })
        }
        //원흉 찾음
        const currentUser = req.mongo_id
        const decode = result.user_id
        const user = await authQuery.findUserbyToken(decode)
        const nickname = user.nickname
        const photoUrl = user.photoUrl
        const result2 = { ...result, nickname, photoUrl }
        res.status(200).json({
            message: '상세 페이지 데이터 조회 성공',
            data: result2,
            currentUser
        })
    } catch (error) {
        console.error('taskId로 데이터 가져오기 중 오류 발생:', error)
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message })
    }
}

export const getLikeStatus = async (req, res) => {
        try {
            const user_Id = req.mongo_id; // 인증된 사용자 ID
            const { taskId } = req.params; // 클라이언트에서 요청한 taskId
            if (!user_Id || !taskId) {
                return res.status(400).json({ message: '유효하지 않은 요청입니다.' });
            }
            // 좋아요 상태 확인
            const isLiked = await oneOrderQuery.checkIfLiked(user_Id, taskId);
            // 상태 반환
            return res.status(200).json({
                message: '좋아요 상태 불러오기 성공',
                data: { isLiked },
            });
        } catch (error) {
            console.error('Error fetching like status:', error);
            return res.status(500).json({ message: '좋아요 상태를 가져오는 데 실패했습니다.' });
        }
    };

// taskId와 action에 따른 Q&A와 좋아요
export const manageController = async (req, res) => {
    try {
        // req.user에서 userId 추출, 없으면 오류 반환
        // if (!req.user) {
        //     console.error('Authorization Error: req.user is undefined');
        //     return res.status(401).json({ message: '사용자 인증 실패: 로그인을 다시 시도하세요.' });
        // }



        const user_Id  = req.mongo_id;
        const { taskId } = req.params;
        const { action, questionId, answerId, data } = req.body;
        // console.log('Action:', action);
        // console.log('사용자 ID (req.mongo_id):', user_Id);
        // console.log('전달된 taskId:', taskId);
        // console.log('전달된 데이터:', { questionId, data });

        // console.log('Action Requested:', action);
        // console.log('User ID:', user_Id);

        const user = await User.findById(user_Id)
        
        let result;

        switch (action) {
            case 'addQuestion':
                // 질문 추가
                result = await oneOrderQuery.addQuestion(taskId, data, user_Id, user.nickname, user.photoUrl);
                return res.status(200).json({ message: '질문 추가 성공', data: result });

            case 'updateQuestion':
                // 질문 수정
                result = await oneOrderQuery.updateQuestion(taskId, questionId, data.content, user_Id);
                return res.status(200).json({ message: '질문 수정 성공', data: result });

            case 'deleteQuestion':
                // 질문 삭제
                result = await oneOrderQuery.deleteQuestion(taskId, questionId, user_Id);
                if (!result) {
                    return res.status(404).json({ message: '질문을 찾을 수 없습니다.' });
                }
                return res.status(200).json({ message: '질문 삭제 성공', data: result });

            case 'addAnswer':
                // 답변 추가
                result = await oneOrderQuery.addAnswer(taskId, questionId, data, user_Id, user.nickname, user.photoUrl);
                return res.status(200).json({ message: '답변 추가 성공', data: result });

            case 'updateAnswer':
                // 답변 수정
                result = await oneOrderQuery.updateAnswer(taskId, questionId, answerId, data.content, user_Id);
                return res.status(200).json({ message: '답변 수정 성공', data: result });

            case 'deleteAnswer':
                // 답변 삭제
                result = await oneOrderQuery.deleteAnswer(taskId, questionId, answerId, user_Id);
                return res.status(200).json({ message: '답변 삭제 성공', data: result });

            case 'addFavorite':
                // 좋아요 추가
                result = await oneOrderQuery.toggleFavorite(user_Id, taskId, true);
                return res.status(200).json({ message: '좋아요 추가 성공', data: result });

            case 'removeFavorite':
                // 좋아요 삭제
                result = await oneOrderQuery.toggleFavorite(user_Id, taskId, false);
                return res.status(200).json({ message: '좋아요 삭제 성공', data: result });

            default:
                return res.status(400).json({ message: '유효하지 않은 작업 요청입니다.' });
        }
    } catch (error) {
        console.error('manageController Error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};