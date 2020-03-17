import Vue from 'vue'
import App from './App.vue'
import VueSocketio from 'vue-socket.io';

import Sketch from './components/Logic/Sketch';

Vue.config.productionTip = false

Vue.use(new VueSocketio({
	debug: true,
	connection: 'http://127.0.0.1:8888'
}));

Vue.use(Sketch);

new Vue({
  render: h => h(App),
}).$mount('#app')
