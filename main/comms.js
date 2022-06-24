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

const b1 = document.getElementById("dialer-button");
b1.onclick = () => {
  connection = open(
    "./popup/index.html",
    "connection",
    "left=0, top=0, width=200, height=200"
  );
  document.getElementById("dialer-frame").classList.remove("invisible");
  b1.disabled = true;
};

/*
  MESSAGING GUIDELINES
*/
bc.onmessage = (event) => {
  if (event.data.sender === "popup") {
    if (event.data.message === "loaded") {
      bc.postMessage(new Message("main", "loaded", null));
    } else if (event.data.message === "on_state") {
      if (event.data.object) {
        document.getElementById("dialer-frame").classList.remove("invisible");
        b1.disabled = true;
      } else {
        document.getElementById("dialer-frame").classList.add("invisible");
        b1.disabled = false;
      }
    } else if (event.data.message === "unloading") {
      window.location.reload();
    }
  } else {
    console.log("MAIN: broadcast message ignored");
  }
};
