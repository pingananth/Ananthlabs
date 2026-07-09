import cv2
import numpy as np

# 1. Create a synthetic flyer with "Wordmark Black"
flyer = np.ones((500, 500, 3), dtype=np.uint8) * 255 # White background
# Add some black text to act as the logo
cv2.putText(flyer, "TOASTMASTERS", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,0), 4)

# 2. Create the "Template"
templ_rgba = np.zeros((100, 400, 4), dtype=np.uint8) # Transparent
cv2.putText(templ_rgba, "TOASTMASTERS", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,0, 255), 4) # Black text with full alpha

# 3. Simulate React code
alpha = templ_rgba[:, :, 3]
_, alpha_thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
x, y, w, h = cv2.boundingRect(alpha_thresh)
cropped_templ = templ_rgba[y:y+h, x:x+w]

# Composite onto Middle Gray
gray_bg = np.ones((h, w, 3), dtype=np.uint8) * 128
templ_rgb = cropped_templ[:, :, 0:3]
templ_mask = cropped_templ[:, :, 3]

# Apply mask (boolean copy)
mask_bool = templ_mask > 0
gray_bg[mask_bool] = templ_rgb[mask_bool]

# Grayscale conversion
gray_flyer = cv2.cvtColor(flyer, cv2.COLOR_BGR2GRAY)
gray_templ = cv2.cvtColor(gray_bg, cv2.COLOR_BGR2GRAY)

res = cv2.matchTemplate(gray_flyer, gray_templ, cv2.TM_CCOEFF_NORMED)
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

print("Correlation with Gray Bg:", max_val)

# Compare with White Bg
white_bg = np.ones((h, w, 3), dtype=np.uint8) * 255
white_bg[mask_bool] = templ_rgb[mask_bool]
gray_templ_white = cv2.cvtColor(white_bg, cv2.COLOR_BGR2GRAY)
res2 = cv2.matchTemplate(gray_flyer, gray_templ_white, cv2.TM_CCOEFF_NORMED)
_, max_val2, _, _ = cv2.minMaxLoc(res2)
print("Correlation with White Bg:", max_val2)
