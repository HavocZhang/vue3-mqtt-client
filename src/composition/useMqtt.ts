import mitt, { Handler } from "mitt";
import * as mqtt from "mqtt/dist/mqtt.min";
import { ref } from "vue";
import type { PUBLISH_TYPE } from "../config/mqtt";

export default function useMqtt(connection: mqtt.IClientOptions) {
  const emitter = mitt();
  const key = Symbol("MESSAGE_CHANGE");
  let client = ref({
    connected: false,
  } as mqtt.MqttClient);
  const receivedMessages = ref("");
  const subscribedSuccess = ref(false);
  /**
   * 登录状态
   */
  const loadingType = ref("");
  const retryTimes = ref(0);

  const initData = () => {
    client.value = {
      connected: false,
    } as mqtt.MqttClient;
    retryTimes.value = 0;
    loadingType.value = "";
    subscribedSuccess.value = false;
  };

  const handleOnReConnect = () => {
    retryTimes.value += 1;
    if (retryTimes.value > 5) {
      try {
        client.value.end();
        initData();
        console.log("connection maxReconnectTimes limit, stop retry");
      } catch (error) {
        console.log("handleOnReConnect catch error:", error);
      }
    }
  };

  /**
   * 连接mqtt
   */
  const createConnection = () => {
    try {
      loadingType.value = "connect";
      const { protocol, host, port, ...options } = connection;
      const connectUrl = `${protocol}://${host}:${port}/mqtt`;
      client.value = mqtt.connect(connectUrl, options);

      if (client.value.on) {
        client.value.on("connect", () => {
          loadingType.value = "";
          console.log("connection successful");
        });

        client.value.on("reconnect", handleOnReConnect);

        client.value.on("error", (error) => {
          console.log("connection error:", error);
        });

        client.value.on("message", (topic: string, message) => {
          receivedMessages.value = receivedMessages.value.concat(
            message.toString()
          );
          emitter.emit(key, { message, topic });
          console.log(`received message: ${message} from topic: ${topic}`);
        });
      }
    } catch (error) {
      loadingType.value = "";
      console.log("mqtt.connect error:", error);
    }
  };

  /**
   * 订阅主题
   * @param subscription 主题
   */
  const doSubscribe = (subscription: mqtt.ISubscriptionRequest) => {
    loadingType.value = "subscribe";
    const { topic, qos } = subscription;
    client.value.subscribe(
      topic,
      { qos },
      (err: Error | null, granted: mqtt.ISubscriptionGrant[]) => {
        loadingType.value = "";
        if (err) {
          console.log("subscribe error:", err);
          return;
        }
        subscribedSuccess.value = true;
        console.log("subscribe successfully:", granted);
      }
    );
  };

  /**
   * 取消订阅主题
   * @param subscription 主题
   */
  const doUnSubscribe = (subscription: mqtt.ISubscriptionRequest) => {
    loadingType.value = "unsubscribe";
    const { topic, qos } = subscription;
    client.value.unsubscribe(topic, { qos }, (error) => {
      loadingType.value = "";
      subscribedSuccess.value = false;
      if (error) {
        console.log("unsubscribe error:", error);
        return;
      }
      console.log(`unsubscribed topic: ${topic}`);
    });
  };

  /**
   * 发布
   * @param publish 发布内容
   */
  const doPublish = (publish: PUBLISH_TYPE) => {
    loadingType.value = "publish";
    const { topic, qos, payload } = publish;
    client.value.publish(topic, payload, { qos }, (error) => {
      loadingType.value = "";
      if (error) {
        console.log("publish error:", error);
        return;
      }
      console.log(`published message: ${payload}`);
    });
  };

  /**
   * 监听mqtt消息
   * @param handler 回调句柄
   */
  const listenerMessageChange = (
    handler: (message: { message: Buffer; topic: string }) => void
  ) => {
    emitter.on(key, handler as Handler);
  };

  /**
   * 断开mqtt
   */
  const destroyConnection = () => {
    if (client.value.connected) {
      loadingType.value = "disconnect";
      try {
        client.value.end(false, () => {
          initData();
          console.log("disconnected successfully");
        });
      } catch (error) {
        loadingType.value = "";
        console.log("disconnect error:", error);
      }
    }
    emitter.off(key);
  };

  return {
    loadingType,
    createConnection,
    doSubscribe,
    doUnSubscribe,
    doPublish,
    destroyConnection,
    listenerMessageChange,
  };
}
