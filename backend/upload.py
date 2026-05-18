import fitz
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
import aiofiles

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-exam")
async def upload_exam(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    doc = fitz.open(file_path)
    pages = []
    
    for i, page in enumerate(doc):
        image_filename = f"{file.filename}_page_{i+1}.png"
        image_path = os.path.join(UPLOAD_DIR, image_filename)
        pix = page.get_pixmap()
        pix.save(image_path)
        pages.append(image_filename)
    
    doc.close()
    
    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "total_pages": len(pages),
        "pages": pages
    }

@router.get("/exams")
async def get_exams():
    files = os.listdir(UPLOAD_DIR)
    pdfs = [f for f in files if f.endswith(".pdf")]
    return {"exams": pdfs}