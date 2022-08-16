const users = []

//add a new user
const addUser = ({id , username , room})=>{
  //clean data

  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //validate the data
  if(!username || !room){
    return{
      error:'username and room are required'
    }
  }

  //check for existing user
  const existingUser = users.find((user)=>{
      return user.username === username && user.room === room
  })

  //validate user
  if(existingUser){
    return{
      error:'username must ne different'
    }
  }

  //store user
  const user = {id , username , room}
  users.push(user)
  return {user}

}

//remove user by id
const removeUser = (id)=>{
  const availableUser = users.findIndex((user)=>{
    return user.id === id
  })

  if(availableUser != -1)
    return users.splice(availableUser , 1)[0]
}

// addUser({
//   id:22,
//   username:'bharat',
//   room:'jp'
// })

//get a user by its id
const getUser = (id)=>{
  return users.find((user)=>user.id === id)
}

//get user of a particular room
const getUserInRoom = (room)=>{
  room  = room.trim().toLowerCase()
  return users.filter((user)=> user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
}
