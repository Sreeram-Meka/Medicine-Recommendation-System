
from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import pandas as pd
# from flask_ngrok import run_with_ngrok

app = Flask(__name__)
# run_with_ngrok(app)

# Load the saved model and dependencies
model_data = pickle.load(open('my_models/svc_model_data.pkl', 'rb'))
svc = model_data["model"]
label_encoder = model_data["label_encoder"]
symptoms_dict = model_data["symptoms_dict"]
diseases_list = model_data["diseases_list"]

# Load additional data
description = pd.read_csv('files/description.csv')
precautions = pd.read_csv("files/precautions_df.csv")
workout = pd.read_csv("files/workout_df.csv")
medications = pd.read_csv("files/medications.csv")
diets = pd.read_csv('files/diets.csv')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    symptoms = list(symptoms_dict.keys())
    return jsonify({"symptoms": symptoms})

@app.route('/predict', methods=['POST'])
def predict():
    user_symptoms = request.json.get('symptoms', [])
    input_vector = np.zeros(len(symptoms_dict))
    for symptom in user_symptoms:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
    prediction = svc.predict([input_vector])[0]
    predicted_disease = diseases_list[prediction]

    # Helper function to gather additional information
    desc = description[description['Disease'] == predicted_disease]['Description'].values[0]
    precautions_list = precautions[precautions['Disease'] == predicted_disease].iloc[0, 1:].tolist()
    medications_list = medications[medications['Disease'] == predicted_disease]['Medication'].tolist()
    diet_list = diets[diets['Disease'] == predicted_disease]['Diet'].tolist()
    workout_list = workout[workout['disease'] == predicted_disease]['workout'].tolist()

    response = {
        "disease": predicted_disease,
        "description": desc,
        "precautions": precautions_list,
        "medications": medications_list,
        "diets": diet_list,
        "workout": workout_list
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run()
