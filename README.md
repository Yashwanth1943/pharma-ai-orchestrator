# Pharma AI Orchestrator

Pharma AI Orchestrator is a robust, enterprise-grade AI-powered Command Center built for the Pharmaceutical industry. The platform unifies the entire customer lifecycle and supply chain into a single, intelligent application, bridging the gap between customers, production floors, marketing, and executives.

It uses cutting-edge AI (Groq + Llama 3) not just as a chatbot, but as an embedded decision-support layer across the entire application—helping users draft responses, predict churn, and analyze bottlenecks.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Secure, segmented access across 9 different organizational roles (e.g., Admin, Customer, Production Team, QC, QA, Warehouse, Logistics).
*   **7-Stage Product Journey Tracking:** Real-time visibility into the supply chain. Orders transition strictly through defined roles with live Socket.io updates across all connected clients.
*   **AI Complaint Management:** Customers can easily report product issues. Service agents use a built-in AI Writing Assistant to instantly analyze complaints, detect sentiment, and draft professional, empathetic resolutions.
*   **Predictive Analytics Hub:** A visual dashboard featuring AI-driven sentiment trends and quarter-over-quarter churn vs. conversion propensity forecasts.
*   **Marketing & Outreach Segmenting:** AI automatically categorizes customers into targeted marketing segments, recommending the "Next-Best Action" (NBA) while adhering to consent logic.
*   **Immutable Audit Logs:** An enterprise-grade auditing middleware intercepts every system mutation (`POST`/`PUT`/`DELETE`), logging who made the change, their role, and the exact timestamp.
*   **CSV Reporting:** One-click data exports for business intelligence reporting.
*   **Real-time Notifications:** Individualized, scoped push notifications powered by Socket.io alert users the moment they need to act (e.g., when an order reaches QC, or a package is delivered).

## 🛠️ Technology Stack

**Frontend:**
*   React (Vite)
*   Tailwind CSS (Custom Enterprise Design System)
*   Framer Motion (Animations)
*   Recharts (Data Visualization)
*   Lucide React (Icons)
*   Socket.io-client

**Backend:**
*   Node.js / Express.js
*   MongoDB (Mongoose)
*   Groq API (Llama-3.1-8b-instant for fast NLP tasks)
*   Socket.io (Real-time events)
*   JSON Web Tokens (JWT) & bcrypt (Authentication)

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Groq API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pharma-ai-orchestrator.git
    cd pharma-ai-orchestrator
    ```

2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    ```
    *Create a `.env` file in the `server` directory:*
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GROQ_API_KEY=your_groq_api_key
    ```
    *Run the backend:*
    ```bash
    npm run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd client
    npm install
    ```
    *Run the frontend:*
    ```bash
    npm run dev
    ```

4.  **Access the Application:**
    Navigate to `http://localhost:5173` in your browser.

## 🔑 Default Roles for Testing
When registering a new user as an Admin, you can assign them one of the following roles:
`Admin`, `Customer`, `Production Team`, `Quality Control (QC)`, `Quality Assurance (QA)`, `Warehouse`, `Logistics`, `Service Agent`, `Sales Manager`, `Marketing Manager`.
