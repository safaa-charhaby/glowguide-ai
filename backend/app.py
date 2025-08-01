import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
app = Flask(__name__)
CORS(app)

# === Load ML Model ===
model = joblib.load('saved_model_final/final_model.joblib')  # Adjust if needed
expected_feature_length = 15  # Change to match your model input size

# === Ingredient labels your model outputs ===
ingredient_names = [
    'hyaluronic', 'niacinamide', 'peptide', 'vitamin_c', 'ceramide', 'retinol',
    'aha_bha', 'antioxidant', 'mineral_spf', 'growth_factor', 'probiotic',
    'hydrating', 'emollient', 'preservative', 'texture_stabilizer',
    'fragrance', 'solvent', 'ph_adjuster', 'colorant', 'skin_soothing',
    '2_hexanediol', 'glyceryl_caprylate', 'hydroxyacetophenone',
    'titanium_dioxide', 'peg_100_stearate'
]

# === Load product database ===
products_df = pd.read_csv('datasheet.csv')  # Change filename as needed


# === ML Prediction Endpoint ===
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data.get('features', [])

    if not features or len(features) != expected_feature_length:
        return jsonify({"error": "Invalid input features"}), 400

    prediction = model.predict([features])  # 2D array expected

    ingredients_recommendation = {
        ingredient_names[i]: 'Yes' if val == 1 else 'No'
        for i, val in enumerate(prediction[0])
    }
    print(ingredients_recommendation)

    return jsonify({"ingredients": ingredients_recommendation})

products_df['ingredients_list'] = products_df['ingridients'].fillna('').apply(
    lambda x: [i.strip().lower() for i in x.split(',')] if x else []
)
# Mapping of ingredient groups to actual ingredient keywords
ingredient_groups = {
    'hyaluronic': ['hyaluronic acid', 'sodium hyaluronate'],
    'niacinamide': ['niacinamide'],
    'peptide': ['peptide', 'palmitoyl tripeptide', 'acetyl hexapeptide'],
    'vitamin_c': ['ascorbic acid', 'ascorbyl tetraisopalmitate', 'magnesium ascorbyl phosphate'],
    'ceramide': ['ceramide'],
    'retinol': ['retinol', 'retinyl palmitate'],
    'aha_bha': ['glycolic acid', 'salicylic acid', 'lactic acid', 'citric acid'],
    'antioxidant': ['tocopherol', 'vitamin e', 'ascorbyl palmitate', 'green tea extract'],
    'mineral_spf': ['titanium dioxide', 'zinc oxide'],
    'growth_factor': ['growth factor'],
    'probiotic': ['lactobacillus', 'bifida ferment'],
    'hydrating': ['glycerin', 'propandiol', 'butylene glycol'],
    'emollient': ['caprylyl glycol', 'glyceryl stearate'],
    'preservative': ['phenoxyethanol', 'methylparaben', 'potassium sorbate'],
    'texture_stabilizer': ['xanthan gum', 'carbomer'],
    'fragrance': ['parfum', 'fragrance', 'linalool', 'limonene'],
    'solvent': ['propylene glycol', 'ethanol'],
    'ph_adjuster': ['triethanolamine', 'ammonium hydroxide'],
    'colorant': ['ci 75810', 'ci 19140'],
    'skin_soothing': ['aloe barbadensis', 'panthenol', 'chamomilla'],
    '2_hexanediol': ['1,2-hexanediol'],
    'glyceryl_caprylate': ['glyceryl caprylate'],
    'hydroxyacetophenone': ['hydroxyacetophenone'],
    'titanium_dioxide': ['titanium dioxide'],
    'peg_100_stearate': ['peg-100 stearate'],
}
@app.route('/filter-products', methods=['POST'])
def filter_products():
    data = request.get_json()
    
    # Step 1: Get predicted group keys like "preservative", "hydrating", etc.
    predicted_groups = data.get('ingredients', {})  # from ML prediction
    
    if not predicted_groups:
        return jsonify({"error": "No ingredient groups provided"}), 400

    # Separate groups
    selected_groups = [k for k, v in predicted_groups.items() if v == 'Yes']
    excluded_groups = [k for k, v in predicted_groups.items() if v != 'Yes']

    # Expand to real ingredient names
    required_ingredients = [ing.lower() for group in selected_groups for ing in ingredient_groups.get(group, [])]
    forbidden_ingredients = [ing.lower() for group in excluded_groups for ing in ingredient_groups.get(group, [])]
   
    # Define product matcher
    def product_matches(ingredient_list):
        ingredient_list = [i.lower() for i in ingredient_list]

        # Check if at least one required ingredient is present
        has_required = False
        for req in required_ingredients:
            for ing in ingredient_list:
                if req in ing:
                    has_required = True
                    break
            if has_required:
                break

        # Check that no forbidden ingredient is present
        no_forbidden = True
        for forbidden in forbidden_ingredients:
            for ing in ingredient_list:
                if forbidden in ing:
                    no_forbidden = False
                    break
            if not no_forbidden:
                break

        return has_required and no_forbidden

    

    

    # Step 5: Filter
    filtered = products_df[products_df['ingredients_list'].apply(product_matches)]



    product_names = filtered['name'].tolist()  # remplace 'product_name' par le vrai nom de la colonne si différent
    product_brand= filtered["brand"].tolist()
    product_type= filtered["type"].tolist()
    products = [
    {"name": name, "brand": brand, "type": type}
    for name, brand,type in zip(product_names, product_brand, product_type)]
    return jsonify({"products": products})



if __name__ == "__main__":
    app.run(debug=True)
