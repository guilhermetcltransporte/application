import { Connection } from "tedious";

const config = {
  server: "191.252.205.101",
  authentication: {
    type: "default",
    options: {
      userName: "admin",
      password: "rped94ft",
    }
  },
  options: {
    database: "app",
    encrypt: true,
    trustServerCertificate: true
  }
};

const connection = new Connection(config);

console.log('@'.repeat(10))

connection.on("connect", err => {
  if (err) {
    console.error("Erro na conexão tedious:", err);
  } else {
    console.log("Conectado com sucesso via tedious!");
  }
  connection.close();
});
