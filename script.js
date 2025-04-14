let isLoginMode = true;
let selectedAgent = "casual";  // Default agent

function toggleAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById("auth-title").innerText = isLoginMode ? "Login" : "Signup";
    document.querySelector("button").innerText = isLoginMode ? "Login" : "Signup";
    document.getElementById("toggle-text").innerText = isLoginMode ? "Signup" : "Login";
}

function handleAuth() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    fetch(`https://ai-chatbot-backend-rwco.onrender.com/${isLoginMode ? 'login' : 'signup'}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("auth-section").classList.add("hidden");
            document.getElementById("agent-section").classList.remove("hidden");
        } else {
            alert(data.message || "Something went wrong!");
        }
    })
    .catch(() => alert("⚠️ Network error! Check server."));
}

// Called when an agent is selected
function selectAgent(agent) {
    selectedAgent = agent;
    document.getElementById("agent-section").classList.add("hidden");
    document.getElementById("chat-section").classList.remove("hidden");
    document.getElementById("current-agent").innerText = `🧠 Chatting with: ${agent.toUpperCase()} AI`;
}

function generateContent() {
    const prompt = document.getElementById("prompt").value.trim();
    const chatBox = document.getElementById("chat-box");
    const sendBtn = document.getElementById("send-btn");

    if (!prompt) return;

    sendBtn.innerHTML = "<span>🌀</span>";
    sendBtn.classList.add("loading");
    sendBtn.disabled = true;

    const userMessage = document.createElement("div");
    userMessage.className = "message user bubble";
    userMessage.innerHTML = `<span>${prompt}</span>`;
    chatBox.appendChild(userMessage);

    const botMessage = document.createElement("div");
    botMessage.className = "message bot bubble neon-glow";
    botMessage.innerHTML = `<span class="typing"><span>.</span><span>.</span><span>.</span></span>`;
    chatBox.appendChild(botMessage);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });

    const isImagePrompt = /image|photo|picture|generate.*image/i.test(prompt);

    const endpoint = isImagePrompt ? "generate-image" : "chat";
    const body = isImagePrompt ? { prompt } : { user_message: prompt, agent: selectedAgent };

    fetch(`https://ai-chatbot-backend-rwco.onrender.com/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (isImagePrompt) {
            if (data.image_base64 || data.image_url) {
                botMessage.innerHTML = `<span>🖼️ Image Generated:</span><br>
                    <img src="${data.image_base64 ? 'data:image/png;base64,' + data.image_base64 : data.image_url}" 
                    class="generated-img" style="margin-top: 10px; max-width: 100%; border-radius: 10px;">`;
            } else {
                botMessage.innerHTML = `<span class="error">❌ No image generated.</span>`;
            }
        } else {
            const generatedText = data.bot_response || "🤖 No response received!";
            botMessage.innerHTML = "";
            let index = 0;

            function type() {
                if (index < generatedText.length) {
                    botMessage.innerHTML += generatedText[index++];
                    setTimeout(type, 25);
                } else {
                    sendBtn.innerHTML = "➤";
                    sendBtn.classList.remove("loading");
                    sendBtn.disabled = false;
                }
            }
            setTimeout(type, 800);
        }

        sendBtn.innerHTML = "➤";
        sendBtn.classList.remove("loading");
        sendBtn.disabled = false;
    })
    .catch(() => {
        botMessage.innerHTML = `<span class="error">❌ API failed!</span>`;
        sendBtn.innerHTML = "➤";
        sendBtn.classList.remove("loading");
        sendBtn.disabled = false;
    });

    document.getElementById("prompt").value = "";
}

document.getElementById("prompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        generateContent();
    }
});
