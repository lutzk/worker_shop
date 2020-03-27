const sendMsg = ({ msg, reciever, answerHandler = null }) =>
  new Promise((resolve, reject) => {
    /**
     * extract channe creation
     */
    const msgChannel = new MessageChannel();
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
    if (!reciever) {
      throw new Error(
        '`sendMsg` called without reciever, dont know where to send msg',
      );
    } else {
      reciever.postMessage(msg, [msgChannel.port2]);
    }
  }).catch(e => console.error(e));

const currySendMsg = (reciever, answerHandler = null) => msg =>
  sendMsg({ msg, reciever, answerHandler });

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

export { currySendMsg, doHeavyWork, MSG_TYPES };
