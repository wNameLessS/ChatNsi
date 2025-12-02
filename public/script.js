const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const codeBtn = document.getElementById("codeBtn");
const ipList = document.getElementById("ip-list");

let isCodeMode = false;

// Toggle mode code
codeBtn.addEventListener("click", () => {
  isCodeMode = !isCodeMode;
  codeBtn.style.background = isCodeMode ? "#ff9f1a" : "#5865f2";
});

// Formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text && fileInput.files.length === 0) return;

  // Texte ou code
  if (isCodeMode && text) {
    socket.emit("chatCode", text);
  } else if (text) {
    socket.emit("chatMessage", text);
  }

  input.value = "";

  // Upload image
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    socket.emit("chatImage", data.url);
    fileInput.value = "";
  }
});

// Affichage des messages
socket.on("chatMessage", (msg) => {
  const li = document.createElement("li");

  if (msg.type === "text") {
    li.textContent = msg.data;
  } else if (msg.type === "image") {
    const img = document.createElement("img");
    img.src = msg.data;
    img.style.maxWidth = "300px";
    img.style.borderRadius = "6px";
    li.appendChild(img);
  } else if (msg.type === "code") {
    const pre = document.createElement("pre");
    pre.textContent = msg.data;
    pre.style.background = "#2d2d2d";
    pre.style.padding = "10px";
    pre.style.borderRadius = "6px";
    pre.style.overflowX = "auto";
    li.appendChild(pre);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Affichage des IP connectées
socket.on("updateIPs", (ips) => {
  ipList.innerHTML = "";
  ips.forEach(ip => {
    const li = document.createElement("li");
    li.textContent = ip;
    ipList.appendChild(li);
  });
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !isCodeMode) {
    e.preventDefault(); // Empêche le saut de ligne
    form.dispatchEvent(new Event("submit")); // Soumet le formulaire
  }
});