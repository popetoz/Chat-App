const socket = io();

// html elements
const $chatForm = document.querySelector("#chat-form");
const $chatInput = $chatForm.querySelector("#msg");
const $chatSendBtn = $chatForm.querySelector("#send");
const $locationBtn = document.querySelector("#location");
const $messages = document.querySelector("#messages");
const $sideBar = document.querySelector("aside");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector("#sideBarTemplate").innerHTML;

// vars
let myId;

// getting my id info
socket.on("sendId", (id) => {
  myId = id;
  console.log(myId);
});

const autoscroll = () => {
  // get the new message
  const $newMsg = $messages.lastElementChild.previousElementSibling;

  // get the new message height
  const newMSgStyles = getComputedStyle($newMsg);
  const newMSgMargin = parseInt(newMSgStyles.marginTop);
  const newMsgHeight = $newMsg.offsetHeight + newMSgMargin;

  // get the visible height
  const visibleHeight = $messages.offsetHeight;

  // get the container of messages height
  const containerHeight = $messages.scrollHeight;

  // get the distance I scrolled
  const scrollOffset = visibleHeight + $messages.scrollTop;

  if (containerHeight - newMsgHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }

  console.log(`containerHeight = ${containerHeight}`);
  console.log(`newMsgHeight = ${newMsgHeight}`);
  console.log(
    `containerHeight - newMsgHeight = ${containerHeight - newMsgHeight}`
  );
  console.log(`scrollOffset = ${scrollOffset}`);
};

// function to play sounds
const playRecieveSound = () => {
  let audio = new Audio("../sounds/new_msg.mp3");
  audio.play();
};

const playSendSound = () => {
  let audio = new Audio("../sounds/send_sound.mp3");
  audio.play();
};

// event for printing user messages
socket.on("print", (msg, id) => {
  // for styling the message
  const msgClass = id === "admin" ? "admin" : id === myId ? "me" : "others";

  // run the appropriate sound
  switch (msgClass) {
    case "me":
      playSendSound();
      break;
    case "others":
      playRecieveSound();
      break;
    default:
      break;
  }

  const htmlOfMsg = Mustache.render(messageTemplate, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm A"),
    style: msgClass,
  });
  $messages.insertAdjacentHTML("beforeend", htmlOfMsg);
  console.log({
    myId,
    id,
  });

  autoscroll();
});

$chatForm.addEventListener("submit", (e) => {
  // not submit the form
  e.preventDefault();

  // get the value from the input
  let msg = $chatInput.value;

  if (!msg.trim()) {
    $chatInput.focus();
    return;
  }

  // disable the send button
  $chatSendBtn.setAttribute("disabled", "disabled");

  // clear the input value
  $chatInput.value = "";

  // emit an event to send message to all
  socket.emit("sendToAll", msg, (error) => {
    // enable the input
    $chatSendBtn.removeAttribute("disabled");

    // get focus on the input
    $chatInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message is delivered");
  });
});

// on clicking the send location btn
$locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Share location is not supported in your browser");
  }

  // disable the send location button
  $locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude: lat, longitude: long } = position.coords;
    socket.emit("shareLocation", lat, long, () => {
      console.log("The location is shared successfully");

      // re-enable the send location btn
      $locationBtn.removeAttribute("disabled");
    });
  });
});

// event for printing user shared location
socket.on("printLocation", (locationMsg, id) => {
  // for styling the message
  const msgClass = id === "admin" ? "admin" : id === myId ? "me" : "others";

  // run the appropriate sound
  switch (msgClass) {
    case "me":
      playSendSound();
      break;
    case "others":
      playRecieveSound();
      break;
    default:
      break;
  }

  const html = Mustache.render(locationTemplate, {
    username: locationMsg.username,
    url: locationMsg.url,
    createdAt: moment(locationMsg.createdAt).format("hh:mm A"),
    style: msgClass,
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//////////////////////////////////// query string //////////////////////////////
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// event when user join a room with username and room
socket.emit("join", { username, room }, (error) => {
  alert(error);
  return (location.href = "/");
});

// for add user on side bar
socket.on("updateUsersInRoom", ({ roomName, users }) => {
  const content = Mustache.render(sideBarTemplate, {
    roomName: room,
    users,
  });

  $sideBar.innerHTML = content;
});
