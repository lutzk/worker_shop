
/**
 * example of inline created worker
 * https://2ality.com/2017/01/messagechannel.html#inlining-web-workers
 */

// const getInlineWorker = worker => {
//   const src = `(${worker})();`;
//   const blob = new Blob([src], { type: "application/javascript" });
//   const url = URL.createObjectURL(blob);
//   return url;
// }; 


// const workersEnabled = () => 'Worker' in window;
const sendMsg = ({ msg, reciever }) =>
  new Promise((resolve, reject) => {
    const msgChannel = new MessageChannel();
    msgChannel.port1.onmessage = e => {
      if (e.data.error) {
        reject(e.data.error);
      } else {
        resolve(e.data);
        /**
         * could also be handled here directly instead in worker.onmessage
         */
        // workerMsgHandler(e);
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

const initWorkerSync = (path, name) => new Worker(path, { name });
const currySendMsg = reciever => msg => sendMsg({ msg, reciever });
const workShopWorker = initWorkerSync("/worker.js", "workShopWorker");
workShopWorker.onmessage = e => workerMsgHandler(e);

const sendMsgToWorker = currySendMsg(workShopWorker);
const workerMsgHandler = e => {
  const {
    data: { type, data }
  } = e;
  if (type) {
    switch (type) {
      case "initAck":
        console.log("initAck", data);
        break;

      case "workDone":
        console.log("workDone", data);
        break;

      case "noTypeMatch":
        console.log("noTypeMatch", data);
        break;

      default:
        break;
    }
  }
};

const work = async () => {
  import("./data.js").then(async ({ data }) => {
    /**
     * reply can be awaited or handled via onmessage depending on how we reply
     * to enable awaiting it we need to replay with the MessageChanel ports postMessage function
    */
    await sendMsgToWorker({ type: "init" }).then(reply =>
      console.log("reply from pouch worker: ", reply)
    );
    await sendMsgToWorker({ type: "heavyWork", data });
    // for (let index = 0; index < 10; index++) {
    //   let d = JSON.stringify(data);
    //   let d2 = JSON.parse(d);
    // }
  });
};
