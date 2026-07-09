import cv2
from ultralytics import YOLO

model = YOLO("best.pt")

# Run inference at low threshold to capture everything
results = model("debug_upload.jpg", conf=0.10)

print("--- TOP DETECTIONS DETECTED ---")
highest_scores = {}

for result in results:
    for box in result.boxes:
        conf = box.conf[0].item()
        cls_id = int(box.cls[0].item())
        cls_name = model.names[cls_id]
        
        # Track the maximum confidence found for each individual logo class
        if cls_name not in highest_scores or conf > highest_scores[cls_name]:
            highest_scores[cls_name] = conf

for logo_type, score in highest_scores.items():
    print(f"Peak confidence found for '{logo_type}': {score * 100:.1f}%")