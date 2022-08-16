const socket = io() // we call io() function to connect

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoscroll = ()=>{
  const newMessages = $messages.lastElementChild
  newMessages.scrollIntoView()

}


socket.on('message' , (message)=>{
  console.log(message)
  const html = Mustache.render(messageTemplate , {
    username:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format("dddd , MMMM Do YYYYY , h:mm:ss a")
    
  })
  $messages.insertAdjacentHTML('beforeend' , html)
  autoscroll()

})
socket.on('locationMessage' , (message)=>{
  console.log(message)
  const link = Mustache.render(locationTemplate , {
    username:message.username ,
    url:message.url,
    createdAt:moment(message.createdAt).format("dddd , MMMM Do YYYYY , h:mm:ss a")

  })
  $messages.insertAdjacentHTML('beforeend' ,link)
  autoscroll()

})

socket.on('roomData' , ({room , users})=>{
  console.log(room)
  console.log(users)

  const data = Mustache.render(sidebarTemplate , {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = data
})

$messageForm.addEventListener('submit' , (e)=>{
  e.preventDefault()
  //disable
  $messageFormButton.setAttribute('disabled' , 'disabled')
  //can use any of the 2 below lines
  //const message = document.querySelector('input').value
  const message = e.target.elements.message.value
  socket.emit('msgSendToServer' , message , (errorMsg)=>{

    //enable
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(errorMsg){
      return console.log(errorMsg)
    }

    console.log('Message Delivered!!')
  }  )
})


$sendLocationButton.addEventListener('click' , ()=>{

  //disable
  $sendLocationButton.setAttribute('disabled' , 'disabled')

  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation' , {
      latitude:position.coords.latitude,
      longitude:position.coords.longitude
    } , ()=>{
      //enable
      $sendLocationButton.removeAttribute('disabled')

      console.log('location shared')
    })
  })
})

socket.emit('join' , {username,room} , (error)=>{
  if(error){
    alert('username is in use')
    location.href = '/'
  }
})