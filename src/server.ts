import { Server } from "http";
import { app } from "./app";

async function main() {
  const server: Server = new Server(app);
  server.listen(3000, () => {
    console.log("http://localhost:3000");
  });
}

main();
