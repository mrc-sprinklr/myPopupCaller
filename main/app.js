class Message {
  constructor(sender, message, object) {
    this.sender = sender;
    this.message = message;
    this.object = object;
  }
}

let dialer = null;

const bc = new BroadcastChannel("connection-info");
bc.postMessage(new Message("main", "loaded", null));

const b1 = document.getElementById("b1");
b1.onclick = () => {
  dialer = open(
    "./dialer/index.html",
    "popup",
    "left=75, top=75, width=400, height=600"
  );
  dialer.focus();
};

/*
  MESSAGING GUIDELINES
*/
bc.onmessage = (event) => {
  if (event.data.sender === "popup") {
    if (event.data.message === "loaded") b1.disabled = true;
    else if (event.data.message === "on_state") b1.disabled = event.data.object;
  } else {
    console.log("broadcast message ignored");
  }
};
