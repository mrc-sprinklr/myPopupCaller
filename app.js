let dialer = null;

const acknowledged = (message) => {
  console.log("message sent");
};

function sendMessage(message, callback) {
  if (dialer) {
    dialer.receiveMessage(message, callback);
  }
}

function receiveMessage(message, callback) {
  console.log(message);
  callback(message);
}

window.onbeforeunload = () => {
  sendMessage("unloading", acknowledged);
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
