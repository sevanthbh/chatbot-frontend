let isLoginMode = true;

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
            document.getElementById("chat-section").classList.remove("hidden");
        } else {
            alert(data.message || "Something went wrong!");
        }
    })
    .catch(err => {
        alert("⚠️ Network error! Check server.");
    });
}

function generateContent() { 
    let prompt = document.getElementById("prompt").value.trim();
    let chatBox = document.getElementById("chat-box");
    let sendBtn = document.getElementById("send-btn");

    if (!prompt) return;

    sendBtn.innerHTML = "<span>🌀</span>";  
    sendBtn.classList.add("loading");  
    sendBtn.disabled = true;

    let userMessage = document.createElement("div");
    userMessage.className = "message user bubble";
    userMessage.innerHTML = `<span>${prompt}</span>`;
    chatBox.appendChild(userMessage);

    let botMessage = document.createElement("div");
    botMessage.className = "message bot bubble neon-glow";
    botMessage.innerHTML = `<span class="typing"><span>.</span><span>.</span><span>.</span></span>`;
    chatBox.appendChild(botMessage);

    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });

    fetch("https://ai-chatbot-backend-rwco.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: prompt })  
    })
    .then(response => response.json())
    .then(data => {
        let generatedText = data.bot_response || "🤖 No response received!";
        botMessage.innerHTML = "";  

        let index = 0;
        function type() {
            if (index < generatedText.length) {
                botMessage.innerHTML += generatedText[index];
                index++;
                setTimeout(type, 25);
            } else {
                sendBtn.innerHTML = "➤";  
                sendBtn.classList.remove("loading");  
                sendBtn.disabled = false;
            }
        }
        setTimeout(type, 800);
    })
    .catch(error => {
        botMessage.innerHTML = `<span class="error">❌ Network error! Check API.</span>`;
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

