const root_container = document.querySelector(".root-container");

/*
  WINDOW RESTRICTIONS & DEVELOPER MODE
*/
const extraWidth = window.outerWidth - window.innerWidth;
const extraHeight = window.outerHeight - window.innerHeight;
let isResized = null;
const windowResizeHandler = () => {
  clearTimeout(isResized);
  isResized = setTimeout(() => {
    window.resizeTo(400 + extraWidth, 600 + extraHeight);
  }, 500);
};

const windowUnloadHandler = (event) => {
  event.preventDefault();
  return (event.returnValue = "");
};

const windowContextHandler = (event) => {
  event.preventDefault();
  return false;
};

if (!document.getElementById("switch").checked) {
  window.addEventListener("resize", windowResizeHandler);
  window.addEventListener("beforeunload", windowUnloadHandler);
  window.addEventListener("contextmenu", windowContextHandler);
}

document.getElementById("switch").addEventListener("change", function () {
  if (this.checked) {
    window.removeEventListener("resize", windowResizeHandler);
    window.removeEventListener("beforeunload", windowUnloadHandler);
    window.removeEventListener("contextmenu", windowContextHandler);
  } else {
    window.addEventListener("resize", windowResizeHandler);
    window.addEventListener("beforeunload", windowUnloadHandler);
    window.addEventListener("contextmenu", windowContextHandler);
  }
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
function insertCursor(event) {
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
const call_container = document.querySelector(".call");
const phone_button = document.getElementById("phone-button");
let dialed_phone_number = null;
let dialed_phone_numbers = new Set();

phone_button.onclick = () => {
  if (dialed_phone_number) {
    call_container.classList.remove("call-connected");
    call_container.classList.add("call-disconnected");
    console.log("Hung-up: ", dialed_phone_number);
    dialed_phone_number = null;
    flipDialpad(false);
    toggleTimer(false);
  } else if (dialed_digits.length === 11) {
    dialed_phone_number = "";
    dialed_digits.forEach((each) => {
      if (each.key != "|") dialed_phone_number += each.key;
    });
    if (!dialed_phone_numbers.has(dialed_phone_number))
      addToHistory(dialed_phone_number);

    dialed_phone_number = country_code.textContent + dialed_phone_number;
    call_container.classList.remove("call-disconnected");
    call_container.classList.add("call-connected");
    console.log("Dialing: ", dialed_phone_number);
    flipDialpad(true);
    toggleTimer(true);
  }
};

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
      s += 1;
      if (s >= 60) [m, s] = [m + 1, s - 60];
      if (m >= 60) [h, m] = [h + 1, m - 60];

      second.innerHTML = s < 10 ? "0" + s : s;
      minute.innerHTML = m < 10 ? "0" + m : m;
      hour.innerHTML = h < 10 ? "0" + h : h;
    }, 999);
  } else {
    clearInterval(call_timer);
    [hour.innerHTML, minute.innerHTML, second.innerHTML] = ["-", "-", "-"];
    console.log(`Call duration: ${h}:${m}:${s}`);
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
  document.getElementById("country-code").innerHTML = event.target.value;
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
  mute_button.classList.toggle("active-button");
};

/*
  HOLD BUTTON
*/
const hold_button = document.getElementById("hold-button");
hold_button.onclick = () => {
  hold_button.classList.toggle("active-button");
};
