from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the SVM model and vectorizer for comment classification
svm_model_path = 'svm_model.pkl'
vectorizer_path = 'tfidf_vectorizer.pkl'

try:
    svm_model = pickle.load(open(svm_model_path, 'rb'))
    vectorizer = pickle.load(open(vectorizer_path, 'rb'))
    print("SVM Model and vectorizer loaded successfully.")
except Exception as e:
    print(f"Error loading SVM model or vectorizer: {str(e)}")
    raise e

# Load the linear regression model and scalers for view prediction
view_model_path = 'views_prediction_model.pkl'
scaler_path = 'scaler.pkl'
minmax_path = 'minmax.pkl'

try:
    view_model = pickle.load(open(view_model_path, 'rb'))
    scaler = pickle.load(open(scaler_path, 'rb'))
    minmax = pickle.load(open(minmax_path, 'rb'))
    print("View prediction model and scalers loaded successfully.")
except Exception as e:
    print(f"Error loading view prediction model or scalers: {str(e)}")
    raise e

# Route for comment classification using SVM
@app.route('/predict_comments', methods=['POST'])
def predict_comments():
    try:
        # Validate incoming JSON request
        data = request.json
        if 'comments' not in data:
            return jsonify({"error": "Missing 'comments' field"}), 400

        comments = data['comments']

        # Ensure 'comments' is a list and contains data
        if not comments or not isinstance(comments, list):
            return jsonify({"error": "Comments must be a non-empty list"}), 400

        # Vectorize the comments
        features = vectorizer.transform(comments)

        # Make predictions using the SVM model
        predictions = svm_model.predict(features)

        # Return predictions as a list
        return jsonify(predictions.tolist())

    except Exception as e:
        return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

# Route for view prediction using Linear Regression
@app.route('/predict_views', methods=['POST'])
def predict_views():
    try:
        # Validate incoming JSON request
        data = request.json
        if 'views_count' not in data or 'videos_count' not in data:
            return jsonify({"error": "Missing 'views_count' or 'videos_count' field"}), 400

        views_count = data['views_count']
        videos_count = data['videos_count']

        # Create the input array
        input_data = np.array([[views_count, videos_count]])

        # Scale the input data
        input_scaled = scaler.transform(input_data)

        # Predict the next 2 months' views using the linear regression model
        prediction = view_model.predict(input_scaled)

        # Inverse transform the result
        prediction_inversed = minmax.inverse_transform(prediction.reshape(-1, 1))

        # Return the prediction
        return jsonify({'next_2_months_views': float(prediction_inversed[0][0])})

    except Exception as e:
        return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
