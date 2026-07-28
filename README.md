# AI Trip Planner

An intelligent, full-stack travel planning application that helps users discover places, plan personalized itineraries, and track their travel history using high-end local AI models.

## Features

- 🌍 **Explore Places**: Discover destinations tailored to your mood and budget, now complete with National/International classification badges.
- 🤖 **AI Chat Assistant**: Get real-time, context-aware travel recommendations powered by a high-end local AI model (**Llama 3.1 (8B)** or **Mistral (7B)**).
- 🧠 **AI Analyzer**: Smart place selection using **Phi-4 (14B)** to analytically pick the best 10 travel spots for your itinerary based on deep contextual criteria.
- 📅 **Plan Trip**: Generate customized day-by-day itineraries based on your preferences.
- 📊 **Mood Dashboard**: Visualize your travel patterns and mood correlations with a fluid, dynamically animated UI.
- 🕰️ **Travel History**: Keep track of your planned, ongoing, and completed trips with real-time cost tracking.
- 🔒 **Secure Authentication**: Robust Login and Sign Up flows with protected React router logic.
- 📁 **Administrative Excel Tracking**: Automatic backend generation of an internal Excel spreadsheet tracking total customers and user signup logs.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Radix UI
- **Backend**: Python, Flask, openpyxl
- **Database**: SQLite
- **AI Integration**: Ollama (High-end local models natively supported with smart fallback mechanisms)

## Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.8+](https://www.python.org/)
- [Ollama](https://ollama.com/) (running locally)

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd "Trip planner project"
   ```

2. **Backend Setup**:
   - Create and activate a virtual environment:
     ```bash
     python -m venv .venv
     source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Initialize the database and generate mock data:
     ```bash
     python generate_places.py
     ```

3. **Frontend Setup**:
   - Install Node modules:
     ```bash
     npm install
     ```

4. **AI Setup (Ollama)**:
   - Start Ollama and pull your desired high-end models. The system defaults to Llama 3.1 and Phi-4, but will automatically fall back to Qwen3 if they are not installed.
     ```bash
     ollama pull llama3.1
     ollama pull phi4
     ollama pull qwen3:latest
     ```

## Running the Application

You can start the entire application using the provided shell script:

```bash
./run.sh
```

This will concurrently start:
- The Vite frontend development server
- The Flask backend API (port 5001)

Access the application in your browser at `http://localhost:3000`. You will be directed to the secure login screen. 

## Project Structure

- `app.py`: Flask backend application, API routes, and Excel tracker logic.
- `src/`: Frontend React application source code.
  - `pages/`: UI pages (Login, Explore, Plan Trip, Chat Assistant, etc.)
  - `components/`: Reusable UI components.
  - `entities/`: Data handling models and API callers.
  - `contexts/`: React contexts (TravelStatsContext, AuthContext).
- `trips.db`: SQLite database storing user profiles and trips.
- `users.xlsx`: Backend-generated customer signup log.
- `places.json`: Generated database of travel destinations.

## License
MIT License
# AI-Trip-Planner
