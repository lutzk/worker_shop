/**
 *
 * @param msg the msg to sent
 * @param reciever the target to where the msg will be sent
 * @param msgChannel a MessageChannel instance to used for communication
 * @param answerHandler a handler func to handle different kind of msg's
 */
const sendMsg = ({ msg, reciever, answerHandler = null }) =>
  new Promise((resolve, reject) => {
    const msgChannel = new MessageChannel();
    if (!msg) {
      throw Error('no `msg` provided');
    }
    if (!reciever) {
      throw Error('`sendMsg` called without reciever');
    }

    if (!msgChannel) {
      throw Error('no `msgChannel` was provided');
    }

    msgChannel.port1.onmessage = e => {
      if (e.data.error) {
        reject(e.data.error);
      } else {
        resolve(e.data);
        if (answerHandler) {
          answerHandler(e);
        }
      }
    };

    reciever.postMessage(msg, [msgChannel.port2]);
  }).catch(e => console.error(e));

/**
 * @param reciever the target to where the msg will be send
 * @param msgChannel a MessageChannel instance to use for communication
 * @param answerHandler a handler func to handle different kind of msg's
 */
const currySendMsg = ({ reciever, answerHandler = null }) => msg =>
  sendMsg({ msg, reciever, answerHandler });

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

export { currySendMsg, doHeavyWork, MSG_TYPES };
