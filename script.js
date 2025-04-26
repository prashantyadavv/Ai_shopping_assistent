const GEMINI_API_KEY = "AIzaSyBlH08SpIF3tOghE3BonkC594mNPqzxfVo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function testGemini() {
    const prompt = "Say hello!";
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        console.log(data);
        alert(JSON.stringify(data));
    } catch (e) {
        alert("Error: " + e.message);
    }
}
testGemini();

document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#user-input");
    const sendBtn = document.querySelector("#send-btn");
    const chatContainer = document.querySelector("#chat-container");

    sendBtn.addEventListener("click", () => {
        const message = input.value.trim();
        if (message !== "") {
            addUserMessage(message);
            input.value = "";
            showTyping();
            getGeminiResponse(message);
        }
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });

    function addUserMessage(message) {
        const userBox = document.createElement("div");
        userBox.className = "user-chat-box";
        userBox.innerHTML = `
            <div class="avatar">👤</div>
            <div class="chat-content">
                <div class="user-chat-content">${message}</div>
                <div class="chat-meta">You • ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        chatContainer.appendChild(userBox);
        scrollChatToBottom();
    }

    function addAiMessage(message) {
        removeTyping();

        const aiBox = document.createElement("div");
        aiBox.className = "ai-chat-box";

        const lines = message.split(/\n|•|- /).filter(line => line.trim() !== "");
        const chatContentDiv = document.createElement("div");
        chatContentDiv.className = "ai-chat-content";

        if (lines.length > 1) {
            const ul = document.createElement("ul");
            ul.style.paddingLeft = "20px";
            lines.forEach(line => {
                const li = document.createElement("li");
                li.textContent = line.trim();
                ul.appendChild(li);
            });
            chatContentDiv.appendChild(ul);
        } else {
            chatContentDiv.textContent = message;
        }

        aiBox.innerHTML = `
            <div class="avatar">🛒</div>
            <div class="chat-content"></div>
            <div class="chat-meta">ShopBot • ${new Date().toLocaleTimeString()}</div>
        `;

        aiBox.querySelector(".chat-content").prepend(chatContentDiv);
        chatContainer.appendChild(aiBox);
        scrollChatToBottom();
    }

    function showTyping() {
        const typingBox = document.createElement("div");
        typingBox.id = "typing-indicator";
        typingBox.className = "ai-chat-box";
        typingBox.innerHTML = `
            <div class="avatar">🛒</div>
            <div class="chat-content">
                <div class="ai-chat-content">ShopBot is thinking...</div>
            </div>
        `;
        chatContainer.appendChild(typingBox);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeTyping() {
        const typing = document.querySelector("#typing-indicator");
        if (typing) typing.remove();
    }

    async function getGeminiResponse(userMessage) {
        const prompt = `
You are ShopBot, an expert AI shopping assistant with deep knowledge of products, prices, and shopping trends.

Your job is to help users with:
- Product recommendations
- Price comparisons
- Finding deals and discounts
- Making informed purchase decisions
- Understanding product features and specifications
- Shopping trends and popular items

Be friendly, helpful, and respond with clear, actionable advice.

Important:
• Keep answers brief and focused (3-5 key points)
• Include specific product suggestions when relevant
• Mention price ranges when discussing products
• Highlight important features or specifications
• Suggest alternatives in different price ranges
• Always encourage comparing prices and reading reviews

User question: "${userMessage}"
`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log("API Success Response:", data);

            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (aiText && aiText.trim().length > 0) {
                addAiMessage(aiText.trim());
            } else {
                throw new Error('No valid response from API');
            }
        } catch (error) {
            console.error("Error in API call:", error);
            addAiMessage(`I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment. Error: ${error.message}`);
        }
    }

    // Initialize quick question buttons
    document.querySelectorAll('.quick-question').forEach(button => {
        button.addEventListener('click', () => {
            input.value = button.textContent;
            sendBtn.click();
        });
    });

    // Tab switching logic
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
            // Show the selected tab
            if (this.id === 'chatBtn') document.getElementById('chatTab').style.display = 'block';
            if (this.id === 'productsBtn') document.getElementById('productsTab').style.display = 'block';
            if (this.id === 'dealsBtn') document.getElementById('dealsTab').style.display = 'block';
            if (this.id === 'compareBtn') document.getElementById('compareTab').style.display = 'block';
            if (this.id === 'trendsBtn') document.getElementById('trendsTab').style.display = 'block';
        });
    });

    // Dummy product search using DummyJSON API (no CORS issues, no key needed)
    async function searchDummyProducts(query) {
        const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.products || [];
        } catch (err) {
            document.getElementById('product-results').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
            return [];
        }
    }

    function renderProducts(products) {
        const resultsDiv = document.getElementById('product-results');
        resultsDiv.innerHTML = '';
        if (!products.length) {
            resultsDiv.innerHTML = '<p>No products found.</p>';
            return;
        }
        products.slice(0, 8).forEach(product => {
            const card = document.createElement('div');
            card.className = "product-card";
            card.innerHTML = `
                <img src="${product.thumbnail}" alt="${product.title}">
                <h4>${product.title}</h4>
                <p>$${product.price}</p>
                <a href="#" tabindex="-1">View Product</a>
            `;
            resultsDiv.appendChild(card);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('product-search-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = document.getElementById('product-search-input').value.trim();
                if (!query) return;
                const resultsDiv = document.getElementById('product-results');
                resultsDiv.innerHTML = '<p>Loading...</p>';
                const products = await searchDummyProducts(query);
                renderProducts(products);
            });
        }
    });

    function scrollChatToBottom() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
});


















//     const GEMINI_API_KEY = "AIzaSyBrsARPRQvujcEl9wC6fbVpMAy9V1Okjrc";
// document.addEventListener("DOMContentLoaded", () => {
//     const input = document.querySelector("#user-input");
//     const sendBtn = document.querySelector("#send-btn");
//     const chatContainer = document.querySelector("#chat-container");


//     const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

//     sendBtn.addEventListener("click", () => {
//         const message = input.value.trim();
//         if (message !== "") {
//             addUserMessage(message);
//             input.value = "";
//             showTyping();
//             getGeminiResponse(message);
//         }
//     });

//     input.addEventListener("keypress", (e) => {
//         if (e.key === "Enter") {
//             sendBtn.click();
//         }
//     });

//     function addUserMessage(message) {
//         const userBox = document.createElement("div");
//         userBox.className = "user-chat-box";
//         userBox.innerHTML = `
//             <div class="avatar">👤</div>
//             <div class="chat-content">
//                 <div class="user-chat-content">${message}</div>
//                 <div class="chat-meta">You • ${new Date().toLocaleTimeString()}</div>
//             </div>
//         `;
//         chatContainer.appendChild(userBox);
//         chatContainer.scrollTop = chatContainer.scrollHeight;
//     }

//     // function addAiMessage(message) {
//     //     removeTyping();
//     //     const aiBox = document.createElement("div");
//     //     aiBox.className = "ai-chat-box";
//     //     aiBox.innerHTML = `
//     //         <div class="avatar">🪴</div>
//     //         <div class="chat-content">
//     //             <div class="ai-chat-content">${message}</div>
//     //             <div class="chat-meta">HomeBot • ${new Date().toLocaleTimeString()}</div>
//     //         </div>
//     //     `;
//     //     chatContainer.appendChild(aiBox);
//     //     chatContainer.scrollTop = chatContainer.scrollHeight;
//     // }
//     function addAiMessage(message) {
//         removeTyping();
//         const aiBox = document.createElement("div");
//         aiBox.className = "ai-chat-box";
    
//         // Convert message to bullet list if it contains bullet-like structure
//         const lines = message.split(/\n|•|- /).filter(line => line.trim() !== "");
//         const chatContentDiv = document.createElement("div");
//         chatContentDiv.className = "ai-chat-content";
    
//         // Check if it's a bullet-like response
//         if (lines.length > 1) {
//             const ul = document.createElement("ul");
//             ul.style.paddingLeft = "20px"; // Indent bullets a bit
//             lines.forEach(line => {
//                 const li = document.createElement("li");
//                 li.textContent = line.trim();
//                 ul.appendChild(li);
//             });
//             chatContentDiv.appendChild(ul);
//         } else {
//             // Just one-line message, print normally
//             chatContentDiv.textContent = message;
//         }
    
//         aiBox.innerHTML = `
//             <div class="avatar">🪴</div>
//             <div class="chat-content"></div>
//             <div class="chat-meta">HomeBot • ${new Date().toLocaleTimeString()}</div>
//         `;
    
//         // Insert the chat content (with bullet points) inside the chat-content div
//         aiBox.querySelector(".chat-content").prepend(chatContentDiv);
//         chatContainer.appendChild(aiBox);
//         chatContainer.scrollTop = chatContainer.scrollHeight;
//     }
    

//     function showTyping() {
//         const typingBox = document.createElement("div");
//         typingBox.id = "typing-indicator";
//         typingBox.className = "ai-chat-box";
//         typingBox.innerHTML = `
//             <div class="avatar">🪴</div>
//             <div class="chat-content">
//                 <div class="ai-chat-content">HomeBot is thinking...</div>
//             </div>
//         `;
//         chatContainer.appendChild(typingBox);
//         chatContainer.scrollTop = chatContainer.scrollHeight;
//     }

//     function removeTyping() {
//         const typing = document.querySelector("#typing-indicator");
//         if (typing) typing.remove();
//     }
 
//     async function getGeminiResponse(userMessage) {
//         const prompt = `
//     You are HomeBot, an expert in home decoration, interior design, furniture placement, color schemes, lighting, and maximizing small spaces.
    
//     Your job is to respond only to queries related to home decor and interior design.
    
//     Be friendly, helpful, and respond with short, clear, and precise tips.
    
//     Important:
//     • Keep answers brief and to the point (3 to 5 bullet points).
//     • Do not repeat or over-explain.
//     • Use bullet points like:
//        • First tip
//        • Second tip
//        • Third tip
    
//     If the user's question is not about home decor, reply:  
//     "Sorry, I can only help with home decoration topics. 😊"
    
//     User question: "${userMessage}"
    
//     Your response:
//     `;
    

//     try {
//         const response = await fetch(GEMINI_API_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }]
//             })
//         });

//         const data = await response.json();
//         const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (aiText && aiText.trim().length > 0) {
//             addAiMessage(aiText.trim());
//         } else {
//             addAiMessage("Sorry, I didn't catch that. Could you try asking your home decor question differently? 😊");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         addAiMessage("Oops! Something went wrong while contacting HomeBot. Please try again.");
//     }
// }
// });
