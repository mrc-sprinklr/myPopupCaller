class Message {
  constructor(sender, message, object) {
    this.sender = sender;
    this.message = message;
    this.object = object;
  }
}

const bc = new BroadcastChannel("connection-info");
bc.postMessage(new Message("popup", "loaded", null));

window.onbeforeunload = () => {
  bc.postMessage(new Message("popup", "on_state", false));
};

/*
  MESSAGING GUIDELINES
*/
bc.onmessage = (event) => {
  if (event.data.sender === "main") {
    if (event.data.message === "loaded")
      bc.postMessage(new Message("popup", "on_state", true));
  } else {
    console.log("broadcast message ignored");
  }
};
