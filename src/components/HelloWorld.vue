<template>
  <div id="main">

    <div v-if="!isInRoom">
      <h3>Join a Room!</h3>
      <label>RoomId:
      <input type="text" name="roomId" v-model="roomId"></label>
      <label>Username:
      <input type="text" name="username" v-model="username" v-on:keyup.enter="joinGame"></label>
      <button @click="joinGame">Join!</button>
      <button @click="createGame">Create!</button>
    </div>


    <div v-else>
        <room-lobby :room="room" :username="username"></room-lobby>
    </div>

  </div>
</template>

<script>
    import RoomLobby from './room-lobby.vue';
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
    'room-lobby': RoomLobby,
  },
  data: function() {
    return {
      roomId: "",
      username: "",
      isInRoom: false,
      room: {},
    }
  },
  sockets:{
    connect(){
        console.log('socket connected');
        this.socketId = this.$socket.id;
    },
    disconnect(){
      console.log('socket disconnected');
      this.socketId = "";
      this.isInRoom = false;
      this.room = {};
    },
    left_room(){
      this.isInRoom = false;
      this.room = {};
    },
    error(data){
      console.log("ERROR:::::   "+ data.error);
    },
    room_created(data) {
      console.log("Room Created");
      this.room = data.room;
      this.isInRoom = true;
    },
    joined_lobby(data) {
      this.room = data.room;
      this.isInRoom = true;
    },
    lobby_changed(data) {
      this.room = data.room;
    },
  },
  methods: {
    createGame() {
      this.$socket.emit('create_room', { "username": this.username, "roomId": this.roomId});      
    },
    closeRoom() {
      this.isInRoom = false;
    },
    joinGame() {
      this.$socket.emit('join_room', { "username": this.username, "roomId": this.roomId});
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#main{
  width: 100%;
  height: 100%;
}
</style>
