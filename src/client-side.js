// Client Side JavaScript

const socket = new WebSocket("ws://localhost:8081");

socket.onopen = (event) => {
  console.log("WebSocket is connected!");

  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.request === "refresh") {
      location.reload();
    }

  };

  socket.onerror = (event) => console.error("Web Socket Error: " + event);
  socket.onclose = (event) => console.log("Disconnected from WebSocket server");
};
