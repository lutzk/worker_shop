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
 * window is called `self` in worker
 */
// const sendMsgToClient = currySendMsg({ reciever: self });

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
     *  3 ways to comunicate to the main thread
     *
     *  `postMessage` is global in WorkerGlobalScope so we can call it directly
     */

    /**
     *   we can also send a msg directly without the need to receive a msg and port
     *   thas msg can be recieved via worker.onmessage in mainThread
     *
     *   sendMsgToClient(msg);
     */

    /**
     * here we are replying via the provided MessagePort
     */
    reply(msg, msg.data);
    resolve(true);
  });


/**
 * 
 * set up
 */
let port;
let reply;
let replayWithData;

const handleDefault = () =>
  reply({
    type: MSG_TYPES.NO_TYPE_MATCH,
    data: 'no matching action found, no work done',
  });

/**
 *
 * @param event MessageEvent
 */
const handleWorkMsg = async event => {
  const {
    data: { type, data },
  } = event;

  if (type) {
    switch (type) {
      case MSG_TYPES.DO_HEAVY_WORK:
        await doWork(arrayBuffer2Json(data), replayWithData);
        break;

      default:
        handleDefault();
        break;
    }
  }
};

/**
 *
 * @param event MessageEvent
 */
const handleInitMsg = async event => {
  const {
    ports: [replyPort],
    data: { type },
  } = event;
  const workerName = self.name || 'JohnnyWorkerDoe';
  const hello = `Hola, my name is ${workerName}, i am here to work for you, send me msg's and i'll work it out`;

  if (type) {
    switch (type) {
      case MSG_TYPES.INIT:
        /**
         *
         *  get MessagePort from the sender
         *  and set up some reply functions
         */
        port = replyPort;
        const curryReply = port => msg => port.postMessage(msg);
        const curryReplayWithData = port => (msg, data) =>
          port.postMessage(msg, [data]);

        /**
         *
         *  set up the MessagePort to handle incomming msg
         */
        reply = curryReply(port);

        /**
         * 
         * set up the msgHandler on the port
        */
        port.onmessage = e => handleWorkMsg(e);
        replayWithData = curryReplayWithData(port);
        reply({ type: MSG_TYPES.INIT_ACK, data: hello });
        break;

      default:
        handleDefault();
        break;
    }
  }
};

/**
 *
 * we just listen for the init msg to recieve the MessagePort
 */
self.addEventListener('message', event => handleInitMsg(event));
