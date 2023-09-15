# useMqtt

## Usage

```ts
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
  onMessage(topic, message) {
    console.log(topic);
    console.log(message);
  },
});
```

### Immediate

Auto-connect (enabled by default).

This will call `open()` automatically for you and you don't need to call it by yourself.

If url is provided as a ref, this also controls whether a connection is re-established when its value is changed (or whether you need to call open() again for the change to take effect).
