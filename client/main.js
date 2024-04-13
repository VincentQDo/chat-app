import "./style.css";
import { sendMessage, setupConnection } from "./sendMessage.js";

document.querySelector("#app").innerHTML = `
  <div>
    <div id="messageBox"></div>
    <input id="userInput"/>
    <button id="send" type="button" disabled>Send</button>
  </div>
`;

setupConnection(() => {
  const buttonEle = document.getElementById("send");
  buttonEle.disabled = false;
  buttonEle.addEventListener("click", () => {
    sendMessage(
      document.getElementById("userInput"),
      document.getElementById("messageBox")
    );
  });
});
