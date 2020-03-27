import {
  doHeavyWork,
  currySendMsg,
  arrayBuffer2Json,
  json2ArrayBuffer,
  MSG_TYPES,
} from './sharedUtils.js';

/**
 *
 * @param path path to workerFile
 * @param name name to assign to the worker
 */
const initWorkerSync = (path, name) =>
  new Worker(path, { name, type: 'module' });

const workShopWorker = initWorkerSync('/worker.js', 'workShopWorker');
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
        const resultData = arrayBuffer2Json(data);
        console.log(MSG_TYPES.HEAVY_WORK_DONE, resultData);

        break;
      case MSG_TYPES.NO_TYPE_MATCH:
        console.log(MSG_TYPES.NO_TYPE_MATCH, data);
        break;

      default:
        break;
    }
  }
};
const sendMsgToWorker = currySendMsg({
  reciever: workShopWorker,
  answerHandler: workerMsgHandler,
});

/**
 *
 * we can listen directly to msg the worker sends to the mainThread
 */
// workShopWorker.onmessage = e => workerMsgHandler(e);

const doWork = async () => {
  const { data } = await import('./data.js');
  const dataForWorker = json2ArrayBuffer(data);
  /**
   * reply can be awaitet or handled via onmessage depending on how we reply
   * to enable awaiting it we need to replay with the MessageChanel ports postMessage function
   */

  /**
   *
   * comment out here to run work in workerThread
   */
  // await sendMsgToWorker({ type: MSG_TYPES.INIT }).then(reply =>
  //   console.log('reply from worker: ', reply),
  // );
  console.log(
    'dataForWorker.byteLength before transfer',
    dataForWorker.byteLength,
  );
  sendMsgToWorker({
    type: MSG_TYPES.DO_HEAVY_WORK,
    data: dataForWorker.buffer,
  });
  console.log(
    'dataForWorker.byteLength after transfer',
    dataForWorker.byteLength,
  );

  /**
   *
   * comment out here to run work in  mainThread
   */
  // const workedData = doHeavyWork(data);
  // console.log(workedData);
};

export { doWork };
