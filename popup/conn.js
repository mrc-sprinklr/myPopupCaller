// const JsSIP = require("JsSIP");
JsSIP.debug.enable("JsSIP:*"); // JsSIP added with cdn support

let [phone, call] = [null, null];

// ________________________________________________________________

let [sip, password, server_address, port] = [
  "1000",
  "1000_client",
  "18.212.171.223",
  "7443/ws",
];

const call_options = {
  eventHandlers: {
    progress: function (e) {
      console.log("call is in progress");
    },
    failed: function (e) {
      console.log("call failed with cause: " + e.data);
    },
    ended: function (e) {
      console.log("call ended with cause: " + e.data);
    },
    confirmed: function (e) {
      console.log("call confirmed");
    },
  },
  pcConfig: {
    rtcpMuxPolicy: "negotiate",
    hackStripTcp: true,
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    iceTransportPolicy: "all",
  },
  mediaConstraints: {
    audio: true,
    video: false,
  },
  rtcOfferConstraints: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  },
};

const configuration = {
  sockets: [
    new JsSIP.WebSocketInterface("wss://" + server_address + ":" + port),
  ],
  uri: "sip:" + sip + "@" + server_address,
  authorization_user: sip,
  password: password,
  registrar_server: "sip:" + server_address,
  no_answer_timeout: 20,
  session_timers: false,
  register: true,
  trace_sip: true,
  connection_recovery_max_interval: 30,
  connection_recovery_min_interval: 2,
};

// ________________________________________________________________

const connect = (callback) => {
  phone = new JsSIP.UA(configuration);
  phone.start();

  phone.on("connected", function (e) {
    console.log("connected");
  });

  phone.on("disconnected", function (e) {
    console.log("disconnected");
  });

  phone.on("newMessage", function (e) {
    e.data.message.accept();
    console.log(e);
  });

  callback();
};

// Debugging purpose :)
const redAlert = () => {
  document.querySelector("body").innerHTML = "";
  document.querySelector("body").style.backgroundColor = "darkred";
};

// ________________________________________________________________

function addStreams() {
  call.connection.addEventListener("addstream", function (event) {
    incomingCallAudio.pause();

    remoteAudio.srcObject = event.stream;

    localView.srcObject = call.connection.getLocalStreams()[0];
    remoteView.srcObject = call.connection.getRemoteStreams()[0];
  });
}

let incomingCallAudio = new window.Audio(
  "http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav"
);
incomingCallAudio.loop = true;

let remoteAudio = new window.Audio();
remoteAudio.autoplay = true;

const localView = document.getElementById("localMedia");
const remoteView = document.getElementById("remoteMedia");

// ________________________________________________________________

function callNumber(call_to) {
  call_to = "125311" + call_to;
  console.log("$$$ " + call_to);
  phone.call(call_to, call_options);
  addStreams();
}

function answer() {
  if (call) {
    call.answer(call_options);
  }
}

function terminate() {
  if (call) {
    call.terminate();
  }
  call = null;
}

// ________________________________________________________________

// phone.on("newRTCSession", function (event) {
//   call = event.session;
//   console.log("Direction: ", call.direction);

//   call.on("sdp", function (e) {
//     console.log("call sdp: ", e.sdp);
//   });
//   call.on("accepted", function (e) {
//     console.log("call accepted: ", e);
//   });
//   call.on("progress", function (e) {
//     console.log("call is in progress: ", e);
//   });
//   call.on("confirmed", function (e) {
//     console.log("confirmed by", e.originator);
//   });
//   call.on("ended", function (e) {
//     console.log("Call ended: ", e);
//     terminate();
//   });
//   call.on("failed", function (e) {
//     console.log("Call failed: ", e);
//     terminate();
//   });
//   call.on("peerconnection", function (e) {
//     console.log("call peerconnection: ", e);
//   });
// });
