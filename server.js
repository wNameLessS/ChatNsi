import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

// Fonction pour extraire l'IP publique
function getClientIp(socket) {
    const forwarded = socket.handshake.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return socket.handshake.address.replace(/^::ffff:/, "");
}

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    const ip = getClientIp(socket);
    console.log(`➡️ Nouveau client connecté : ${ip}`);

    io.emit("ipListUpdate", getAllIps());

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", { ip, msg });
    });

    socket.on("disconnect", () => {
        console.log(`❌ Client déconnecté : ${ip}`);
        io.emit("ipListUpdate", getAllIps());
    });
});

function getAllIps() {
    return Array.from(io.sockets.sockets.values()).map((s) =>
        getClientIp(s)
    );
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log("🚀 Serveur lancé sur le port", PORT));
