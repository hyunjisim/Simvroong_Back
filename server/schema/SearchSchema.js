import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recentSearches: [
    {
      keyword: { type: String },
      searchedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})


const Search = mongoose.model('Search', searchSchema);

export default Search;