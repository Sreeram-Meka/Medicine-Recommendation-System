document.addEventListener('DOMContentLoaded', async () => {
    const symptomsListDiv = document.getElementById('symptomsList');
    const symptomsInput = document.getElementById('symptoms');
    const errorMessage = document.getElementById('errorMessage');
    const resultDiv = document.getElementById('result');

    // Fetch symptoms list from the server
    const response = await fetch('/symptoms');
    const { symptoms } = await response.json();

    // Populate symptoms in the scrollable list
    symptoms.forEach(symptom => {
        const span = document.createElement('span');
        span.textContent = symptom;
        span.addEventListener('click', () => {
            let currentSymptoms = symptomsInput.value.split(',').map(s => s.trim()).filter(Boolean);
            if (!currentSymptoms.includes(symptom)) {
                currentSymptoms.push(symptom);
                symptomsInput.value = currentSymptoms.join(', ');
            }
        });
        symptomsListDiv.appendChild(span);
    });

    // Handle form submission
    document.getElementById('predictionForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const enteredSymptoms = symptomsInput.value.split(',').map(s => s.trim());

        // Validate symptoms
        const invalidSymptoms = enteredSymptoms.filter(symptom => !symptoms.includes(symptom));
        if (invalidSymptoms.length > 0) {
            errorMessage.style.display = 'block';
            return;
        }
        errorMessage.style.display = 'none';

        // Send valid symptoms for prediction
        const predictionResponse = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: enteredSymptoms })
        });

        const data = await predictionResponse.json();

        // Generate HTML for result
        // let resultHTML = `<h3 class="text-success">Predicted Disease: ${data.disease}</h3>`;
        // resultHTML += `<p><strong>Description:</strong> ${data.description}</p>`;

        let resultHTML='';

        resultHTML += `<p><strong>Precautions:</strong></p><ul>`;
        data.precautions.forEach(p => resultHTML += `<li>${p}</li>`);
        resultHTML += `</ul>`;

        resultHTML += `<p><strong>Medications:</strong></p><ul>`;
        data.medications.forEach(m => resultHTML += `<li>${m}</li>`);
        resultHTML += `</ul>`;

        resultHTML += `<p><strong>Workout:</strong></p><ul>`;
        data.workout.forEach(w => resultHTML += `<li>${w}</li>`);
        resultHTML += `</ul>`;

        resultHTML += `<p><strong>Diets:</strong></p><ul>`;
        data.diets.forEach(d => resultHTML += `<li>${d}</li>`);
        resultHTML += `</ul>`;

        // Display result
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = resultHTML;

        // Scroll to result with transition
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
