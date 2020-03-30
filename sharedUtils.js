/**
 *
 * @param path path to workerFile
 * @param name name to assign to the worker
 */
const initWorkerSync = (path, name) =>
  new Worker(path, { name, type: 'module' });

/**
 *
 * @param event MessageEvent
 * @param answerHandler a handler func to handle different kind of msg's
 */
const handlePortMsg = ({ event, answerHandler }) =>
  new Promise((resolve, reject) => {
    if (event.data.error) {
      reject(event.data.error);
    } else {
      if (answerHandler) {
        answerHandler(event);
      }
      resolve(event.data);
    }
  });

/**
 *
 * @param msg the msg to sent
 * @param reciever the target to where the msg will be sent
 * @param msgChannel a MessageChannel instance to used for communication
 * @param answerHandler a handler func to handle different kind of msg's
 */
const sendMsg = ({ msg, reciever, msgChannel, answerHandler = null }) => {
  if (!msg) {
    throw Error('no `msg` provided');
  }
  if (!reciever) {
    throw Error('`sendMsg` called without reciever');
  }

  if (!msgChannel) {
    throw Error('no `port` was provided');
  }

  /**
   * if its the init msg we sent a msg directly to the reciever
   * via reciever.postMessage to share the MessagePort
   *
   * if its inialiized we communicate only via MessagePorts
   *
   * note how the port or the data are transfered
   * so they are not available from the sending thread anymore or neutered
   */
  if (msg.type === MSG_TYPES.INIT) {
    reciever.postMessage(msg, [msgChannel.port2]);
  } else {
    msgChannel.port1.postMessage(msg, [msg.data]);
  }

  /**
   * so we can await the answer
   */
  return new Promise(
    resolve =>
      (msgChannel.port1.onmessage = event =>
        resolve(handlePortMsg({ event, answerHandler }))),
  );
};

/**
 * @param reciever the target to where the msg will be send
 * @param msgChannel a MessageChannel instance to use for communication
 * @param answerHandler a handler func to handle different kind of msg's
 */
const currySendMsg = ({ reciever, msgChannel, answerHandler = null }) => msg =>
  sendMsg({ msg, reciever, msgChannel, answerHandler });

/**
 *
 * @param json the json data to transform
 * @returns Uint8Array
 */
const json2ArrayBuffer = json => new TextEncoder().encode(JSON.stringify(json));

/**
 *
 * @param arrayBuffer the ArrayBuffer to transform
 * @returns json object
 */
const arrayBuffer2Json = arrayBuffer =>
  JSON.parse(new TextDecoder().decode(arrayBuffer));

/**
 *
 * @param data the data to work on
 */
const doHeavyWork = data => {
  let dataString;
  let parsedData;

  /**
   * iterations
   * adjust the number based on your machine cpu cores & power
   */
  const iterations = 10;
  for (let index = 0; index < iterations; index++) {
    dataString = JSON.stringify(data);
    parsedData = JSON.parse(dataString);
  }
  return parsedData;
};

const setStatusText = text => {
  window.statusDisplay.textContent = text;
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
};

const MSG_TYPES = {
  INIT: '@worker/INIT',
  INIT_ACK: '@main/INIT_ACK',
  DO_HEAVY_WORK: '@worker/DO_HEAVY_WORK',
  HEAVY_WORK_DONE: '@main/HEAVY_WORK_DONE',
  NO_TYPE_MATCH: 'NO_TYPE_MATCH',
};

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

export {
  currySendMsg,
  doHeavyWork,
  setStatusText,
  handlePortMsg,
  initWorkerSync,
  json2ArrayBuffer,
  arrayBuffer2Json,
  MSG_TYPES,
};
