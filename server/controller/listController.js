import * as listQuery from '../query/listQuery.js';

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