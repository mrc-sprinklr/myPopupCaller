class Message {
  constructor(header, comment, object) {
    this.header = header;
    this.comment = comment;
    this.object = object;
  }
}

const sendPreviousParent = () => {
  setTimeout(() => {
    sendMessage(new Message("reloaded", "previous dialer details", window));
  }, 2000);
};

function sendMessage(message) {
  if (window.opener) {
    window.opener.receiveMessage(message);
  } else {
    console.log("no parent window available");
  }
}

function receiveMessage(message) {
  if (message.header === "acknowledged") console.log(message.comment);
  else if (message.header === "unloading") sendPreviousParent();

  if (message.header && message.header != "acknowledged")
    sendMessage(new Message("acknowledged", "sent successfully", null));
}

sendMessage(new Message("initiated", "dialer popped up", null));
