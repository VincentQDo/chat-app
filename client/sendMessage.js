// global scope socket so sendMessage function can get it too
let socket;
let retries = 10;
let isAuthenticated = false;
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
  /**
   * @type {WebSocket}
   */
  socket = new WebSocket(import.meta.env.VITE_WS_URL);
  socket.onmessage = (event) => {
    console.log('is Authenticated: ', isAuthenticated)
    console.log('server message: ', event.data)
    if (isAuthenticated) {
      onClickCallback(isAuthenticated);
      console.log(`Res from server: `, event.data);
      const messageBox = document.getElementById("messageBox");
      messageBox.innerHTML = messageBox.innerHTML + event.data;
    } else {
      if (event.data === "Failed to authenticate") retries = 0;
      else isAuthenticated = true;
    }
  };

  socket.onopen = () => {
    socket.send(JSON.stringify({ userName: userName }));
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
