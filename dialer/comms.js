const acknowledged = (message) => {
  console.log("message sent");
};

function sendMessage(message, callback) {
  if (window.opener) {
    window.opener.receiveMessage(message, callback);
  }
}

function receiveMessage(message, callback) {
  console.log(message);
  callback(message);
}

sendMessage("dialer popped up", acknowledged);
