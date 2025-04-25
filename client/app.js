const form = document.querySelector("form");
const chatfield = document.getElementById("chatfield");
const output = document.getElementById("askQuestion");

form.addEventListener("submit", askQuestion);

const storageKey = "AiChatHistoryRAG🤓";

const openMeteoUrl = "https://api.open-meteo.com/v1/forecast?latitude=51.92&longitude=4.48&current_weather=true";

const systemPromptTemplate = `You are Max Wild, a cheerful, enthusiastic, and knowledgeable zookeeper at Aetherius Opvangcentrum. Your primary goal is to share information about the animals and their habitats based on the center's guide. Speak enthusiastically. Share educational facts ONLY when asked directly about specific animals mentioned in the guide, their preferred conditions (like temperature), or general animal facts clearly related to zoo animals. Do NOT share these specific facts in response to casual conversation like greetings or small talk (e.g., 'hello', 'how are you?'). You can still respond warmly and in character for small talk. If asked about something unrelated to animals or the Aetherius guide, politely decline, explaining you specialize in the animals at the center. For context, the current temperature in Rotterdam is {temperature}.`;

let messages = [];

async function initializeMessages() {
    let currentTemperature = "data unavailable";
    try {
        const response = await fetch(openMeteoUrl);
        if (response.ok) {
            const weatherData = await response.json();
            if (weatherData?.current_weather?.temperature !== undefined) {
                const temp = weatherData.current_weather.temperature;
                const unit = weatherData.current_weather_units?.temperature || "°C";
                currentTemperature = `${temp}${unit}`;
            }
        }
    } catch (error) {
        console.log(error);
    }

    const finalSystemPrompt = systemPromptTemplate.replace("{temperature}", currentTemperature);

    const storedMessages = JSON.parse(localStorage.getItem(storageKey));

    if (storedMessages && Array.isArray(storedMessages) && storedMessages.length > 0) {
        messages = [
            ["system", finalSystemPrompt],
            ...storedMessages.slice(1)
        ];
    } else {
        messages = [
            ["system", finalSystemPrompt]
        ];
    }
    console.log("Chat initialized. System prompt:", messages[0][1]);
}


async function askQuestion(e) {
    e.preventDefault();

    const prompt = chatfield.value.trim();
    if (!prompt) return;

    messages.push(["human", prompt]);
    chatfield.value = "";
    chatfield.disabled = true;
    output.textContent = "Thinking...";

    const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
    };

    try {
        const response = await fetch("http://localhost:3000/", options);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiReply = "";
        output.textContent = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            const chunkText = decoder.decode(value, { stream: true });
            aiReply += chunkText;
            output.textContent += chunkText;
        }

        if (aiReply) {
            messages.push(["assistant", aiReply]);
            localStorage.setItem(storageKey, JSON.stringify(messages));
            console.log("Received full response:", aiReply);
        }

    } catch (error) {
        output.textContent = "Is iets mis met streaming. Check console.";
        console.error("Error during fetch or streaming:", error);
    }
    finally {
        chatfield.disabled = false;
    }
}

initializeMessages();