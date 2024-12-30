import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
    user_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 유저 ID
    favorites: [
        {
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'TotalOrder', required: true }, // TotalOrder 컬렉션 참조
            addedAt: { type: Date, default: Date.now } // 찜한 날짜
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const Favorite = mongoose.model('Favorite', FavoriteSchema)

export default Favorite;