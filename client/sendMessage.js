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

function setupConnection() {
  socket = new WebSocket("ws://localhost:8765");
  socket.onmessage = (event) => {
    console.log(`Res from server: `, event.data);
    const messageBox = document.getElementById('messageBox')
    messageBox.innerHTML = messageBox.innerHTML + `<p>${event.data}</p>`
  };

  socket.onopen = () => {
    console.log("Connected");
  };

  socket.onclose = () => {
    console.log("Closed");
    setTimeout(() => {
      console.log("Trying to reconnect...");
      retries--
      if (retries > 0)
        setupConnection();
    }, 5000);
  };
}

// Initial connection set up
setupConnection();
