import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Load the data (replace with your actual CSV file path)
df = pd.read_csv('Views.csv', encoding='latin1')

# Preprocess data
df['Total Views Count'] = df['Total Views Count'].str.replace(',', '').astype(float)
df['Videos Count'] = df['Videos Count'].str.replace(',', '').astype(float)
df['Next 2 Months Views'] = df['Next 2 Months Views'].str.replace(',', '').astype(float)

# Selecting features (X) and target (Y)
X = df[['Total Views Count', 'Videos Count']]
Y = df['Next 2 Months Views']

# Splitting the data into training and testing sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# Scaling features (Standardization)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Scaling the target variable (Normalization)
minmax_scaler = MinMaxScaler()
Y_train_scaled = minmax_scaler.fit_transform(Y_train.values.reshape(-1, 1))
Y_test_scaled = minmax_scaler.transform(Y_test.values.reshape(-1, 1))

# Train the Linear Regression model
model = LinearRegression()
model.fit(X_train_scaled, Y_train_scaled)

# Make predictions on the test set
predictions = model.predict(X_test_scaled)

# Evaluate the model
mse = mean_squared_error(Y_test_scaled, predictions)
mae = mean_absolute_error(Y_test_scaled, predictions)
r2 = r2_score(Y_test_scaled, predictions)

print("Mean Squared Error:", mse)
print("Mean Absolute Error:", mae)
print("R-squared:", r2)

# Save the trained model and scalers using pickle
with open('views_prediction_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

with open('scaler.pkl', 'wb') as scaler_file:
    pickle.dump(scaler, scaler_file)

with open('minmax.pkl', 'wb') as minmax_file:
    pickle.dump(minmax_scaler, minmax_file)

print("Model and scalers saved successfully.")
