const moment = require('moment')
const generateMessage = (message, username) =>{
    
    return {
        text: message,
        timeStamp: moment().format('DD/M h:mm a'),
        username: username
    }
}
    
module.exports = {
    generateMessage
}