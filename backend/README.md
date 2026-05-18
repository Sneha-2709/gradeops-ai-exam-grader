\# GradeOps Backend



FastAPI backend for GradeOps AI exam grading system.



\## Setup

1\. Create virtual environment: python -m venv venv

2\. Activate: venv\\Scripts\\activate

3\. Install: pip install -r requirements.txt

4\. Run: uvicorn main:app --reload



\## Endpoints

\- POST /register - Register user

\- POST /login - Login user

\- POST /upload-exam - Upload PDF exam

\- GET /exams - Get all exams

\- POST /rubric - Create rubric

\- GET /rubrics - Get all rubrics

\- POST /grade - Grade answer with AI

\- GET /review/pending - Get pending reviews

\- POST /review - Submit review

\- GET /review/completed - Get completed reviews

