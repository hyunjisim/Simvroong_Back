import * as oneOrderQuery from '../query/oneOrderQuery.js';

// taskId를 기반으로 상세 페이지 데이터 가져오기
export async function getOrderById(req, res) {
    const { taskId } = req.params; // 요청된 심부름 ID

    try {
        const result = await oneOrderQuery.getById(taskId); 

        if (!result) {
            return res.status(404).json({ message: '관련 데이터를 찾을 수 없습니다.' });
        }

        res.status(200).json({
            message: '상세 페이지 데이터 조회 성공',
            data: result, 
        });
    } catch (error) {
        console.error('taskId로 데이터 가져오기 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
}

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
        const { action, questionIndex, answerIndex, data } = req.body;

        console.log('Action Requested:', action);
        console.log('User ID:', user_Id);

        let result;

        switch (action) {
            case 'addQuestion':
                // 질문 추가
                result = await oneOrderQuery.addQuestion(taskId, data, user_Id);
                return res.status(200).json({ message: '질문 추가 성공', data: result });

            case 'updateQuestion':
                // 질문 수정
                result = await oneOrderQuery.updateQuestion(taskId, questionIndex, data.content, user_Id);
                return res.status(200).json({ message: '질문 수정 성공', data: result });

            case 'deleteQuestion':
                // 질문 삭제
                result = await oneOrderQuery.deleteQuestion(taskId, questionIndex, user_Id);
                return res.status(200).json({ message: '질문 삭제 성공', data: result });

            case 'addAnswer':
                // 답변 추가
                result = await oneOrderQuery.addAnswer(taskId, questionIndex, data, user_Id);
                return res.status(200).json({ message: '답변 추가 성공', data: result });

            case 'updateAnswer':
                // 답변 수정
                result = await oneOrderQuery.updateAnswer(taskId, questionIndex, answerIndex, data.content, user_Id);
                return res.status(200).json({ message: '답변 수정 성공', data: result });

            case 'deleteAnswer':
                // 답변 삭제
                result = await oneOrderQuery.deleteAnswer(taskId, questionIndex, answerIndex, user_Id);
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