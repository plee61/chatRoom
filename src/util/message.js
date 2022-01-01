const moment = require('moment')

const generateMessage = (message, username) =>{
    
    return {
        text: message,
        timeStamp: moment().format('DD/M hh:mm a'),
        username: username
    }
}

module.exports = {
    generateMessage
}