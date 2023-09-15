<script setup lang="ts">
import { ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import useMqtt from "./composition/useMqtt";
import * as mqtt from "mqtt/dist/mqtt.min";
const connection = ref<mqtt.IClientOptions>({
  protocol: "ws",
  host: "broker.emqx.io",
  port: 8083,
  clientId: "emqx_vue3_" + Math.random().toString(16).substring(2, 8),
  username: "emqx_test",
  password: "emqx_test",
  clean: true,
  connectTimeout: 30 * 1000,
  reconnectPeriod: 4000,
});
const { status, open, close } = useMqtt(connection, {
  onMessage(client, topic, message) {
    console.log(client);
    console.log(topic);
    console.log(message);
  },
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <h1>当前连接状态{{ status }}</h1>
  <button @click="open">开启</button>
  <button @click="close">关闭</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
