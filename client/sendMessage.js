// global scope socket so sendMessage function can get it too
let socket;
let retries = 10;
/**
 *
 * @param {HTMLInputElement} ele
 * @param {HTMLDivElement} messageBox
 */
export function sendMessage(ele, messageBox) {
  console.log(`Sending message: ${ele.value}`);
  socket.send(ele.value);
  ele.value = "";
}

/**
 *
 * @param {string} userName
 * @param {() => void} onClickCallback
 */
export function setupConnection(userName, onClickCallback) {
  console.log(userName)
  socket = new WebSocket(import.meta.env.VITE_WS_URL + `?userName=${userName}`);
  socket.onmessage = (event) => {
    console.log(`Res from server: `, event.data);
    const messageBox = document.getElementById("messageBox");
    messageBox.innerHTML = messageBox.innerHTML + event.data;
  };

  socket.onopen = () => {
    console.log("Connected");
    onClickCallback();
  };

  socket.onclose = () => {
    console.log("Closed");
    setTimeout(() => {
      console.log("Trying to reconnect...");
      retries--;
      if (retries > 0) setupConnection();
      else console.log("Failed to reconnect, server may be down...");
    }, 5000);
  };
}
