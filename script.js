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

    // Check if prompt is asking for image
    const isImagePrompt = /image|photo|picture|generate.*image/i.test(prompt);

    if (isImagePrompt) {
        fetch("https://ai-chatbot-backend-rwco.onrender.com/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        })
        .then(res => res.json())
        .then(data => {
            if (data.image_base64) {
                botMessage.innerHTML = `<span>🖼️ Image Generated:</span><br><img src="data:image/png;base64,${data.image_base64}" class="generated-img" style="margin-top: 10px; max-width: 100%; border-radius: 10px;">`;
            } else if (data.image_url) {
                // Fallback to using image URL if available
                botMessage.innerHTML = `<span>🖼️ Image Generated:</span><br><img src="${data.image_url}" class="generated-img" style="margin-top: 10px; max-width: 100%; border-radius: 10px;">`;
            } else {
                botMessage.innerHTML = `<span class="error">❌ No image generated.</span>`;
            }

            sendBtn.innerHTML = "➤";  
            sendBtn.classList.remove("loading");  
            sendBtn.disabled = false;
        })
        .catch(error => {
            botMessage.innerHTML = `<span class="error">❌ Image API failed!</span>`;
            sendBtn.innerHTML = "➤";  
            sendBtn.classList.remove("loading");  
            sendBtn.disabled = false;
        });
    } else {
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
            botMessage.innerHTML = `<span class="error">❌ Text API failed!</span>`;
            sendBtn.innerHTML = "➤";  
            sendBtn.classList.remove("loading");  
            sendBtn.disabled = false;
        });
    }

    document.getElementById("prompt").value = "";
}  

document.getElementById("prompt").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();  
        generateContent();  
    }
});

