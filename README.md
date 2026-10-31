# 🛡️ LinkShield
### Think Before You Click.

**A MERN Stack-Based URL Security Analyzer with Google Safe Browsing Integration**

LinkShield is a web-based security application designed to analyze suspicious URLs and identify potential security threats. It combines rule-based URL inspection with Google's Safe Browsing API to help users identify potentially dangerous websites before visiting them.

The application provides a clean dashboard, real-time URL analysis, risk scoring, threat detection results, and MongoDB-powered scan history.

---

## ✨ Features

- 🔍 **URL Analysis:** Inspect URLs for suspicious patterns and security indicators.
- 🛡️ **Google Safe Browsing:** Check URLs against Google's known threat database.
- 📊 **Risk Scoring:** Generate a preliminary risk score from 0 to 100.
- ⚠️ **Threat Detection:** Identify known phishing, malware, and unwanted-software threats when listed by Google.
- 📜 **Scan History:** Store and retrieve previous scan results using MongoDB.
- ⚡ **Real-Time Results:** Display analysis results through a React dashboard.
- 🎨 **Modern Interface:** Clean, responsive dark-themed user interface.
- 🔄 **History Refresh:** Retrieve the latest saved scan records.

---

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development server and build tool |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| Google Safe Browsing API | Known threat lookup |
| JavaScript | Application programming language |
| CSS | Interface styling |
| Git & GitHub | Version control and source code hosting |

---

## 🏗️ Project Architecture

```text
LinkShield/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Scan.js
│   ├── services/
│   │   ├── safeBrowsing.js
│   │   └── urlAnalyzer.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── package.json
└── package-lock.json
```

---

## ⚙️ How It Works

1. The user enters a URL in the LinkShield dashboard.
2. The React frontend sends the URL to the Express backend.
3. The rule-based analyzer inspects the URL for selected warning indicators.
4. The backend sends the URL to Google Safe Browsing for a threat lookup.
5. The results are combined into a scan response.
6. The scan information is saved in MongoDB Atlas.
7. The frontend displays the risk score, warnings, Google threat-check status, and scan history.

### Threat-check statuses

| Status | Meaning |
|---|---|
| `unsafe` | Google identified a known threat |
| `no_match` | No matching known threat was found |
| `unavailable` | The Google threat check could not be completed |

---

## 🚀 Installation and Setup

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- Google Cloud project with Safe Browsing API enabled

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/LinkShield.git
```

```bash
cd LinkShield
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder.

Add:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
GOOGLE_SAFE_BROWSING_API_KEY=your_google_api_key
```

Replace the placeholder values with your own credentials.

**Never upload your `.env` file or expose API keys and database credentials on GitHub.**

### 5. Start the backend

From the `server` folder:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Start the frontend

From the `client` folder, open another terminal:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend status |
| POST | `/api/scan` | Analyze a URL and save the result |
| GET | `/api/scans` | Retrieve recent scan history |

### Example scan request

```json
{
  "url": "https://example.com"
}
```

### Example response

```json
{
  "url": "https://example.com/",
  "hostname": "example.com",
  "score": 0,
  "assessment": "No basic warning indicators",
  "warnings": [],
  "threatCheck": {
    "status": "no_match",
    "message": "No known threat was found in Google's database.",
    "threatTypes": []
  }
}
```

*Example response for illustration. Actual results depend on the URL and API response.*

---

## 🗄️ Database

LinkShield uses MongoDB Atlas to store scan records.

Each scan can contain:

- URL
- Hostname
- Risk score
- Assessment
- Warning details
- Google Safe Browsing status
- Detected threat types
- Threat-check timestamp
- Record creation and update timestamps

The application retrieves the latest 20 scan records for the dashboard history.

---

## 🔐 Security and Limitations

- Google Safe Browsing checks known threats in Google's database. It cannot identify every malicious website.
- A `no_match` response does not guarantee that a website is safe.
- The rule-based risk score is a preliminary indicator, not a probability of being attacked.
- An unavailable API response must not be interpreted as a safe result.
- The project is an educational security tool, not a replacement for professional security software.
- Google Safe Browsing API is subject to Google's terms and non-commercial-use restrictions. Commercial applications should evaluate Google Web Risk.

---

## 🎯 Project Objectives

1. Understand full-stack web application development using MERN.
2. Implement REST API communication between frontend and backend.
3. Integrate an external threat-intelligence API.
4. Store and retrieve scan records using MongoDB.
5. Understand basic URL security indicators.
6. Practice application development, debugging, and version control using GitHub.

---

## 🔮 Future Improvements

- Advanced URL reputation analysis.
- Additional threat-intelligence providers.
- Improved risk scoring and detection rules.
- User authentication and personalized scan history.
- Exportable scan reports.
- Deployment to a public cloud platform.

---

## 👨‍💻 Developer

**LinkShield** is developed as an educational full-stack web development and cybersecurity project.

**Project:** LinkShield  
**Category:** MERN Stack / Cybersecurity  
**Repository:** GitHub Private Repository

---

## 📄 License

This project is currently maintained as an educational project. No open-source license has been assigned.

---

<p align="center">
  🛡️ <strong>LinkShield</strong>
  <br/>
  <i>Think Before You Click.</i>
</p>