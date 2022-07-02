class CallObject {
  constructor(
    conn_state,
    dev_mode,
    call_state,
    country_code,
    dialed_number,
    start_time,
    mute_state,
    hold_state
  ) {
    this.conn_state = conn_state;
    this.dev_mode = dev_mode;
    this.call_state = call_state;
    this.country_code = country_code; // updated only before call_state
    this.dialed_number = dialed_number; // updated only before call_state
    this.start_time = start_time;
    this.mute_state = mute_state;
    this.hold_state = hold_state;
  }
}

const call_object = new CallObject(
  false,
  true,
  false,
  "+1",
  null,
  0,
  false,
  false
);

/*
  WINDOW RESTRICTIONS & DEVELOPER MODE
*/
const outerWidth = window.outerWidth;
const outerHeight = window.outerHeight;
let isResized = null;
const windowResizeHandler = () => {
  clearTimeout(isResized);
  isResized = setTimeout(() => {
    window.resizeTo(outerWidth, outerHeight);
  }, 200);
};

const windowUnloadHandler = (event) => {
  event.preventDefault();
  return (event.returnValue = "");
};

const windowContextHandler = (event) => {
  event.preventDefault();
  return false;
};

if (!call_object.dev_mode) {
  window.addEventListener("resize", windowResizeHandler);
  window.addEventListener("beforeunload", windowUnloadHandler);
  window.addEventListener("contextmenu", windowContextHandler);
}

/*
  SOCKET CONNECTION ESTABLISHED
*/
const callback = function () {
  document.querySelector("h2").textContent = "CONNECTED";
  document.querySelector(".ripple").remove();

  call_object.conn_state = true;
  bc.postMessage(new Message("popup", "call_object", call_object));
};

setTimeout(() => {
  connect(callback);
}, 1000);

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
  bc.postMessage(new Message("popup", "unloading", null));
};

/*
  MESSAGING GUIDELINES
*/
bc.onmessage = (event) => {
  if (event.data.sender === "main") {
    if (event.data.message === "loaded") {
      bc.postMessage(new Message("popup", "on_state", true));
    }
  } else if (event.data.sender === "dialer") {
    if (event.data.message === "loaded") {
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "dev_mode") {
      call_object.dev_mode = event.data.object;
      if (call_object.dev_mode) {
        window.removeEventListener("resize", windowResizeHandler);
        window.removeEventListener("beforeunload", windowUnloadHandler);
        window.removeEventListener("contextmenu", windowContextHandler);
      } else {
        window.addEventListener("resize", windowResizeHandler);
        window.addEventListener("beforeunload", windowUnloadHandler);
        window.addEventListener("contextmenu", windowContextHandler);
      }
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "call_state") {
      call_object.call_state = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));

      if (call_object.call_state) {
        console.log("call_object: good");
        callNumber(call_object.dialed_number); // jssip call
      } else {
        console.log("call_object: bad");
        terminate(); // jssip hangup
      }
    } else if (event.data.message === "country_code") {
      call_object.country_code = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "dialed_number") {
      call_object.dialed_number = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "start_time") {
      call_object.start_time = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "mute_state") {
      call_object.mute_state = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));
    } else if (event.data.message === "hold_state") {
      call_object.hold_state = event.data.object;
      bc.postMessage(new Message("popup", "call_object", call_object));
    }
  } else {
    console.log("POPUP: broadcast message ignored");
  }
};
