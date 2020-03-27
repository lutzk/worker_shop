import {
  doHeavyWork,
  currySendMsg,
  arrayBuffer2Json,
  json2ArrayBuffer,
  MSG_TYPES,
} from './sharedUtils.js';

/**
 *
 * sends a msg to the mainThread
 * window ius called self in worker
 */
const sendMsgToClient = currySendMsg({ reciever: self });

/**
 *
 * @param data the data to work on
 * @param reply the reply function replying via the provided MessagePort
 */
const doWork = (data, reply) =>
  new Promise(resolve => {
    const workedData = json2ArrayBuffer(doHeavyWork(data));
    const msg = {
      type: MSG_TYPES.HEAVY_WORK_DONE,
      data: workedData.buffer,
    };

    /**
     * 3 ways to comunicate to the main thread
     *
     * `postMessage` is global in WorkerGlobalScope so we can call it directly
     */

    // /**
    //  * here we are send a msg directly without the need to receive a msg and port
    //  */
    // sendMsgToClient(msg);
    /**
     * here we are replying via the provided MessagePort
     */
    reply(msg, msg.data);
    resolve(true);
  });

/**
 *
 * @param e MessageEvent
 */
const handleMsg = async e => {
  const {
    ports: [replyPort],
    data: { type, data },
  } = e;

  const reply = (msg, data) => replyPort.postMessage(msg, [data]);
  const workerName = self.name || 'JohnnyWorkerDoe';
  const hello = `hola, ${workerName} is here to work for you, send me msg's and i'll work it out`;

  if (type) {
    let msg;
    switch (type) {
      case MSG_TYPES.INIT:
        msg = { type: MSG_TYPES.INIT_ACK, data: hello };
        reply(msg);
        break;

      case MSG_TYPES.DO_HEAVY_WORK:
        await doWork(arrayBuffer2Json(data), reply);
        break;

      default:
        msg = {
          type: MSG_TYPES.NO_TYPE_MATCH,
          data: 'no matching action found, no work done',
        };
        reply(msg);
        break;
    }
  }
};

self.addEventListener('message', e => handleMsg(e));
