import { currySendMsg, doHeavyWork, MSG_TYPES } from './sharedUtils.js';

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
    const workedData = doHeavyWork(data);
    const msg = { type: MSG_TYPES.HEAVY_WORK_DONE, data: workedData };

    /**
     * 3 ways to comunicate to the main thread
     *
     * `postMessage` is global in WorkerGlobalScope so we can call it directly
     */

    /**
     * here we are send a msg directly without the need to receive a msg and port
     */
    sendMsgToClient(msg);
    /**
     * here we are replying via the provided MessagePort
     */
    reply(msg);
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

  const reply = msg => replyPort.postMessage(msg);
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
        await doWork(data, reply);
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
