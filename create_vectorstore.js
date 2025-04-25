import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); //dit was nodig om dat anders ERROR:  OpenAIError: The OPENAI_API_VERSION environment variable is missing or empty; either provide it, or instantiate the AzureOpenAI client with an apiVersion option, like new AzureOpenAI({ apiVersion: 'My API Version' }).
// wat betekende dat .env file niet kon bereiken.
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, 'server', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file from:", envPath);
    console.warn("Proceeding without variables loaded from server/.env for create_vectorstore.js. Ensure variables are set globally if needed.");
} else {
    console.log("Successfully loaded .env from:", envPath);
}


const pdfPath = "./data/TempList.pdf";
const vectorStoreSavePath = "./vectorstore";
const chunkSize = 800;
const chunkOverlap = 160;

async function createVectorStore() {
    // 1. Initialize
    const embeddings = new AzureOpenAIEmbeddings({
        temperature: 0,
        azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    // 2. Load PDF Document
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    // 3. Split Documents into Chunks
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // 4. Create and Save Vector Store
    const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    await vectorStore.save(vectorStoreSavePath);
}


createVectorStore().then(() => {
    console.log("Vector store created and saved successfully to:", vectorStoreSavePath);
}).catch(error => {
    console.error("Script failed:", error.message);
    process.exit(1);
});