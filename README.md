# Flask Backend with Machine Learning (Joblib) + React Frontend

Ce projet utilise **Flask** comme backend API, un **modèle de machine learning sauvegardé avec joblib**, et un **frontend React + Vite** dans le même dossier.

---

## 📁 Structure du projet

```
derma_ai/
├── backend/
│   ├── app.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── utils/
│   │   └── recommender.py
│   └── model/
│       └── final_model.joblib
│
├── frontend/   # React + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🧠 Modèle de Machine Learning

Le modèle est entraîné à partir d’un **fichier CSV** et sauvegardé sous forme de fichier **`.joblib`**.

### ➤ Contenu du fichier `final_model.joblib`

Selon ton choix, il peut contenir :

### Option 1️⃣ : uniquement le modèle

```python
final_model.joblib = sklearn_model
```

Dans ce cas, la liste des features (skin concerns) est définie manuellement dans le code.

### Option 2️⃣ (recommandée) : modèle + métadonnées

```python
{
  "features": ["Acne", "Hydrating", "Anti-Aging", ...],
  "classifier": trained_model,
  "label_binarizer": mlb  # si multi-label
}
```

---

## 🏋️ Entraînement du modèle (`train_model.py`)

```python
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

# Charger le CSV
df = pd.read_csv("model/data.csv")

X = df.drop(columns=["Recommended Ingredients"])
y_raw = df["Recommended Ingredients"].apply(lambda x: x.split(";"))

mlb = MultiLabelBinarizer()
y = mlb.fit_transform(y_raw)

model = RandomForestClassifier()
model.fit(X, y)

model_data = {
    "features": list(X.columns),
    "classifier": model,
    "label_binarizer": mlb
}

joblib.dump(model_data, "model/final_model.joblib")
```

Lancer l'entraînement :

```bash
python train_model.py
```

---

## 🚀 Backend Flask (`app.py`)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from utils.recommender import get_recommendations

app = Flask(__name__)
CORS(app)

model_data = joblib.load("model/final_model.joblib")

@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    concerns = data.get("concerns", [])
    recommendations = get_recommendations(concerns, model_data)
    return jsonify({"recommendations": recommendations})

if __name__ == "__main__":
    app.run(debug=True)
```

Démarrer le backend :

```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## 🔁 Logique de recommandation (`utils/recommender.py`)

```python
def get_recommendations(selected_concerns, model_data):
    features = model_data["features"]
    model = model_data["classifier"]
    mlb = model_data.get("label_binarizer")

    input_vector = [1 if f in selected_concerns else 0 for f in features]
    prediction = model.predict([input_vector])

    if mlb:
        return list(mlb.inverse_transform(prediction)[0])
    return prediction.tolist()
```

---

## 🌐 Connexion avec React

### Exemple d’appel API côté React :

```js
fetch("/api/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    concerns: ["Acne", "Hydrating"]
  })
})
.then(res => res.json())
.then(data => console.log(data.recommendations));
```

---

## ✅ Résumé

* Le **CSV** sert à entraîner le modèle
* Le modèle est sauvegardé avec **joblib**
* Flask charge le modèle et expose une API REST
* React consomme l’API via `/api/recommend`

---

📌 Tu peux maintenant déployer ou améliorer ton modèle facilement.
