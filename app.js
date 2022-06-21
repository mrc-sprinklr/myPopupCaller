let dialer = null;

class Message {
  constructor(header, comment, object) {
    this.header = header;
    this.comment = comment;
    this.object = object;
  }
}

function sendMessage(message) {
  if (dialer) {
    dialer.receiveMessage(message);
  } else {
    console.log("no dialer available");
  }
}

function receiveMessage(message) {
  if (message.header === "acknowledged" || message.header === "initiated")
    console.log(message.comment);
  else if (message.header === "reloaded") {
    dialer = message.object;
    console.log(message.comment);
  }

  if (message.header && message.header != "acknowledged")
    sendMessage(new Message("acknowledged", "sent successfully", null));
}

window.onbeforeunload = () => {
  sendMessage(new Message("unloading", null, null));
};

const b1 = document.getElementById("b1");
b1.onclick = () => {
  dialer = open(
    "./dialer/popup.html",
    "popup",
    "left=75, top=75, width=400, height=600"
  );
  dialer.focus();
};
