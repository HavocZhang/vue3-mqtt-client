import * as mqtt from "mqtt/dist/mqtt.min";
import { ref } from "vue";

/**
 * 发布内容类型定义
 */
export type PUBLISH_TYPE = {
  topic: string;
  qos: mqtt.IClientSubscribeOptions["qos"];
  payload: string;
};

/**
 * 连接mqtt信息
 */
export const CONNECTION = ref<mqtt.IClientOptions>({
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

/**
 * 订阅主题数组
 */
export const SUBSCRIPTIONS: mqtt.ISubscriptionRequest[] = [
  {
    topic: "topic/mqttx",
    qos: 0 as mqtt.IClientSubscribeOptions["qos"],
  },
];

/**
 * 发送内容示例
 */
export const PUBLISH_TEST: PUBLISH_TYPE = {
  topic: "topic/browser",
  qos: 0 as mqtt.IClientSubscribeOptions["qos"],
  payload: '{ "msg": "Hello, I am browser." }',
};
