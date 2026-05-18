from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from groq import Groq
from sqlalchemy.orm import Session
from database import SessionLocal, GradingResult
from dotenv import load_dotenv
load_dotenv()
import re
import os

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GradeRequest(BaseModel):
    exam_id: int
    question_id: int
    question_text: str
    max_marks: int
    grading_criteria: str
    student_answer: str

class ReviewRequest(BaseModel):
    result_id: int
    action: str
    final_score: int
    reviewed_by: str

@router.post("/grade")
async def grade_answer(req: GradeRequest, db: Session = Depends(get_db)):
    try:
        client = Groq(api_key=GROQ_API_KEY)

        prompt = f"""You are an exam grader. Grade the following student answer.

Question: {req.question_text}
Maximum Marks: {req.max_marks}
Grading Criteria: {req.grading_criteria}
Student Answer: {req.student_answer}

You MUST respond in exactly this format with no extra text:
SCORE: 7
JUSTIFICATION: The student demonstrated good understanding of the concept.
FEEDBACK: Try to include more specific examples next time."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )

        response_text = response.choices[0].message.content
        print("Groq response:", response_text)

        score = 0
        justification = "No justification provided"
        feedback = "No feedback provided"

        for line in response_text.strip().split('\n'):
            line = line.strip()
            if line.upper().startswith("SCORE:"):
                numbers = re.findall(r'\d+', line)
                if numbers:
                    score = min(int(numbers[0]), req.max_marks)
            elif line.upper().startswith("JUSTIFICATION:"):
                justification = line.split(":", 1)[1].strip()
            elif line.upper().startswith("FEEDBACK:"):
                feedback = line.split(":", 1)[1].strip()

        result = GradingResult(
            exam_id=req.exam_id,
            question_id=req.question_id,
            question_text=req.question_text,
            student_answer=req.student_answer,
            ai_score=score,
            max_marks=req.max_marks,
            justification=justification,
            feedback=feedback,
            status="pending"
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        return {
            "result_id": result.id,
            "score": score,
            "max_marks": req.max_marks,
            "justification": justification,
            "feedback": feedback
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/review/pending")
def get_pending_reviews(db: Session = Depends(get_db)):
    results = db.query(GradingResult).filter(
        GradingResult.status == "pending"
    ).all()
    return {"results": [
        {
            "id": r.id,
            "exam_id": r.exam_id,
            "question_text": r.question_text,
            "student_answer": r.student_answer,
            "ai_score": r.ai_score,
            "max_marks": r.max_marks,
            "justification": r.justification,
            "feedback": r.feedback,
            "status": r.status
        }
        for r in results
    ]}

@router.post("/review")
def review_result(req: ReviewRequest, db: Session = Depends(get_db)):
    result = db.query(GradingResult).filter(
        GradingResult.id == req.result_id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    result.status = req.action
    result.final_score = req.final_score
    result.reviewed_by = req.reviewed_by
    db.commit()

    return {"message": f"Result {req.action} successfully"}

@router.get("/review/completed")
def get_completed_reviews(db: Session = Depends(get_db)):
    results = db.query(GradingResult).filter(
        GradingResult.status != "pending"
    ).all()
    return {"results": [
        {
            "id": r.id,
            "question_text": r.question_text,
            "student_answer": r.student_answer,
            "ai_score": r.ai_score,
            "final_score": r.final_score,
            "max_marks": r.max_marks,
            "status": r.status,
            "reviewed_by": r.reviewed_by
        }
        for r in results
    ]}