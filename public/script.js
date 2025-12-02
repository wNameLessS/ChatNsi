const socket = io();

// === DOM Elements ===
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const codeBtn = document.getElementById("codeBtn");
const ipList = document.getElementById("ip-list");

// === Variables ===
let isCodeMode = false;

// === Toggle Mode Code ===
codeBtn.addEventListener("click", () => {
  isCodeMode = !isCodeMode;
  codeBtn.style.background = isCodeMode ? "#ff9f1a" : "#5865f2";
});

// === Envoi avec Enter si pas mode code ===
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isCodeMode) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});

// === Form submit ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text && fileInput.files.length === 0) return;

  // === Envoi texte ou code ===
  if (isCodeMode && text) {
    socket.emit("chatCode", text);
  } else if (text) {
    socket.emit("chatMessage", text);
  }

  input.value = "";

  // === Upload image ===
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      const data = await res.json();
      socket.emit("chatImage", data.url);
      fileInput.value = "";
    } catch (err) {
      console.error("Erreur upload image :", err);
    }
  }
});

// === Affichage messages ===
socket.on("chatMessage", (msg) => {
  const li = document.createElement("li");

  // Afficher l’IP / pseudo au-dessus du message
  const userDiv = document.createElement("div");
  userDiv.textContent = msg.username;
  userDiv.style.fontSize = "10px";
  userDiv.style.color = "#aaa";
  li.appendChild(userDiv);

  // Contenu du message
  if (msg.type === "text") {
    li.appendChild(document.createTextNode(msg.data));
  } else if (msg.type === "code") {
    const pre = document.createElement("pre");
    pre.textContent = msg.data;
    pre.style.background = "#2d2d2d";
    pre.style.padding = "10px";
    pre.style.borderRadius = "6px";
    pre.style.overflowX = "auto";
    li.appendChild(pre);
  } else if (msg.type === "image") {
    const img = document.createElement("img");
    img.src = msg.data;
    img.style.maxWidth = "300px";
    img.style.borderRadius = "6px";
    li.appendChild(img);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// === Affichage des IP connectées ===
socket.on("updateIPs", (ips) => {
  ipList.innerHTML = "";
  ips.forEach(ip => {
    const li = document.createElement("li");
    li.textContent = ip;
    ipList.appendChild(li);
  });
});
