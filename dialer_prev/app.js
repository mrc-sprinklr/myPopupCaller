// window.onbeforeunload = (event) => {
//   event.preventDefault();
//   return "";
// };

/*
    BLINKING EFFECT OF CURSOR
*/
const cursor = document.getElementById("number-cursor");
const cursor_text = ["|", "&nbsp;"];
let cursor_index = 0;

setInterval(() => {
  cursor_index ^= 1;
  cursor.innerHTML = cursor_text[cursor_index];
}, 500);

/*
    LISTENING TO KEYPRESSES (DIGITS, BACKSPACE, ARROWS)
*/
const country_code = document.getElementById("country-code");
const num_left = document.getElementById("number-left");
const num_right = document.getElementById("number-right");
let number_length = num_left.textContent.length + num_right.textContent.length;

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    if (number_length < 10) {
      num_left.textContent += event.key;
      number_length++;
    }
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "Backspace"
  ) {
    let [left, right] = [num_left.textContent, num_right.textContent];

    if (event.key === "ArrowLeft") {
      if (left != "") {
        num_left.textContent = left.slice(0, -1);
        num_right.textContent = left[left.length - 1] + right;
      }
    } else if (event.key === "ArrowRight") {
      if (right != "") {
        num_left.textContent = left + right[0];
        num_right.textContent = right.slice(1);
      }
    } else if (event.key === "ArrowUp") {
      num_left.textContent = "";
      num_right.textContent = left + right;
    } else if (event.key === "ArrowDown") {
      num_left.textContent = left + right;
      num_right.textContent = "";
    } else if (event.key === "Backspace" && left != "") {
      num_left.textContent = left.slice(0, -1);
      number_length--;
    }
  }
});

/*
    LISTENING TO MOUSE CLICKS
*/
document.querySelectorAll(".digit").forEach((each) => {
  each.onclick = () => {
    if (number_length < 10) {
      num_left.textContent += each.textContent;
      number_length++;
    }
  };
});

/*
    LISTENING TO CALL BUTTON
*/
const call_container = document.querySelector(".call");
let dialed_phone_number = null;

document.getElementById("phone-button").onclick = () => {
  let phone_number = num_left.textContent + num_right.textContent;
  if (dialed_phone_number) {
    call_container.classList.remove("call-connected");
    call_container.classList.add("call-disconnected");
    console.log("Hung-up: ", dialed_phone_number);
    dialed_phone_number = null;
  } else if (phone_number.length === 10) {
    phone_number = country_code.textContent + phone_number;
    dialed_phone_number = phone_number;
    call_container.classList.remove("call-disconnected");
    call_container.classList.add("call-connected");
    console.log("Dialing: ", dialed_phone_number);
  }
};
