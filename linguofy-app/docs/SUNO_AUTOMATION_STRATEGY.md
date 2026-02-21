# Automating Song Creation with Suno AI

Currently, generating songs for Linguofy lessons is a manual process using the Suno web interface. To scale the platform and enable dynamic, user-generated lessons, we need to automate this process.

Because Suno **does not currently have a public, official API**, we must rely on established third-party API wrappers or API aggregation services that have reverse-engineered the platform or offer proxy access.

## Unofficial API Solutions

There are two primary approaches to automating Suno song generation:

### Option A: Fully Managed Third-Party API Platforms (Recommended)
Several AI API aggregators provide reliable, paid endpoints for Suno generation. This is the most stable method, as they handle the session management and rate limiting.

*   **AIML API (aimlapi.com)**: Offers a dedicated Suno endpoint.
    *   **Pros**: Highly reliable, easy integration via standard REST API, structured JSON responses, no need to manage fake accounts or session tokens.
    *   **Cons**: Paid service (pay-per-use).
*   **SunoAPI.org / GCUI.ai**: Specialized commercial wrappers built specifically around Suno's backend.
    *   **Features**: Supports custom lyrics, tags, instrumental toggles, and provides audio URLs directly.

### Option B: Open Source Reverse-Engineered SDKs
There are open-source Node.js libraries (e.g., `suno-api` on GitHub) that wrap the unspoken Suno backend calls.

*   **How it works**: You create a dummy Suno account, extract the `Bearer` token or session cookie from your browser's network tab, and plug it into your backend server.
*   **Pros**: Free (uses your existing Suno account credits).
*   **Cons**: High maintenance. If Suno changes their internal API structure or tightens cookie security, the wrapper breaks. It also heavily limits concurrency to whatever your single account allows.

---

## Proposed Implementation Workflow

To integrate this into Linguofy's `lessonGenerator.js`, we would implement the following backend pipeline (ideally via a Supabase Edge Function to protect API keys):

### 1. The Trigger
A user (or admin) requests a new song about a specific topic (e.g., "Ordering food in a restaurant in Spanish").

### 2. LLM Lyric Generation
We first call an LLM (OpenAI/Anthropic) using a strict prompt to generate the lyrics. The LLM must output lyrics structured with Suno's meta-tags (e.g., `[Verse]`, `[Chorus]`, `[Bridge]`).

```json
{
  "title": "La Cuenta Por Favor",
  "tags": "upbeat latin pop, reggaeton, male vocalist",
  "lyrics": "[Verse 1]\nHola camarero, la carta por favor...\n[Chorus]\nQuiero comer, quiero beber..."
}
```

### 3. The Suno API Call
The backend then makes a POST request to the chosen Suno API provider (e.g., AIML API) using the `"custom"` mode.

**Example Payload:**
```json
{
  "prompt": "[Verse 1]\nHola camarero, la carta por favor...\n[Chorus]\nQuiero comer, quiero beber...",
  "tags": "upbeat latin pop, reggaeton, male vocalist",
  "title": "La Cuenta Por Favor",
  "make_instrumental": false
}
```

### 4. Polling for Completion
Suno generation takes about 1-2 minutes. The initial API call will return a `Task ID`. Our backend (or the client via WebSocket) must poll the `GET /status/{task_id}` endpoint every 5-10 seconds until the status is `completed`.

### 5. Ingestion & Audio Storage
Once completed, the Suno API returns two distinct audio tracks (an A and B variant). 
1. The backend automatically selects one (or lets the user pick).
2. The `.mp3` file is downloaded from the provided URL and uploaded to our own **Supabase Storage Bucket** for permanent, fast hosting.
3. The new lesson data (lyrics, vocabulary, and our new Supabase audio URL) is written to the `lessons` database table.

---

## Readiness Checklist

To transition from manual creation to full automation, we need:
- [ ] Decide on the API Provider (AIML API vs Open Source Cookie Wrapper).
- [ ] Acquire API Keys.
- [ ] Create a Supabase Edge Function to handle the LLM -> Suno -> Supabase Storage pipeline securely.
- [ ] Update `AdminDashboard.jsx` or a new user-facing "Create Lesson" UI to trigger and show a loading state during the 2-minute generation process.
