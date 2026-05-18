\# GradeOps — AI-Powered Exam Grading System



A Human-in-the-Loop (HITL) exam grading system that uses LLM to automatically grade exam answers, with a TA review dashboard for approvals and overrides.



\## Features

\- JWT Authentication with Role-Based Access (Instructor / TA)

\- Bulk PDF exam upload with automatic page extraction

\- Rubric builder for defining questions and grading criteria

\- AI grading using Groq LLM with score and justification

\- TA Review Dashboard with keyboard shortcuts (A/O/N)

\- Completed reviews history



\## Tech Stack

\### Frontend

\- React.js

\- Custom dark theme UI



\### Backend

\- FastAPI (Python)

\- SQLAlchemy + SQLite

\- Groq LLM API (llama-3.3-70b)

\- PyMuPDF for PDF processing

\- JWT Authentication



\## Setup Instructions



\### Backend

cd backend

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

uvicorn main:app --reload



\### Frontend

cd frontend

npm install

npm start

