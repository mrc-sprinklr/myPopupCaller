function sendMessage(message, callback) {
  if (window.opener) {
    window.opener.receiveMessage(message, callback);
  }
}

function receiveMessage(message, callback) {
  callback(message);
}

sendMessage("dialer popped up", (message) => {
  // window.console.log("message sent");
  console.log("message sent");
});
