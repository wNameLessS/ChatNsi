const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Dossier temporaire pour les images
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Servir les fichiers statiques
app.use("/uploads", express.static(uploadDir));
app.use(express.static("public"));

// Route upload image
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("Pas de fichier");
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Tableau des IP connectées
const connectedIPs = new Set();

// Socket.io
io.on("connection", (socket) => {
  const ip = socket.handshake.address || "IP inconnue";
  connectedIPs.add(ip);
  io.emit("updateIPs", Array.from(connectedIPs));

  console.log(`Nouvelle connexion : ${ip}`);

  // Messages
  socket.on("chatMessage", (msg) => io.emit("chatMessage", { type: "text", data: msg }));
  socket.on("chatImage", (imgUrl) => io.emit("chatMessage", { type: "image", data: imgUrl }));
  socket.on("chatCode", (code) => io.emit("chatMessage", { type: "code", data: code }));

  socket.on("disconnect", () => {
    connectedIPs.delete(ip);
    io.emit("updateIPs", Array.from(connectedIPs));
    console.log(`Déconnexion : ${ip}`);
  });
});

// Reset du dossier uploads toutes les 30 secondes
setInterval(() => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return;
    for (const file of files) {
      fs.unlink(path.join(uploadDir, file), () => {});
    }
    console.log("Dossier uploads vidé");
  });
}, 30000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Serveur en ligne sur port " + PORT));
