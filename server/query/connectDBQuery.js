import { config } from '../config/config.js'
import Mongoose from 'mongoose'

let db

export default function connectDB() {
    return Mongoose.connect(config.db.host)
}

export async function virtualId(schema) {
    schema.virtual('id').get(function () {
        return this._id.toString()
    })
    schema.set('toJSON', { virtual: true })
    schema.set('toObject', { virtual: true })
}
