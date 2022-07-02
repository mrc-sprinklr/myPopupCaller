class Message {
  constructor(sender, message, object) {
    this.sender = sender;
    this.message = message;
    this.object = object;
  }
}
const bc = new BroadcastChannel("connection-info");
bc.postMessage(new Message("dialer", "loaded", null));

const root_container = document.querySelector(".root-container");

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

document.getElementById("switch").addEventListener("change", function () {
  bc.postMessage(new Message("dialer", "dev_mode", this.checked));
});

/*
  BLINKING EFFECT OF CURSOR
*/
let cursor_text = ["|", "&nbsp;"];
let cursor_state = 0;
setInterval(() => {
  cursor_state ^= 1;
  document.getElementById("number-cursor").innerHTML =
    cursor_text[cursor_state];
}, 500);

/*
  INSERT CURSOR WITH MOUSE CLICKS
*/
let [phone_call_state, mute_state, hold_state] = [false, false, false];
function insertCursor(event) {
  if (phone_call_state) return null;

  let id = Number(event.target.id.slice("position-".length));
  // console.log(id);

  let span_rect = document
    .getElementById(`position-${id}`)
    .getBoundingClientRect();
  let diff = 2 * event.clientX - span_rect.left - span_rect.right > 0;
  // console.log(diff);

  dialed_digits.splice(cursor_index, 1);
  cursor_index = id + diff;
  dialed_digits.splice(cursor_index, 0, cursor_object);
  updateDialedNumber();
}

/*
  UPDATE THE DIALED_NUMBER VIEW
*/
let cursor_index = 0;
const cursor_object = {
  key: "|",
  html: '<span id="number-cursor">|</span>',
};
let dialed_digits = [cursor_object];
const dialed_number = document.querySelector(".dialed-number");

function updateDialedNumber() {
  dialed_number.innerHTML = "";
  let i = 0;
  dialed_digits.forEach((each) => {
    if (each.key != "|")
      each.html = each.html.replace(/position-\d+/, `position-${i++}`);
    dialed_number.innerHTML += each.html;
  });
  if (phone_call_state)
    document.getElementById("number-cursor").classList.add("hide");
  document.querySelectorAll(".editable").forEach((element) => {
    element.onclick = insertCursor;
  });
}

/*
  LISTENING TO MOUSE CLICKS
*/
document.querySelectorAll(".digit").forEach((each) => {
  each.onclick = () => {
    if (dialed_digits.length <= 10) {
      dialed_digits.splice(cursor_index++, 0, {
        key: `${each.textContent}`,
        html: `<span class="editable" id="position-0">${each.textContent}</span>`,
      });
      updateDialedNumber();
    }
  };
});

/*
  LISTENING TO CALL BUTTON
*/
const phone_button = document.getElementById("phone-button");
phone_button.disabled = true;

const call_container = document.querySelector(".call");
let dialed_phone_number = null;
let dialed_phone_numbers = new Set();

phone_button.onclick = () => {
  handlePhoneButton();

  bc.postMessage(new Message("dialer", "dialed_number", dialed_phone_number));
  bc.postMessage(new Message("dialer", "call_state", phone_call_state));
};

let start_time = 0;
const secondsPassed = (start_time) =>
  Math.round((Date.now() - start_time) / 1000);

function handlePhoneButton() {
  if (dialed_phone_number) {
    if (mute_state) mute_button.click();
    if (hold_state) hold_button.click();

    call_container.classList.remove("call-connected");
    call_container.classList.add("call-disconnected");
    console.log("Hung-up: ", country_code.textContent + dialed_phone_number);
    dialed_phone_number = null;
    flipDialpad(false);

    start_time = 0;
    toggleTimer(false);

    phone_call_state = false;
  } else if (dialed_digits.length > 1) {
    dialed_phone_number = "";
    dialed_digits.forEach((each) => {
      if (each.key != "|") dialed_phone_number += each.key;
    });
    if (!dialed_phone_numbers.has(dialed_phone_number))
      addToHistory(dialed_phone_number);

    call_container.classList.remove("call-disconnected");
    call_container.classList.add("call-connected");
    console.log("Dialing: ", country_code.textContent + dialed_phone_number);
    flipDialpad(true);

    if (start_time == 0) {
      start_time = Date.now();
      bc.postMessage(new Message("dialer", "start_time", start_time));
    }
    toggleTimer(true);

    phone_call_state = true;
  }
}

function addToHistory(dialed_phone_number) {
  let opt_tag = `<option value="${dialed_phone_number}">${dialed_phone_number}</option>`;
  document.getElementById("history").innerHTML += opt_tag;
  dialed_phone_numbers.add(dialed_phone_number);
}

const before_call = document.querySelector(".before-call");
const after_call = document.querySelector(".after-call");

function flipDialpad(flip_type) {
  document.getElementById("number-cursor").classList.toggle("hide");
  if (flip_type) {
    before_call.classList.remove("rotate0");
    before_call.classList.add("rotate-180");

    after_call.classList.remove("rotate180");
    after_call.classList.add("rotate0");
  } else {
    before_call.classList.remove("rotate-180");
    before_call.classList.add("rotate0");

    after_call.classList.remove("rotate0");
    after_call.classList.add("rotate180");
  }
}

const hour = document.getElementById("time-h");
const minute = document.getElementById("time-m");
const second = document.getElementById("time-s");
let [h, m, s, call_timer] = [0, 0, 0, null];
function toggleTimer(start) {
  if (start) {
    call_timer = setInterval(() => {
      s = secondsPassed(start_time);
      h = Math.floor(s / 3600);
      s = s - 3600 * h;
      m = Math.floor(s / 60);
      s = s - 60 * m;

      second.innerHTML = s < 10 ? "0" + s : s;
      minute.innerHTML = m < 10 ? "0" + m : m;
      hour.innerHTML = h < 10 ? "0" + h : h;
    }, 1000);
  } else {
    console.log(`Call duration: ${h}:${m}:${s}`);

    clearInterval(call_timer);
    [hour.innerHTML, minute.innerHTML, second.innerHTML] = ["-", "-", "-"];

    [h, m, s, call_timer] = [0, 0, 0, null];
  }
}

/*
  LISTENING TO KEYPRESSES (DIGITS, BACKSPACE, ARROWS)
*/
const country_code = document.getElementById("country-code");

window.addEventListener("keydown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.key >= "0" && event.key <= "9") {
    if (dialed_digits.length <= 10) {
      dialed_digits.splice(cursor_index++, 0, {
        key: `${event.key}`,
        html: `<span class="editable" id="position-0">${event.key}</span>`,
      });
      updateDialedNumber();
    }
  } else if (event.key === "Backspace") {
    if (cursor_index > 0) {
      dialed_digits.splice(--cursor_index, 1);
      updateDialedNumber();
    }
  } else if (event.key === "ArrowLeft") {
    if (cursor_index > 0) {
      dialed_digits.splice(cursor_index--, 1);
      dialed_digits.splice(cursor_index, 0, cursor_object);
      updateDialedNumber();
    }
  } else if (event.key === "ArrowRight") {
    if (cursor_index < dialed_digits.length - 1) {
      dialed_digits.splice(cursor_index++, 1);
      dialed_digits.splice(cursor_index, 0, cursor_object);
      updateDialedNumber();
    }
  } else if (event.key === "ArrowUp") {
    if (cursor_index > 0) {
      dialed_digits.splice(cursor_index, 1);
      cursor_index = 0;
      dialed_digits.splice(cursor_index, 0, cursor_object);
      updateDialedNumber();
    }
  } else if (event.key === "ArrowDown") {
    if (cursor_index < dialed_digits.length - 1) {
      dialed_digits.splice(cursor_index, 1);
      cursor_index = dialed_digits.length;
      dialed_digits.splice(cursor_index, 0, cursor_object);
      updateDialedNumber();
    }
  } else if (event.key === "Enter") {
    phone_button.click();
  }
});

/*
  ACCESSING THE SETTINGS
*/
const main_page = document.querySelector(".main-page");
const settings_page = document.querySelector(".settings-page");

const bars_button = document.getElementById("bars-button");
const cross_button = document.getElementById("cross-button");

bars_button.onclick = () => {
  settings_page.classList.remove("invisible");
  main_page.classList.add("shift-left");
  settings_page.classList.remove("shift-right");
  setTimeout(() => {
    main_page.classList.add("invisible");
  }, 800);
};

cross_button.onclick = () => {
  main_page.classList.remove("invisible");
  settings_page.classList.add("shift-right");
  main_page.classList.remove("shift-left");
  setTimeout(() => {
    settings_page.classList.add("invisible");
  }, 800);
};

/*
  CHANGING THE THEME
*/
let cur_theme = "theme-silver";
document.getElementById("theme").addEventListener("change", (event) => {
  root_container.classList.remove(cur_theme);
  cur_theme = event.target.value;
  root_container.classList.add(cur_theme);
});

/*
  COUNTRY CODE
*/
document.getElementById("country").addEventListener("change", (event) => {
  country_code.innerHTML = event.target.value;
  bc.postMessage(new Message("dialer", "country_code", country_code.innerHTML));
});

/*
  DIALED NUMBER HISTORY
*/
const history_select = document.getElementById("history");
history_select.addEventListener("change", (event) => {
  addNumberToDialpad(event.target.value, false);
  cross_button.click();
  history_select.value = ""; // doesn't trigger a change
});

// addNumberToDialpad("+441116664445", true);
// addNumberToDialpad("1116664445", false);
function addNumberToDialpad(num, withCountryCode) {
  if (withCountryCode) {
    document.getElementById("country-code").innerHTML = num.slice(0, -10);
    num = num.slice(-10);
  }
  dialed_digits = [];
  Array.from(String(num)).forEach((each_digit) => {
    dialed_digits.push({
      key: `${each_digit}`,
      html: `<span class="editable" id="position-0">${each_digit}</span>`,
    });
  });
  dialed_digits.push(cursor_object);
  cursor_index = num.length;
  updateDialedNumber();
}

/*
  MUTE BUTTON
*/
const mute_button = document.getElementById("mute-button");
mute_button.onclick = () => {
  handleMuteButton(!mute_state);
  bc.postMessage(new Message("dialer", "mute_state", mute_state));
};

function handleMuteButton(bool) {
  if (mute_state != bool) {
    mute_button.classList.toggle("active-button");
  }
  mute_state = bool;
}

/*
  HOLD BUTTON
*/
const hold_button = document.getElementById("hold-button");
hold_button.onclick = () => {
  handleHoldButton(!hold_state);
  bc.postMessage(new Message("dialer", "hold_state", hold_state));
};

function handleHoldButton(bool) {
  if (hold_state != bool) {
    hold_button.classList.toggle("active-button");
  }
  hold_state = bool;
}
