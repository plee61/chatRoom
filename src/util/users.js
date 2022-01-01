const users = []
//addUser, removeUser, getUser, getUsersInRoom
const addUser = (id, username, room)=>{
    room = room.trim()
    username = username.trim()
    if ((username === undefined) || (username === null)){
        return {
            error: "Must provide user name!"
        }
    }
    if ((room === undefined) || username === null)
    {
        return {
            error: "Must provide room!"
        }
    }
    //check for user already exist
    const newUser = {id, username, room}
    const existingId = users.findIndex((user)=>{
        return user.id === newUser.id
    })
    //findindex = -1 if no match
    if (existingId != -1) {
        return {
            error: "user id already exists "
        }    
    }
    const existingUser = users.findIndex((user)=>{
        const existing = user.username.toLowerCase() === newUser.username.toLowerCase() 
        && user.room.toLowerCase() === newUser.room.toLowerCase()
        return existing
    })
    if (existingUser != -1) {
        return {
            error: "user name and room already exists "
        }    
    }
    users.push(newUser)
    return {newUser}
}
const removeUser = (id) =>{
    const pos = users.findIndex((user)=>{
        return user.id === id
    })
    if (pos === -1) {
        return {
            error: `cannot find user id ${id}`
        }
    }
    return users.splice(pos,1)[0]
}
const getUser = (id) => {
    return users.find((user)=>{
        return user.id === id
    })
}
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
} 
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}