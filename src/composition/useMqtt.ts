import * as mqtt from "mqtt/dist/mqtt.min";
import { Ref, ref, toRef, watch } from "vue";

export type MqttStatus = "OPEN" | "CONNECTING" | "CLOSED"

export interface UseMqttOptions {
  onConnected?: () => void,
  onDisconnected?: () => void,
  onError?: (error: Error | mqtt.ErrorWithReasonCode) => void,
  onMessage?: (topic: string, message: Buffer) => void,
  autoReconnect?: boolean | {
    retries?: number | (() => boolean)
    delay?: number
    onFailed?: Function
  },
  immediate?: boolean
}

export default function useMqtt(connection: Ref<mqtt.IClientOptions | undefined>, options: UseMqttOptions = {}) {
  const { onConnected, onDisconnected, onError, onMessage, immediate = true } = options
  const status = ref<MqttStatus>('CLOSED')
  const clientRef = ref<mqtt.MqttClient | undefined>()
  const connectionRef = toRef(connection)
  let explicitlyClosed = false
  let retried = 0
  let messageData: (string | Buffer)[] = []
  const _publishBuffer = (topic: string,) => {
    if (messageData.length && clientRef.value && status.value === "OPEN") {
      for (const buffer of messageData)
        clientRef.value.publish(topic, buffer)
      messageData = []
    }
  }
  const close = () => {
    if (!clientRef.value)
      return
    explicitlyClosed = true
    clientRef.value.end()
  }

  const send = (topic: string, message: string | Buffer, useBuffer = true) => {
    if (!clientRef.value || status.value !== "OPEN") {
      if (useBuffer)
        messageData.push(message)
      return
    }
    _publishBuffer(topic)
    clientRef.value.publish(topic, message)
    return true
  }

  const _init = () => {
    if (explicitlyClosed || typeof connectionRef.value === "undefined")
      return
    const { protocol, host, port, ...options } = connectionRef.value;
    const connectUrl = `${protocol}://${host}:${port}/mqtt`;
    const client = mqtt.connect(connectUrl, options)
    clientRef.value = client
    status.value = "CONNECTING"
    clientRef.value.on("connect", () => {
      status.value = "OPEN"
      onConnected?.()
    });
    clientRef.value.on("close", () => {
      status.value = "CLOSED"
      clientRef.value = undefined
      onDisconnected?.()
    })

    clientRef.value.on("error", (error) => {
      onError?.(error)
    });

    clientRef.value.on("message", (topic, message) => {
      onMessage?.(topic, message)
    });
  }

  const open = () => {
    close()
    explicitlyClosed = false
    retried = 0
    _init()
  }

  if (immediate)
    watch(connectionRef, open, { immediate: true })

  return {
    status,
    close,
    send,
    open,
    client: clientRef
  };
}
