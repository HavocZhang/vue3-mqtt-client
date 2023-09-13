<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import useMqtt from "./composition/useMqtt";
import { CONNECTION, SUBSCRIPTIONS, PUBLISH_TEST } from "./config/mqtt";

const {
  createConnection,
  doSubscribe,
  destroyConnection,
  doPublish,
  listenerMessageChange,
} = useMqtt(CONNECTION);
const subscribe = () => {
  SUBSCRIPTIONS.forEach((el) => {
    doSubscribe(el);
  });
};
const publish = () => {
  doPublish(PUBLISH_TEST);
};
listenerMessageChange((message) => {
  console.log(message.message);
  console.log(message.topic);
});
onMounted(() => {
  createConnection();
});

onUnmounted(() => {
  destroyConnection();
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
  <button @click="subscribe">订阅</button>
  <button @click="publish">发送</button>
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
