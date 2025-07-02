require("dotenv").config();
const { EventHubConsumerClient } = require("@azure/event-hubs");
const WebSocket = require("ws");

const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;
const consumerGroup = "$Default"; 

// servidor WebSocket puerto 8080
const wss = new WebSocket.Server({ port: 8080 });
const clients = [];

wss.on("connection", (ws) => {
  console.log("  Cliente conectado al WebSocket");
  clients.push(ws);
});

function broadcast(data) {
  const json = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(json);
    }
  });
}

async function main() {
  const client = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);

  console.log(" Esperando mensajes...\n");

  const subscription = client.subscribe({
    processEvents: async (events, context) => {
      for (const event of events) {
        const data = event.body;
        console.log(" Mensaje recibido:");
        console.log(JSON.stringify(data, null, 2));
         

        broadcast(data);  
      }
    },
    processError: async (err, context) => {
      console.error(" Error al recibir eventos: ", err);
    }
  });
}

main().catch((err) => {
  console.error(" Error: ", err);
});
