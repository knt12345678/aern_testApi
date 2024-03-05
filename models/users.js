const db = require('../db')

const UserSchema = db.Schema({
    username: String,
    password: String,
    first_name: String,
    last_name: String,
    gender: String,
    updated_at: { type: Date, default: Date.now},
    created_at: { type: Date, default: Date.now}
})

module.exports = db.model('users', UserSchema)
