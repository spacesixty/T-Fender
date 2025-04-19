import joblib
import sys

model = joblib.load("email_classifier_pipeline.pkl")

if len(sys.argv) > 1:
    email_string = sys.argv[1]
else:
    email_string = ""
    
prediction = model.predict([email_string])[0]

print(prediction)