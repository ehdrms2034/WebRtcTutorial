"use strict";

let dataChannelSend = document.getElementById("dataChannelSend");
let dataChannelReceive = document.getElementById("dataChannelReceive");
let sendBtn = document.getElementById("send");
let pcConstraint;
let dataConstraint;
let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

sendBtn.onclick = sendData;

createConnection();

function createConnection() {
  let servers = null;
  pcConstraint = null;
  dataConstraint = null;

  window.localConnection = localConnection = new RTCPeerConnection(
    servers,
    pcConstraint
  );

  sendChannel = localConnection.createDataChannel(
    "sendDataChannel",
    dataConstraint
  );

  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  window.remoteConnection = remoteConnection
  = new RTCPeerConnection(servers,pcConstraint);

  remoteConnection.onicecandidate = iceCallback2;
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer().then(
      gotDescription1,
      onCreateSessionDescriptionError
  );
}

function iceCallback1(event) {
    console.log('local ice callback')
  if (event.candidate) {
    remoteConnection
      .addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    localConnection
      .addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);
  }
}

function onAddIceCandidateSuccess() {
  console.log("AddIce Success");
}

function onAddIceCandidateError(error) {
  console.error("AddIce error" + error.toString());
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
//   /trace("Send channel state is: " + readyState);
  if (readyState === "open") {
      console.log('opened');
  } else {
    console.log('closed');
}
}

function receiveChannelCallback(event){
    receiveChannel = event.channel;
    receiveChannel.onmessage = onReceiveMessageCallback;
}

function onReceiveMessageCallback(event){
    dataChannelReceive.value = event.data;
}

function gotDescription1(desc){
    console.log(desc);
    localConnection.setLocalDescription(desc);
    remoteConnection.setRemoteDescription(desc);
    remoteConnection.createAnswer().then(
        gotDescription2,
        onCreateSessionDescriptionError
    );
}

function gotDescription2(desc){
    remoteConnection.setLocalDescription(desc);
    localConnection.setRemoteDescription(desc);
}

function sendData(){
    let data = dataChannelSend.value;
    console.log('btn Data : ',data);
    sendChannel.send(data);
}


function onCreateSessionDescriptionError(error) {
    console.error('Failed to create session description: ' + error.toString());
  }