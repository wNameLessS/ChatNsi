const socket = io();

// Sélecteurs DOM
const messagesContainer = document.getElementById("messages");
const ipPanel = document.getElementById("ipPanel");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// 🔹 Réception des messages
socket.on("chatMessage", (data) => {
    const div = document.createElement("div");
    div.classList.add("message");

    div.innerHTML = `
        <span class="username">${data.ip}</span>
        <span class="text">${data.msg}</span>
    `;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// 🔹 Mise à jour du panneau IP
socket.on("ipListUpdate", (ipList) => {
    ipPanel.innerHTML = "";
    ipList.forEach((ip) => {
        const div = document.createElement("div");
        div.textContent = ip;
        ipPanel.appendChild(div);
    });
});

// 🔹 Envoi message bouton
sendBtn.addEventListener("click", sendMessage);

// 🔹 Envoi message touche ENTRÉE
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const msg = messageInput.value.trim();
    if (msg === "") return;

    socket.emit("chatMessage", msg);
    messageInput.value = "";
}
