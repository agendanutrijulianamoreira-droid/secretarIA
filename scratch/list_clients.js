import { Clientes } from "./src/lib/db";

async function run() {
  try {
    const clients = await Clientes.list();
    console.log("CLIENT_LIST_START");
    console.log(JSON.stringify(clients, null, 2));
    console.log("CLIENT_LIST_END");
  } catch (err) {
    console.error(err);
  }
}

run();
