from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./gradeops.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    total_pages = Column(Integer)
    created_by = Column(String)
    questions = relationship("Question", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    question_text = Column(Text)
    max_marks = Column(Integer)
    grading_criteria = Column(Text)
    exam = relationship("Exam", back_populates="questions")

class GradingResult(Base):
    __tablename__ = "grading_results"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer)
    question_id = Column(Integer)
    question_text = Column(Text)
    student_answer = Column(Text)
    ai_score = Column(Integer)
    max_marks = Column(Integer)
    justification = Column(Text)
    feedback = Column(Text)
    status = Column(String, default="pending")
    final_score = Column(Integer, nullable=True)
    reviewed_by = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)