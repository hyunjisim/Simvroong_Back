import * as listQuery from '../query/likeListQuery.js';

export async function getlist(req, res) {
    try {
        const user_Id = req.mongo_id;

        if (!user_Id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const likeList = await listQuery.getLikeList(user_Id);
        return res.status(200).json({ message: '리스트 불러오기 성공', data: likeList });
    } catch (error) {
        console.error('Error in controller:', error);
        return res.status(500).json({ message: 'Failed to fetch liked list' });
    }
}

export const deletelike = async (req, res) => {
    try {
        const user_Id = req.mongo_id;
        const { taskId } = req.params;
        const { action } = req.body;

        if (action === 'removeFavorite') {
            const result = await listQuery.delLike(user_Id, taskId, true); // isFavorite을 true로 전달
            return res.status(200).json({ message: '좋아요 삭제 성공', data: result });
        } else {
            return res.status(400).json({ message: '잘못된 요청' });
        }
    } catch (error) {
        console.error('manageController Error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};