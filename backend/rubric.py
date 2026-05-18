from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, Exam, Question
from pydantic import BaseModel
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class QuestionCreate(BaseModel):
    question_text: str
    max_marks: int
    grading_criteria: str

class RubricCreate(BaseModel):
    filename: str
    created_by: str
    questions: List[QuestionCreate]

@router.post("/rubric")
def create_rubric(rubric: RubricCreate, db: Session = Depends(get_db)):
    exam = Exam(
        filename=rubric.filename,
        total_pages=0,
        created_by=rubric.created_by
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    for q in rubric.questions:
        question = Question(
            exam_id=exam.id,
            question_text=q.question_text,
            max_marks=q.max_marks,
            grading_criteria=q.grading_criteria
        )
        db.add(question)
    db.commit()

    return {"message": "Rubric created", "exam_id": exam.id}

@router.get("/rubrics")
def get_rubrics(db: Session = Depends(get_db)):
    exams = db.query(Exam).all()
    result = []
    for exam in exams:
        result.append({
            "id": exam.id,
            "filename": exam.filename,
            "created_by": exam.created_by,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "max_marks": q.max_marks,
                    "grading_criteria": q.grading_criteria
                }
                for q in exam.questions
            ]
        })
    return {"rubrics": result}

@router.get("/rubric/{exam_id}")
def get_rubric(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Rubric not found")
    return {
        "id": exam.id,
        "filename": exam.filename,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "max_marks": q.max_marks,
                "grading_criteria": q.grading_criteria
            }
            for q in exam.questions
        ]
    }