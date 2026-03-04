# 🚀 CareerLens - AI-Powered Career Intelligence Platform

CareerLens is a comprehensive, student-centric career acceleration platform designed to help college students and freshers navigate their journey from campus to corporate. It leverages advanced AI (Google Gemini) to provide personalized resume scoring, skill gap analysis, and tailored career roadmaps.

> **Note:** This project is specifically tailored for the Indian college placement ecosystem (2025-2026 trends), focusing on Campus Placements and Internships.

---

## ✨ Key Features

### 1. 🔐 Student-Centric Authentication
*   **Targeted Registration:** Sign-up flow specifically designed for students, capturing:
    *   College/University Name
    *   Degree & Major
    *   Graduation Year
*   **Secure Auth:** JWT-based session management with Bcrypt password hashing.

### 2. 📄 AI Resume Scorer (ATS & Recruiter View)
Unlike generic resume parsers, this tool acts as a strict **Campus Placement Recruiter**.
*   **PDF Analysis:** Parsing and deep analysis of student resumes.
*   **Placement-Focused Scoring:** Evaluates based on:
    *   **Project Complexity:** Checks for real-world application vs. simple tutorials.
    *   **DSA & Coding Profiles:** Looks for LeetCode, CodeChef, GitHub links.
    *   **Internship Relevance:** Weighs industry experience over academic theory.
*   **Smart UI Patterns:**
    *   **"What You'll Learn" Panel:** blurred preview teasing insights to encourage upload.
    *   **Common Mistakes Tracker:** Identifies typical student errors (e.g., listing subjects instead of skills).
    *   **Actionable Feedback:** Provides specific missing keywords and formatting fixes.

### 3. 🧭 Career Navigator (AI Roadmap Generator)
A dynamic roadmap generator for students unsure about their path or looking to upskill.
*   **Personalized Roadmaps:** Generates a week-by-week learning plan based on:
    *   **Target Role** (e.g., Full Stack Dev, Data Analyst)
    *   **Current Skill Level** (Beginner to Advanced)
*   **Market Intelligence:**
    *   **Placement Trends 2025-26:** Displays real-time facts about internship conversion rates, top in-demand skills (Cloud, FS), and salary trends.
    *   **Skill Gap Analysis:** Identifies exactly what technologies the student is missing for their target role.

### 4. 📊 History & Dashboard
*   **Centralized Repository:** Students can revisit all their past:
    *   Resume Analysis Reports
    *   Generated Career Roadmaps
*   **Management:** Option to delete old or irrelevant analyses.
*   **Responsive Grid:** Glassmorphism-styled cards for easy navigation.

### 5. 🎨 Premium UI/UX Experience
*   **Aesthetics:** Dark-themed, futuristic design using **Glassmorphism** and deeply saturated gradients.
*   **Animations:**
    *   `Framer Motion` for smooth page transitions and stagger effects.
    *   **Animated Background:** Custom particle field with floating glowing orbs and grid overlays.
*   **Responsive Layouts:** Fully responsive grids that adapt from mobile to desktop.
*   **Sticky Footer:** Polished footer that stays grounded, ensuring a professional look.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React.js (Vite)
*   **Styling:** Tailwind CSS
*   **State Management:** Redux Toolkit
*   **Animations:** Framer Motion
*   **Routing:** React Router DOM
*   **Icons:** Lucide React

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose Schema)
*   **AI Engine:** Google Gemini Pro API
*   **Security:** JSON Web Tokens (JWT), Bcrypt.js
*   **File Handling:** Multer, PDF-Parse

---

## 🚀 Getting Started

### Prerequisites
*   Node.js installed
*   MongoDB URI
*   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kokul24/CareerLens.git
    cd CareerLens
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_uri
    # JWT_SECRET=your_jwt_secret
    # GEMINI_API_KEY=your_gemini_key
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---



*Built with ❤️ for the Next Gen of Engineers.*
