let call, ua;
function answer() {
  if (call) {
    call.answer({
      extraHeaders: ["X-Foo: foo", "X-Bar: bar"],
      mediaConstraints: { audio: true, video: false },
      pcConfig: { rtcpMuxPolicy: "negotiate" },
      rtcOfferConstraints: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
      },
    });
  }
}
function decline() {
  if (call) {
    call.terminate();
  }
}
function decline() {
  if (call) {
    call.terminate();
  }
}

function connect(callback) {
  let [sip, password, server_address] = [SIP, PASSWORD, SERVER_ADDRESS];

  const configuration = {
    sockets: [new JsSIP.WebSocketInterface("wss://" + server_address + ":442")],
    uri: "sip:" + sip + "@" + server_address,
    authorization_user: sip,
    password: password,
    registrar_server: "sip:" + server_address,
    session_timers: false,
  };
  ua = new JsSIP.UA(configuration);
  ua.on("connected", function (e) {
    console.log("connected", e);
    callback(); // UI update
  });
  ua.on("newRTCSession", function (e) {
    console.log("newRTCSession", e);
    call = e.session;
    call.on("sdp", function (e) {
      console.log("call sdp:", e);
      let lbody = e.sdp.split("\n");
      let tempbody;
      for (let i = 0; i < lbody.length; i++) {
        if (!lbody[i].indexOf("a=crypto:1")) {
          continue;
        }
        if (!tempbody) {
          tempbody = lbody[i];
        } else {
          tempbody += "\n" + lbody[i];
        }
      }
      e.sdp = tempbody;
    });
    call.on("accepted", function (e) {
      console.log("call accepted", e);
    });
    call.on("progress", function (e) {
      console.log("call is in progress", e);
      answer();
    });
    call.on("confirmed", function (e) {
      console.log("call accepted/confirmed", e);
    });
    call.on("ended", function (e) {
      console.log("Call ended: ", e);
    });
    call.on("failed", function (e) {
      console.log("Call failed: ", e);
    });

    call.on("peerconnection", function (e) {
      console.log("call peerconnection: ", e);
      e.peerconnection.onaddstream = function (e) {
        console.log("call peerconnection addstream:", e);
        remoteView = document.getElementById("remoteView");
        let remoteStream = e.stream;
        remoteView.srcObject = remoteStream;
      };
    });
  });

  ua.start();
}
