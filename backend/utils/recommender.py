def get_recommendations(selected_concerns, model):
    features = model["features"]
    clf = model["classifier"]

    input_vector = [1 if concern in selected_concerns else 0 for concern in features]
    result = clf.predict([input_vector])
    return result[0] if isinstance(result, list) else [result]
