import pickle
from sklearn.svm import SVC
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

# Load your data (example)
df = pd.read_csv('outputfile.csv')
X = df['comments']
Y = df['category']

# Example preprocessing and model training
vectorizer = TfidfVectorizer(min_df=1, stop_words='english', lowercase=True)
X_feature = vectorizer.fit_transform(X)

model = SVC()
model.fit(X_feature, Y)

# Save the model and vectorizer
with open('svm_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
