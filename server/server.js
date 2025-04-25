import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const vectorStoreLoadPath = "./vectorstore";
const K_RESULTS = 3;

let vectorStore;
let model;
let embeddings;

async function initializeApp() {
    model = new AzureChatOpenAI({
        temperature: 0.7
    });

    embeddings = new AzureOpenAIEmbeddings({
        temperature: 0,
        azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    vectorStore = await FaissStore.load(vectorStoreLoadPath, embeddings);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.post('/', async (req, res) => {
    if (!vectorStore || !model) {
        return res.status(500).send("Server not ready.");
    }

    const chatHistory = req.body.messages;

    const messages = chatHistory.map(([role, content]) => {
        switch (role) {
            case "system": return new SystemMessage(content);
            case "human": return new HumanMessage(content);
            case "assistant": return new AIMessage(content);
            default: return null;
        }
    }).filter(msg => msg !== null);

    const userQuestion = messages[messages.length - 1]?.content;

    const relevantDocs = await vectorStore.similaritySearch(userQuestion, K_RESULTS);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n---\n\n");

    const originalSystemPrompt = messages.find(msg => msg.constructor.name === 'SystemMessage')?.content
        || "You are a helpful assistant.";

    const ragSystemPrompt = new SystemMessage(
        `${originalSystemPrompt}\n\nWhen answering the user's question, use the following context *only* if it is relevant. Base your answer primarily on this context if it helps answer the question about animals, their facts, or related topics from the Aetherius Opvangcentrum guide. If the context is not relevant, or the question is not about animals/facts from the guide, answer based on your general knowledge as Max Wild (but do not make up facts not in the context if the question *is* about the guide) or politely decline if the question is completely off-topic. Do not explicitly mention the context unless asked how you know something.\n\nRelevant Context:\n---\n${context}\n---`
    );

    const ragMessages = [
        ragSystemPrompt,
        ...messages.filter(msg => msg.constructor.name !== 'SystemMessage')
    ];

    try {
        const stream = await model.stream(ragMessages);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        for await (const chunk of stream) {
            if (chunk.content) {
                res.write(chunk.content);
            }
        }
        res.end();
    } catch (error) {
        console.error("Error during model stream:", error);
        if (!res.headersSent) {
            res.status(500).send("Error processing request with AI model.");
        } else {
            res.end();
        }
    }
});

initializeApp().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error("Application failed to initialize:", error);
    process.exit(1);
});