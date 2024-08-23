from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load your trained model and vectorizer
model = pickle.load(open('svm_model.pkl', 'rb'))
vectorizer = pickle.load(open('tfidf_vectorizer.pkl', 'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    comments = data['comments']

    # Transform comments using the loaded vectorizer
    features = vectorizer.transform(comments)
    
    # Predict the categories
    predictions = model.predict(features)

    # Return the predictions
    return jsonify(predictions.tolist())

if __name__ == '__main__':
    app.run(debug=True, port=5001)
