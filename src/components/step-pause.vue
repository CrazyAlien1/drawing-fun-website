<template>

  <div id="stepPauseAnimation">
      <p id="stepMsg">{{msg}}</p>
  </div>

</template>

<script>
export default {
    name: 'StepPause',
  props: ["msg"],
  data: function() {
    return {
    }
  }
}
</script>

<style scoped>
    #stepPauseAnimation{
        width:100%;
        height:100%;
        position:absolute;
        animation-name:textFall;
        animation-duration: 3s;
        animation-fill-mode: forwards;
    }
    @keyframes textFall {
        0%   {color:red; left:0px; top:0px;}
        100%  {color:black; left:0px; top:200px;}
    }
    #stepMsg{
        font-size: 2.2em;
    }
</style>