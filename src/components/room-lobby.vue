<template>
  <div class="hello">
    <button @click="leaveRoom">Leave Room</button>
    <div v-if="!stepPause" class="fillSpace">
        <div v-if="room.status === 'WAITING'">
          
          <h3>{{username}} welcome to {{room.id}}!</h3>

          <h4>Players</h4>

          <p v-for="player in room.players" :key="player.name">{{player.name}}</p>

          <p>Insert words for others to draw!</p>
          
          <input name="word" v-model="newWord" v-on:keyup.enter="submitWord"/>
          <p v-show="error.add_word.length > 0">{{error.add_word}}</p>

          <p v-for="word in room.words" :key="word">{{word}}</p>

          <button v-if="room.owner.name === username " @click="startGame">Start Game</button>
        </div>

        <div v-else-if="room.status === 'DRAW'" class="drawSketch">
          <p>Draw: <span class="word-to-draw">{{wordToDraw}}</span></p>
          <p>Time left: <span class="word-to-draw">{{room.timer}}</span></p>
          <draw-sketch :mode="room.status" :word="wordToDraw"></draw-sketch>
        </div>

        <div v-else-if="room.status === 'GUESS'" class="drawSketch">
          <draw-sketch :mode="room.status" 
          :sketchToGuess="sketchToGuess" 
          :roundId="roundId"
          :playerName="playerName"></draw-sketch>
          <div v-show="playerSketch !== username">
            <input  v-model="guessSketch"/>
            <button @click="submitGuess">Send</button>
          </div>
        </div>
    </div>
    <div v-else>
      <step-pause :msg="stepMsg"></step-pause>
    </div>

  </div>

</template>

<script>
  import DrawSketch from './draw-sketch.vue';
  import StepPause from './step-pause.vue';
export default {
  name: 'RoomLobby',
  props: ["room", "username"],
  components: {
    'draw-sketch': DrawSketch,
    'step-pause': StepPause,
  },
  data: function() {
    return {
      newWord: '',
      wordToDraw: '',
      error: {
        start_game: "",
        add_word: "",
      },
      forceSubmit: false,
      sketchToGuess: undefined,
      roundId: undefined,
      stepPause: false,
      stepMsg: "",
      guessSketch: "",
    }
  },
  sockets: {
    word_accepted(){
      console.log("Word Accepted");
      this.newWord = "";
      this.error.add_word = "";
    },
    word_to_draw(word){
      this.wordToDraw = word;
      this.stepPause = false;
    },
    guess_sketch(data){
      this.sketchToGuess = data.sketch;
      this.roundId = data.roundId;
      this.playerSketch = data.playerName;
      this.stepPause = false;
    },
    step_pause(data){
      this.stepPause = true;
      this.stepMsg = data.msg; 
    },
    lobby_changed(){
      this.stepPause = false;
    },
    force_word_submit(){
      this.submitGuess();
    },
    error_word(data){
      this.error.add_word = data.error;
    }
  },
  methods: {
    startGame(){
      this.$socket.emit("start_game", { "username": this.username, "roomId": this.room.id});
    },
    leaveRoom(){
      //this.$socket.emit("leave_room", ); Implement later
      this.$socket.emit("leave_room", { "username": this.username, "roomId": this.room.id});
    },
    submitWord(){
        this.$socket.emit("add_word", {"roomId": this.room.id, "text": this.newWord});      
    },
    submitGuess(){
      this.$socket.emit("submit_guess", {"roomId": this.roundId, "word": this.guessSketch});
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.drawSketch{
  width: 100%;
  height: 90%;
}
.fillSpace{
  width: 100%;
  height: 90%;
}
.word-to-draw{
  color:red;
}
</style>