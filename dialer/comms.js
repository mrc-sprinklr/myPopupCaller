/*
  MESSAGING GUIDELINES
*/
bc.onmessage = (event) => {
  if (event.data.sender === "popup") {
    if (event.data.message === "loaded") {
      bc.postMessage(new Message("dialer", "loaded", null));
    } else if (event.data.message === "call_object") {
      // printing call object
      console.log(event.data.object);

      setCallObject(event.data.object);
    } else {
      console.log("DIALER: broadcast message ignored");
    }
  }
};

function setCallObject(call_object) {
  // conn_state
  if (call_object.conn_state) {
    document
      .getElementById("live-socket-dot")
      .classList.replace("socket-disconnected", "socket-connected");
    phone_button.disabled = false;
  } else {
    document
      .getElementById("live-socket-dot")
      .classList.replace("socket-connected", "socket-disconnected");
    phone_button.disabled = true;
  }

  // dev_mode
  document.getElementById("switch").checked = call_object.dev_mode;

  // country_code
  document.getElementById("country").value = call_object.country_code;
  country_code.innerHTML = call_object.country_code;

  // dialed_number
  if (call_object.dialed_number)
    addNumberToDialpad(call_object.dialed_number, false);

  // call_state
  if (call_object.call_state != phone_call_state) {
    handlePhoneButton();
  }

  // mute_state
  if (call_object.mute_state != null) {
    handleMuteButton(call_object.mute_state);
  }

  // hold_state
  if (call_object.hold_state != null) {
    handleHoldButton(call_object.hold_state);
  }
}
