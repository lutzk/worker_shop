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

import { currySendMsg, MSG_TYPES } from './sharedUtils.js';

const initWorkerSync = (path, name) =>
  new Worker(path, { name, type: 'module' });

const workShopWorker = initWorkerSync('/worker.js', 'workShopWorker');
workShopWorker.onmessage = e => workerMsgHandler(e);

const sendMsgToWorker = currySendMsg(workShopWorker);
const workerMsgHandler = e => {
  const {
    data: { type, data },
  } = e;
  if (type) {
    switch (type) {
      case MSG_TYPES.INIT_ACK:
        console.log(MSG_TYPES.INIT_ACK, data);
        break;

      case MSG_TYPES.HEAVY_WORK_DONE:
        console.log(MSG_TYPES.HEAVY_WORK_DONE, data);
        break;

      case MSG_TYPES.NO_TYPE_MATCH:
        console.log(MSG_TYPES.NO_TYPE_MATCH, data);
        break;

      default:
        break;
    }
  }
};

const doWork = async () => {
  import('./data.js').then(async ({ data }) => {
    /**
     * reply can be awaited or handled via onmessage depending on how we reply
     * to enable awaiting it we need to replay with the MessageChanel ports postMessage function
     */
    await sendMsgToWorker({ type: MSG_TYPES.INIT }).then(reply =>
      console.log('reply from pouch worker: ', reply),
    );
    await sendMsgToWorker({ type: MSG_TYPES.DO_HEAVY_WORK, data });
    // const workedData = doHeavyWork(data);
    // console.log(workedData);
  });
};

export { doWork };
