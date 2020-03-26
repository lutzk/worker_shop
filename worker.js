import { currySendMsg, doHeavyWork, MSG_TYPES } from './sharedUtils.js';

const sendMsgToClient = currySendMsg(self);

const doWork = (data, reply) => {
  return new Promise(resolve => {
    const workedData = doHeavyWork(data);
    const msg = { type: MSG_TYPES.HEAVY_WORK_DONE, data: workedData };

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
        sendMsgToClient(msg);
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
        sendMsgToClient(msg);
        break;
    }
  }
};

self.addEventListener('message', e => handleMsg(e));
