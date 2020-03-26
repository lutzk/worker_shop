const sendMsg = ({ msg, reciever }) =>
  new Promise((resolve, reject) => {
    const msgChannel = new MessageChannel();
    msgChannel.port1.onmessage = e => {
      if (e.data.error) {
        reject(e.data.error);
      } else {
        resolve(e.data);
      }
    };
    if (!reciever) {
      throw new Error(
        "`sendMsg` called without reciever, dont know where to send msg"
      );
    } else {
      reciever.postMessage(msg, [msgChannel.port2]);
    }
  }).catch(e => console.error(e));

const currySendMsg = reciever => msg => sendMsg({ msg, reciever });
const sendMsgToClient = currySendMsg(self);

const doHeavyWork = (data, reply) => {
  return new Promise(resolve => {
    let d;
    let d2;
    for (let index = 0; index < 1000; index++) {
      d = JSON.stringify(data);
      d2 = JSON.parse(d);
    }
    const msg = { type: "workDone", data: d2 };

    /**
     * 3 ways to comunicate to the main thread
     */
    // postMessage // postmessage is global
    sendMsgToClient(msg);
    reply(msg);
    resolve(true);
  });
};

const handleMsg = async e => {
  const {
    ports: [replyPort],
    data: { type, data }
  } = e;
  const reply = msg => replyPort.postMessage(msg);

  const workerName = self.name || "johnWorkerDoe";
  const hello = `hola, ${workerName} is here to work for you, send me msg's and i'll work it out`;

  if (type) {
    let msg;
    switch (type) {
      case "init":
        msg = { type: "initAck", data: hello };
        reply(msg);
        sendMsgToClient(msg);
        break;

      case "heavyWork":
        await doHeavyWork(data, reply);
        break;

      default:
        msg = {
          type: "noTypeMatch",
          data: "no matching action found, no work done"
        };
        reply(msg);
        sendMsgToClient(msg);
        break;
    }
  }
};

self.addEventListener("message", e => handleMsg(e));
