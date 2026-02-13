# CareerFlow AI 🚀

**CareerFlow AI** is an intelligent career readiness portal designed to help students and professionals accelerate their career growth through AI-powered insights.

## 🌟 Features

### 1. **Career Navigator**
- Generate personalized AI skills roadmaps tailored to your target role
- Interactive spider chart visualization showing skills demand analysis
- Track learning progress with estimated completion times
- Get salary impact projections for each skill
- Priority-based learning recommendations (Critical, Important, Optional)

### 2. **Resume Scorer**
- Upload PDF resumes for instant AI analysis
- Get comprehensive ATS (Applicant Tracking System) compatibility scores
- Keyword optimization analysis with matched and missing keywords
- Detailed scoring across 5 categories:
  - ATS Compatibility
  - Content Quality
  - Keyword Optimization
  - Formatting
  - Experience Relevance
- Personalized recommendations for improvement
- Industry comparison insights

## 🛠️ Tech Stack

### Frontend
- **React** (Vite) - Fast, modern development experience
- **Tailwind CSS** - Custom orange & black themed UI
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Recharts** - Interactive data visualizations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Mongoose ODM)
- **Google Gemini AI** - AI-powered analysis
- **pdf-parse** - Resume parsing
- **multer** - File upload handling

## 📁 Project Structure

```
CareerFlow/
├── backend/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── gemini.js         # Gemini AI configuration
│   ├── controllers/
│   │   ├── careerController.js   # Career roadmap logic
│   │   └── resumeController.js   # Resume analysis logic
│   ├── models/
│   │   ├── Roadmap.js        # Roadmap schema
│   │   └── ResumeAnalysis.js # Resume analysis schema
│   ├── routes/
│   │   ├── careerRoutes.js   # Career API routes
│   │   └── resumeRoutes.js   # Resume API routes
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js             # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Input.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── CareerNavigator.jsx
    │   │   └── ResumeScorer.jsx
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/
    │   │       ├── careerSlice.js
    │   │       └── resumeSlice.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### Installation

#### 1. Clone the repository
```bash
cd CareerLens
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerflow
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Get your Gemini API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env` file

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### Running the Application

#### Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend Development Server (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Career Routes
- `POST /api/career/roadmap` - Generate skills roadmap
- `GET /api/career/resources/:skillName` - Get learning resources
- `POST /api/career/path` - Analyze career path

### Resume Routes
- `POST /api/resume/analyze` - Upload and analyze resume
- `GET /api/resume/history` - Get analysis history

## 🎨 Design Theme

The application features a clean, professional design with:
- **White background** for readability
- **Orange accents** (#FF5722) for CTAs and highlights
- **Black/Dark gray** (#1E1E1E) for text and secondary elements
- Modern card-based layout
- Smooth transitions and hover effects

## 🔑 Key Features Implementation

### AI-Powered Roadmap Generation
Uses Google Gemini to analyze:
- Target role requirements
- Current skills assessment
- Market demand analysis
- Learning time estimates
- Salary impact projections

### Resume Analysis Engine
Comprehensive scoring across:
- ATS compatibility (parsing, formatting)
- Content quality (achievements, metrics)
- Keyword matching vs job descriptions
- Experience relevance
- Professional formatting standards

### Spider Chart Visualization
Interactive radar chart showing:
- Current market demand for skills
- Priority/importance levels
- Visual skill gap analysis

## 🧪 Testing the Application

### Test Career Navigator
1. Navigate to "Career Navigator"
2. Enter target role (e.g., "Full Stack Developer")
3. Add current skills (e.g., "JavaScript, React, Node.js")
4. Select experience level
5. Click "Generate AI Skills Roadmap"
6. View personalized roadmap with spider chart

### Test Resume Scorer
1. Navigate to "Resume Scorer"
2. Enter target role
3. Upload a PDF resume
4. Click "Generate AI Skills Data"
5. Review detailed analysis with scores and recommendations

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000                                      # Server port
MONGODB_URI=mongodb://localhost:27017/careerflow  # Database connection
GEMINI_API_KEY=your_api_key_here              # Google Gemini API key
NODE_ENV=development                          # Environment mode
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent analysis
- Recharts for data visualization
- Tailwind CSS for styling
- React ecosystem for frontend development

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for students and professionals advancing their careers**
