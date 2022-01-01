const socket = io()
// server (emit) -> client (receive) -- acknowledge --> server
// client (emit) -> server (receive) -- acknowledge --> client 
const $form = document.querySelector('#form-chat')
const $button = $form.querySelector('#btnSend')
const $chatBox = $form.querySelector('#chatMessage')
//div
const $messages = document.querySelector("#messages")

//templates
const $messageTemplate = document.querySelector("#message-template").innerHTML
const $locTemplate = document.querySelector("#location-template").innerHTML
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoScroll = ()=>{
    const $newMessage = $messages.lastElementChild
    const $newMessageStyle = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyle.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight
    //How high have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - $newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight //if you only want to scroll to the bottom all the time, this line is sufficient
    }

}

socket.on('addMessage',(message)=>{
    const html = Mustache.render($messageTemplate, {timeStamp:message.timeStamp, message:message.text, username:message.username})
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('locationMessage', (message)=>{
    const html = Mustache.render($locTemplate, {timeStamp: message.timeStamp, locMessage: message.text, username: message.username})
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('sidebar', (message)=>{
    const html = Mustache.render($sidebarTemplate, {
        room: message.room,
        users: message.users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$button.addEventListener('click',(e)=>{
    e.preventDefault()
    
    $button.setAttribute("disabled", "disabled")
    const message = document.querySelector('#chatMessage').value
    if (message === "") { //required attribute does not work on chat.html
        alert("You must enter a message")
        return
    }
    //const message = e.target.elements.chatMessage.value
    socket.emit('sendMessage', message, (error)=>{
        $button.removeAttribute("disabled")
        $chatBox.value = ""
        $chatBox.focus()
        if (error) {
            console.log(error)
        } else {
            console.log('server acknowleged sendMessage')
        }
    })
})
const $btnLocation = document.querySelector('#send-location')
$btnLocation.addEventListener('click', ()=>{
    if (!navigator.geolocation){
        return alert("Your browser doesn't support geolocation")
    }
    $btnLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{ //this is a callback
        const pos = {latitude: position.coords.latitude, 
                     longitude: position.coords.longitude}

        socket.emit("sendLocation",pos, (ack)=>{
            $btnLocation.removeAttribute('disabled')
            console.log(ack)
        })
    })
})
socket.emit('join', {username, room}, (error)=>{
    if (error){
        alert(`${username} has already joined ${room}`)
        location.href="/"
        console.log('join error:',error)
        return
    }
    
})