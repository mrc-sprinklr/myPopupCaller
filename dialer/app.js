// window.onbeforeunload = (event) => {
//   event.preventDefault();
//   return "";
// };

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
const dialed_digits = [cursor_object];
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

phone_button.onclick = () => {
  if (dialed_phone_number) {
    call_container.classList.remove("call-connected");
    call_container.classList.add("call-disconnected");
    console.log("Hung-up: ", dialed_phone_number);
    dialed_phone_number = null;
  } else if (dialed_digits.length === 11) {
    dialed_phone_number = country_code.textContent;
    dialed_digits.forEach((each) => {
      if (each.key != "|") dialed_phone_number += each.key;
    });
    call_container.classList.remove("call-disconnected");
    call_container.classList.add("call-connected");
    console.log("Dialing: ", dialed_phone_number);
  }
};

/*
  LISTENING TO KEYPRESSES (DIGITS, BACKSPACE, ARROWS)
*/
const country_code = document.getElementById("country-code");

window.addEventListener("keydown", (event) => {
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
