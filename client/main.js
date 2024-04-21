import "./style.css";
import { sendMessage, setupConnection } from "./sendMessage.js";

function app(userName) {
  return `
  <div>
    <h3>Welcome ${userName}</h3>
    <div id="messageBox"></div>
    <input id="userInput"/>
    <button id="send" type="button" disabled>Send</button>
  </div>`;
}

function login() {
  return `
  <div>
    <label for="userNameInput">Username:</label>
    <input name="userNameInput" id="userNameInput"/>
    <button id="connect" type="button">Connect</button>
  </div>
  `;
}

function updateAppState(userName) {
  const appEle = document.getElementById("app");
  appEle.innerHTML = login();
  if (userName) {
    setupConnection(userName, (isAuthenticated) => {
      if (isAuthenticated) appEle.innerHTML = app(userName);
      else return;
      const buttonEle = document.getElementById("send");
      buttonEle.disabled = false;
      buttonEle.addEventListener("click", () => {
        sendMessage(
          document.getElementById("userInput"),
          document.getElementById("messageBox")
        );
      });
    });
  }
}

function main() {
  updateAppState("");

  const connecBtn = document.getElementById("connect");
  connecBtn.addEventListener("click", () => {
    /**
     * @type {HTMLInputElement}
     */
    const userNameInput = document.getElementById("userNameInput");

    updateAppState(userNameInput.value ? userNameInput.value : "");
  });
}

main();
