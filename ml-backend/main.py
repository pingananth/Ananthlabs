import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI(title="YOLO11 Logo Detection API")

# Setup CORS to allow requests from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the custom YOLO model
MODEL_PATH = "best.pt"
try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
    else:
        print(f"WARNING: Model {MODEL_PATH} not found. Ensure best.pt is placed in ml-backend.")
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.post("/api/detect")
async def detect(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="YOLO model not loaded on server.")
        
    try:
        # Read image into OpenCV format
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")

        # DEBUG: Save the exact image that YOLO sees to disk to prove it's not corrupted
        cv2.imwrite("debug_upload.jpg", img)

        # Run inference (lowered threshold to 1% to force the model to output its weakest guesses)
        results = model.predict(source=img, conf=0.01)
        
        # Parse results
        predictions = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Bounding box coordinates (xyxy format: x_min, y_min, x_max, y_max)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                # Class name
                class_name = model.names[cls] if hasattr(model, 'names') else str(cls)
                
                predictions.append({
                    "x_min": x1,
                    "y_min": y1,
                    "x_max": x2,
                    "y_max": y2,
                    "confidence": conf,
                    "class": class_name
                })
                
        return {"predictions": predictions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
