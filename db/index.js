const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/backend_exercise', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('connection successfully'))
.catch((err) => console.error(err))

module.exports = mongoose;