// Client Side JavaScript
const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

socket.onopen = (event) => {
  console.log("WebSocket is connected");

  socket.onmessage = (msg) => {
    let data = JSON.parse(msg.data);
    console.log(data);
    if (data.team_1_name) {
      let team_1_name = document.getElementById("team_1_score_span");
      if (team_1_name) {
        team_1_name.innerText = data.team_1_name;
      }
    }

  };

  socket.onerror = (event) => console.log("Web Socket Error: " + event);
  socket.onclose = (event) => console.log("Disconnected from WebSocket server");
};

function updateScore() {
  // Collect all relevant data from the page and send out a WebSocket message to
  // update the score we are keeping track of.

  let dataObj = {
    team_1_name: document.getElementById("team_1_name")?.value ?? null,
  };

  socket.send(JSON.stringify(dataObj));
}
