<template>

  <div ref="canvasParent" class="fillSpace">
    <canvas v-if="mode=='DRAW'" id="canvas" ref="canvasBoard" class="triggerGPU"
            @mousedown="captureOn"
            @mousemove="captureMove"
            @mouseup="captureOff"
            @touchstart="captureOn"
            @touchmove="captureMove"
            @touchend="captureOff">
            Canvas not available.
    </canvas>
    <canvas v-else id="canvasStatic" ref="canvasBoardStatic" class="triggerGPU">
            Canvas not available.
    </canvas>

    <div v-if="mode=='DRAW'">
        <button v-for="color in availableColors" :key="color" 
            @click="selectColor(color)" 
            v-bind:style="{ backgroundColor: color}"
            class="colorBtn"></button>
        <button @click="revertLastDraw">Revert</button>
        <button @click="submitSketch">Submit</button>
        <button @click="restartSketch">Restart</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DrawSketch',
  props: ["forceSubmit", "word", "mode", "sketchToGuess"],
  data: function() {
    return {
        canvas: undefined,
        context: undefined,
        mouseStatus: undefined,
        color: "#2F4F4F",
        finalArrayDrawn: [],
        tempDrawing: {color: "#2F4F4F", arr: []},
        availableColors: ["#2F4F4F", "#FF6347", "#32CD32", "#00CED1"],
    }
  },
  sockets: {
      force_draw_submit(){
          this.submitSketch();
          console.log("GIMME THAT SKETCH RIGHT NOW!.............");
      }
  },
  methods: {
      draw(xPos, yPos){
        //Draw the array with all 
        this.context.beginPath();
        this.context.arc(xPos, yPos, 2, 0, 2*Math.PI);
        this.context.fillStyle= this.tempDrawing.color;
        this.context.strokeStyle= this.tempDrawing.color;
        this.context.fill();
        this.context.closePath();
        
        //Is it worth it to draw lines between dots? It IS!
        if(this.tempDrawing.arr.length > 0){
            let lastDot = this.tempDrawing.arr[this.tempDrawing.arr.length -1];
            let xDist = Math.abs(lastDot.x - xPos);
            let yDist = Math.abs(lastDot.y - yPos);
            if(xDist > 3 || yDist > 3){
                //Draw a line
                this.context.beginPath();
                this.context.moveTo(lastDot.x, lastDot.y);
                this.context.lineWidth = 4;
                this.context.lineTo(xPos, yPos);
                this.context.stroke();
                this.context.closePath();
            }
        }
        this.tempDrawing.arr.push({"x": xPos, "y": yPos});
        
      },
      captureOn(evt){
          this.mouseStatus = 1;
          this.draw(evt.offsetX, evt.offsetY);
      },
      captureOff(){
          this.mouseStatus = undefined;
          this.newDrawArr();
      },
      captureMove(evt){
          if(this.mouseStatus == 1){
            this.draw(evt.offsetX, evt.offsetY);
          }
      },
      selectColor(color){
          this.color = color;
          //Updates the current tempDrawing reactivity requires to update the full object by hardcore copy it
          let temp = JSON.parse(JSON.stringify(this.tempDrawing)); //Hardcore copy
          temp.color = this.color;
          this.tempDrawing = temp;
      },
      newDrawArr(){ //Called when lifting the mouse (for reverse purposes)
          this.finalArrayDrawn.push(JSON.parse(JSON.stringify(this.tempDrawing)));
          this.tempDrawing = { color: this.color, arr: [] };
      },
      drawFinalSketch(){
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          for (let i = 0; i < this.sketchToGuess.length; i++) { //For each step of the drawing

          //To draw slowly
            setTimeout(()=>{
                const subDrawing = this.sketchToGuess[i];
                this.selectColor(subDrawing.color); //Set the color for the redrawing of the step
                this.tempDrawing = { color: subDrawing.color, arr: [] };

                for (let c = 0; c < subDrawing.arr.length; c++) { //For each dot in the step
                    this.mouseStatus = 1;
                    this.captureMove({"offsetX": subDrawing.arr[c].x, "offsetY": subDrawing.arr[c].y});                  
                }
            }, 300*i);
          }
      },
      revertLastDraw(){
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          const prevSelectedColor = this.color;

            this.finalArrayDrawn.pop(); //Remove the last draw

          for (let i = 0; i < this.finalArrayDrawn.length; i++) { //For each step of the drawing
            const subDrawing = this.finalArrayDrawn[i];
            this.selectColor(subDrawing.color); //Set the color for the redrawing of the step
            this.tempDrawing = { color: subDrawing.color, arr: [] };

              for (let c = 0; c < subDrawing.arr.length; c++) { //For each dot in the step
                  this.mouseStatus = 1;
                  this.captureMove({"offsetX": subDrawing.arr[c].x, "offsetY": subDrawing.arr[c].y});
              }
              
          }
          this.mouseStatus = undefined; //Stop faking a mouse move
          this.tempDrawing = { color: prevSelectedColor, arr: [] };
      },
      submitSketch(){
          this.$socket.emit('submit-sketch', {"word": this.word, "sketch": this.finalArrayDrawn});
      },
      restartSketch(){
          this.finalArrayDrawn = [];
          this.tempDrawing = { color: this.color, arr: [] };
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
  },
  mounted() {
      console.log("MODO DE JOGO:::::::"+ this.mode);
      if(this.mode == "DRAW"){
        this.canvas = this.$refs['canvasBoard'];
      }else{
        this.canvas = this.$refs['canvasBoardStatic'];
      }
      this.context = this.canvas.getContext('2d');
      this.parentDiv = this.$refs['canvasParent'];
      
      setTimeout(()=>{
          this.canvas.width = this.parentDiv.clientWidth;
          this.canvas.height = this.parentDiv.clientHeight;
          if(this.mode == "GUESS"){
                //this.finalArrayDrawn = this.sketchToGuess;
                this.drawFinalSketch();
            }
      }, 100); //A bit f time to get the properties from parent (sketchToGuess)

      
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#canvas{
    border:1px solid #000000;
}
.fillSpace{
    width: 100%;
    height: 100%;
    min-height: 300px;
}
.colorBtn{
    width: 100px;
    height:50px;
}
</style>
