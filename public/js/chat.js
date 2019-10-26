var socket=io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $wishButton = document.querySelector('#send-wish')
const $messages = document.querySelector('#messages')
//Templates
const $messageTemplate= document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $wishTemplate = document.querySelector('#wish-template').innerHTML
//Options
 const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

 const autoScroll = () =>{
     // New  message elemenet
     const $newMessage = $messages.lastElementChild

     //Height of the new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newmessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newmessageMargin

     //Visible Height
     const visibleHeight = $messages.offsetHeight

     //Height of messaged Container
     const containerHeight = $messages.scrollHeight

     // How far have i scrolled 
     const scrolloffset = $messages.scrollTop +visibleHeight

     if(containerHeight - newMessageHeight <= scrolloffset){
         //scroll to bottom
        $messages.scrollTop = $messages.scrollHeight
     }




 }
 socket.on('sendWish',(loc)=>{
    const html = Mustache.render($wishTemplate,{
        username:loc.username,
        location:loc.url,
        createdAt: moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage',(loc)=>{
    const html = Mustache.render($locationTemplate,{
        username:loc.username,
        location:loc.url,
        createdAt: moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

 socket.on('message',(msg)=>{
     console.log(msg)
     const html = Mustache.render($messageTemplate,{
         username:msg.username,
         message:msg.text,
         createdAt: moment(msg.createdAt).format('h:mm a')
     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoScroll()
 })
 socket.on('roomData',({room,users})=>{
     const html = Mustache.render($sidebarTemplate,{
         room,
         users
     })
     document.querySelector('#sidebar').innerHTML=html
 })

 $messageForm.addEventListener('submit',(e)=>{
     e.preventDefault()
     $messageFormButton.setAttribute('disabled','disabled')
     const msg=e.target.elements.message.value
     socket.emit('sendMessage',msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
         if(error){
             console.log(error)
         }
         else{
         console.log('Message was delivered')
         }
     })
 })

 $locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})
$wishButton.addEventListener('click', () => {
    $wishButton.setAttribute('disabled', 'disabled')
        socket.emit('sendWish', { }, () => {
            $wishButton.removeAttribute('disabled')
            console.log('Wish shared!')  
        })
})


 socket.emit('join',{username,room},(error)=>{
     if(error){
        alert(error)
        location.href = '/'
     }
 })
