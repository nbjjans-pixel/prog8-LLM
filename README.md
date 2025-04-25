# Aetherius Opvangcentrum - Chatbot Project

Dit project is een chatbot genaamd "Max Wild", een virtuele dierverzorger. Hij gebruikt informatie uit een PDF-bestand (`TempList.pdf`) om vragen over dieren te beantwoorden. Het gebruikt Azure OpenAI (een AI-dienst) om te praten en de PDF te begrijpen.

## Wat je nodig hebt

*   **Node.js & npm:** Zorg dat dit op je computer staat. (Check met `node -v` en `npm -v` in je terminal).
*   **Azure Account:** Je hebt toegang nodig tot Azure OpenAI met:
    *   Een **Chat Model** (zoals GPT-3.5-Turbo).
    *   Een **Embeddings Model** (zoals text-embedding-ada-002).
*   **PDF Bestand:** Het `TempList.pdf` bestand (of een ander PDF) met de info voor de chatbot.

## Installatie Stappen

1.  **Download/Clone Code:** Haal de projectbestanden binnen. Open een terminal in de projectmap.
    ```bash
    # Als je git gebruikt:
    # git clone <repository-url>
    # cd <repository-directory>
    ```

2.  **Installeer Packages:**
    ```bash
    npm install
    ```
    Dit downloadt alle code die het project nodig heeft (zoals Express, LangChain, etc.).

3.  **Stel Azure In (.env bestand):**
    *   Maak een map `server` in de hoofdmap van het project.
    *   Maak in de `server` map een bestand genaamd `.env`.
    *   Plak dit in het `.env` bestand en vul **jouw eigen Azure gegevens** in:

    ```dotenv
    # Jouw Azure OpenAI gegevens
    AZURE_OPENAI_API_KEY=<Jouw_Azure_OpenAI_API_Sleutel>
    AZURE_OPENAI_API_ENDPOINT=<Jouw_Azure_OpenAI_Endpoint_URL>
    AZURE_OPENAI_API_VERSION=2024-02-15-preview # Of jouw API versie

    # Namen van je deployments in Azure
    AZURE_OPENAI_API_DEPLOYMENT_NAME=<Jouw_Chat_Model_Deployment_Naam>
    AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=<Jouw_Embeddings_Model_Deployment_Naam>
    ```

4.  **Voeg PDF toe:**
    *   Maak een map `data` in de hoofdmap van het project.
    *   Zet je PDF-bestand in deze `data` map en zorg dat het **`TempList.pdf`** heet.

5.  **Maak de "Kennisbank" (Vector Store):**
    Dit script leest de PDF en maakt er een soort slimme index van (een vector store) zodat de AI snel info kan vinden.
    ```bash
    npm run create-vectorstore
    ```
    Dit maakt een `vectorstore` map aan.

## Start de Applicatie

Je moet 2 dingen tegelijk starten: de backend (server) en de frontend (website).

1.  **Start Backend:**
    Open een terminal in de projectmap:
    ```bash
    npm run server
    ```
    Wacht tot je ziet: `Server running on http://localhost:3000`.

2.  **Start Frontend:**
    Open een **nieuwe** terminal (laat de eerste open!) in de projectmap:
    ```bash
    npm run dev
    ```
    Dit start de webserver voor de interface. Je ziet nu een link zoals `http://localhost:5173`.

3.  **Open de Chat:**
    Ga naar de link uit stap 2 (bv. `http://localhost:5173`) in je browser. Je kunt nu chatten met Max!