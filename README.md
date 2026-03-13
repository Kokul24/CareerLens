# CareerLens AI
## Intelligent Placement Prediction and Career Insight System

CareerLens AI is an intelligent web platform designed to help students evaluate their placement readiness using data-driven insights. The system analyzes academic performance, technical skills, internships, and project experience to estimate placement probability and provide personalized career recommendations.

The platform integrates:

- Machine Learning for placement prediction 
- Machine Learning for stress well being monitor(random forest classifier)
- Generative AI (Gemini API) for resume analysis and career navigation
- Explainable AI using SHAP to identify key factors affecting placement probability by Logistic regression

---

## Team Details

- Team Number: 16

### Team Members

- Pradeep Kumar N — CB.EN.U4ECE22137
- Yuvan Dhurkesh SJ — CB.SC.U4CSE23365
- Gugan SS — CB.SC.U4CSE23416
- Kokul M — CB.SC.U4CSE23462

---

## Project Modules

### 1. Placement Prediction Module
Predicts placement probability using a Logistic Regression model trained on student academic and skill data.

### 2. Resume Analyzer
Uses the Gemini API to analyze resumes and generate an ATS compatibility score with improvement suggestions.

### 3. Career Navigator
Uses the Gemini API to analyze student skills and recommend learning paths and technologies for career growth.

### 4. Wellbeing Monitoring Module
Tracks study patterns and behavioral indicators to detect stress or imbalance during placement preparation.

---

## Technologies Used

### Frontend
- React.js

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Machine Learning
- Python
- Scikit-learn
- SHAP Explainability

### AI Integration
- Gemini API

---

## Project Folder Structure

```text
CareerLens/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- redux/
|  |- index.html
|  |- package.json
|
|- backend/
|  |- config/
|  |- controllers/
|  |- data/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- services/
|  |- uploads/
|  |- package.json
|  |- server.js
|
|- README.md
|- PROJECT_SUMMARY.md
|- start.ps1
```

### Folder Explanation

- /frontend: Contains the React.js user interface, pages, components, and Redux state management.
- /backend: Contains the Node.js and Express.js API server and business logic.
- /backend/models: MongoDB schema definitions and model files.
- /backend/routes: API endpoint definitions.
- /backend/controllers: Request handling logic for authentication, career, resume, placement, and stress modules.
- /backend/data: Datasets and cached model data used by prediction and stress analysis services.
- /backend/services: Machine learning utility services used by backend modules.
- /backend/config: Configuration files for database connection, authentication, and Gemini integration.
- /backend/middleware: Middleware for security and route protection.
- /backend/uploads: Uploaded files such as resumes for analysis.

---

## Installation Instructions

1. Clone the repository.

```bash
git clone <repository-link>
```

2. Navigate to the project directory.

```bash
cd careerlens-ai
```

3. Install dependencies for backend.

```bash
cd backend
npm install
```

4. Install dependencies for frontend.

```bash
cd ../frontend
npm install
```

---

## Running the Project

### Start the backend server

```bash
cd backend
npm start
```

### Start the frontend application

```bash
cd frontend
npm run dev
```

The application will run locally on the configured development server.

---

## Features

- Placement probability prediction
- Resume ATS score analysis
- AI-based career learning recommendations
- SHAP explainability visualization
- Student wellbeing monitoring

---

## Notes

- Configure environment variables in backend/.env before running the backend server.
- Ensure MongoDB is available locally or via a cloud connection string.
- A valid Gemini API key is required for AI-based modules.
