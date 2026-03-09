import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
from feature_engineering import get_feature_names

class RiskModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=7, random_state=42)
        self.feature_names = get_feature_names()
        self.is_trained = False
        self.accuracy = 0.0
        self.conf_matrix = []

    def _generate_synthetic_data(self, n_samples=1000):
        np.random.seed(42)
        X = pd.DataFrame(max(0, 1) * np.random.normal(size=(n_samples, len(self.feature_names))), columns=self.feature_names)
        
        # Binary features constraints
        binary_cols = ['active_status', 'strike_off_flag', 'director_disqualified', 
                       'rating_downgrade_flag', 'rating_suspended_flag', 'default_rating_flag']
        for col in binary_cols:
            if col in X.columns:
                X[col] = np.random.choice([0, 1], size=n_samples, p=[0.9, 0.1])
            
        # Realistic continuous target dependency
        risk = (
            X['ibc_risk_score'] * 0.3 + 
            X['promoter_network_score'] * 0.25 + 
            X['rating_risk_score'] * 0.2 + 
            (X['strike_off_flag'] * 2.0) +
            X['negative_news_index'] * 0.4
        )
        
        # Define 1 = default, 0 = non-default (top 20% highest risk default)
        y = (risk > np.percentile(risk, 80)).astype(int)
        return X, y

    def train(self):
        X, y = self._generate_synthetic_data()
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        self.accuracy = float(accuracy_score(y_test, y_pred))
        self.conf_matrix = confusion_matrix(y_test, y_pred).tolist()
        self.is_trained = True
        
        return {
            "accuracy": self.accuracy, 
            "confusion_matrix": self.conf_matrix
        }

    def predict_pd(self, features_dict):
        if not self.is_trained:
            self.train()
        
        df = pd.DataFrame([features_dict], columns=self.feature_names)
        pd_score = self.model.predict_proba(df)[0][1] # Probability of Class 1 (Default)
        return pd_score

risk_model_instance = RiskModel()
