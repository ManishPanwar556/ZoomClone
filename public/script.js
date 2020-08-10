const videoGrid = document.getElementById("video-grid");
const socket = io();
const myVideo = document.createElement("video");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      console.log("uid", userId);
      connectToNewUser(userId, stream);
    });
  });
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  //  add video strem to video tag
}
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.appendChild(video);
};
let text = $("input");
$("html").keydown((e) => {
  if (e.which === 13 && text.val().length !== 0) {
    socket.emit("chatmessage", text.val());
    text.val("");
  }
});
socket.on("servermessage", (message) => {
  $(".messages").append(
    `<li class="message" style="margin-bottom:10px;"><b>user</b><br/> ${message}</li>`
  );
});
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
const leaveMeeting = () => {
  const videoele = document.getElementById("video-grid");
  videoele.remove(videoele.firstChild);
  socket.emit("chatmessage", "User Left the Room");
  socket.disconnect();
};
