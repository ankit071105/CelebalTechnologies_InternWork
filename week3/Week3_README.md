# Week 3 — Customer Intelligence System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-189AB4?style=flat-square&logo=xgboost&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![Kaggle](https://img.shields.io/badge/Kaggle-Notebook-20BEFF?style=flat-square&logo=kaggle&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=flat-square)

</div>

---

## Overview

This week focused on building an end-to-end **Customer Intelligence System** using unsupervised and supervised machine learning techniques.

The dataset contains socio-economic and health indicators for 167 countries. Since no labels exist in the dataset, the approach was:

1. Use **clustering** to discover natural groupings (segments) in the data
2. Use the cluster labels as the target variable for **classification and ensemble models**
3. Extract business-level insights from each segment

---

## Folder Structure

```
Week_03_Classification/
│
├── customer_intelligence.ipynb     ← Main Kaggle notebook
└── README.md                       ← You are here
```

---

## Dataset

| Field        | Detail                                                                                                  |
|--------------|---------------------------------------------------------------------------------------------------------|
| Source       | [Kaggle — Unsupervised Learning on Country Data](https://www.kaggle.com/datasets/rohan0301/unsupervised-learning-on-country-data) |
| File         | `Country-data.csv`                                                                                      |
| Rows         | 167 countries                                                                                           |
| Columns      | 10 (1 name + 9 numeric features)                                                                        |
| Missing Data | None                                                                                                    |

### Column Reference

| Column       | Description                                                    |
|--------------|----------------------------------------------------------------|
| `country`    | Country name                                                   |
| `child_mort` | Deaths of children under 5 per 1000 live births               |
| `exports`    | Exports of goods and services as % of GDP                      |
| `health`     | Total health spending as % of GDP                              |
| `imports`    | Imports of goods and services as % of GDP                      |
| `income`     | Net income per person (USD)                                    |
| `inflation`  | Annual inflation rate (%)                                      |
| `life_expec` | Average life expectancy (years)                                |
| `total_fer`  | Average number of children born per woman                      |
| `gdpp`       | GDP per capita (USD)                                           |

---

## Pipeline

```
Country-data.csv
        |
        |-- Exploratory Data Analysis
        |-- Preprocessing (Scaling)
        |-- PCA (Dimensionality Reduction)
        |
        |-- CLUSTERING
        |       |-- K-Means  -->  3 country segments
        |       |-- DBSCAN   -->  density-based grouping + noise detection
        |
        |-- Use K-Means labels as classification target
        |
        |-- CLASSIFICATION
        |       |-- Logistic Regression
        |       |-- Decision Tree
        |       |-- SVM (RBF kernel)
        |
        |-- ENSEMBLE LEARNING
        |       |-- Random Forest
        |       |-- Gradient Boosting
        |       |-- XGBoost
        |       |-- Random Forest (GridSearchCV tuned)
        |       |-- Voting Classifier (LR + RF + XGB combined)
        |
        |-- Full Model Comparison
        |-- Segment Intelligence Report
```

---

## Stage 1 — Exploratory Data Analysis

**What was done:**

- Computed summary statistics for all 9 numeric features
- Plotted distributions (3x3 histogram grid) to check skewness of each feature
- Built a correlation heatmap to find relationships between features
- Identified the top 15 countries by child mortality and GDP per capita using horizontal bar charts
- Scatter plots comparing GDP vs child mortality and income vs life expectancy

**Findings:**

- `child_mort` and `gdpp` are the most polarizing features — they alone visually separate rich from poor countries
- `life_expec` and `income` are strongly positively correlated
- `total_fer` (fertility rate) is strongly negatively correlated with `life_expec` and `gdpp`
- `health` spending alone is not a reliable indicator of development level

---

## Stage 2 — Preprocessing

**Steps taken:**

```python
from sklearn.preprocessing import StandardScaler

feat_cols = ['child_mort','exports','health','imports','income',
             'inflation','life_expec','total_fer','gdpp']

sc   = StandardScaler()
X_sc = sc.fit_transform(df[feat_cols])
```

- No null values were present — no imputation needed
- Applied `StandardScaler` to bring all features to the same scale
- Scaling is required because K-Means and DBSCAN both use distance metrics — unscaled features with large ranges (like `gdpp`) would dominate

---

## Stage 3 — PCA (Dimensionality Reduction)

- Ran PCA on all 9 features
- Plotted explained variance per component and cumulative variance curve
- Found that **2 components explain ~70% of variance** and **4 components explain ~90%**
- Reduced to 2 components (`X_pca`) purely for cluster visualization purposes
- The actual clustering and classification was done on all 9 scaled features

---

## Stage 4 — Clustering

### K-Means

- Ran K-Means for K = 2 to 10
- Used three metrics to select the optimal K:
  - **Inertia (Elbow Method)** — looks for the bend in the curve
  - **Silhouette Score** — measures how well-separated clusters are (higher = better)
  - **Davies-Bouldin Index** — measures cluster compactness (lower = better)
- Selected **K = 3** as the optimal number of clusters

```python
km = KMeans(n_clusters=3, random_state=42, n_init=10)
df['kmeans_cluster'] = km.fit_predict(X_sc)
```

**Segments discovered:**

| Cluster | Label          | Characteristics                                          |
|---------|----------------|----------------------------------------------------------|
| 0       | Developing     | Mid-range GDP, moderate child mortality, growing income  |
| 1       | Developed      | High GDP (>25,000), low child mortality (<8), long life expectancy (>78 yrs) |
| 2       | Underdeveloped | Low GDP (<2,500), high child mortality (>80), high fertility rate (>4.5) |

- Visualized clusters on a PCA 2D scatter plot with country name annotations
- Plotted cluster profiles (3x3 bar grid) showing mean feature value per segment

### DBSCAN

- Plotted the **K-Distance Graph** (k=5) to find the optimal `eps` value
- Ran DBSCAN with `eps=2.5`, `min_samples=5`
- DBSCAN identified outlier/noise countries that do not belong to any cluster (labeled `-1`)
- Compared K-Means and DBSCAN side-by-side on the PCA 2D projection

```python
db = DBSCAN(eps=2.5, min_samples=5)
df['dbscan_cluster'] = db.fit_predict(X_sc)
```

**Key difference:** K-Means forces every country into a cluster. DBSCAN marks unusual countries (micro-states, island economies) as noise instead of forcing them into a group they do not belong to.

---

## Stage 5 — Classification

Used K-Means cluster labels (0, 1, 2) as the target variable `y`.

**Train / Test split:** 80% train, 20% test, stratified by class.

| Model               | Notes                          |
|---------------------|--------------------------------|
| Logistic Regression | Linear decision boundary       |
| Decision Tree       | Interpretable rule-based model |
| SVM (RBF kernel)    | Non-linear margin classifier   |

For each model:
- Trained on scaled features
- Evaluated on test set: Accuracy, Precision, Recall, F1
- 5-fold cross-validation accuracy recorded
- Confusion matrix plotted for the best-performing classifier

---

## Stage 6 — Ensemble Learning

| Model                       | Method                                |
|-----------------------------|---------------------------------------|
| Random Forest               | Bagging — 100 decision trees          |
| Gradient Boosting           | Sequential boosting — 100 estimators  |
| XGBoost                     | Optimized gradient boosting           |
| Random Forest (Tuned)       | GridSearchCV — 18 combos, 5-fold CV   |
| Voting Classifier           | Hard vote — LR + RF + XGB combined    |

### Hyperparameter Tuning

```python
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth'   : [None, 5, 10],
    'max_features': ['sqrt', 'log2'],
}
gs = GridSearchCV(RandomForestClassifier(random_state=42),
                  param_grid, cv=5, scoring='accuracy', n_jobs=-1)
```

Grid size: 3 x 3 x 2 = **18 combinations x 5 folds = 90 fits**

### Feature Importance

- Plotted feature importances from both Random Forest and XGBoost
- `income`, `life_expec`, `gdpp`, and `child_mort` consistently ranked as the top 4 most important features across both models

### Voting Classifier

Combined Logistic Regression, tuned Random Forest, and XGBoost into a single hard-voting ensemble to produce the most stable predictions.

---

## Full Model Comparison

All 7 models ranked by test accuracy on a horizontal bar chart. The best model is highlighted in gold.

| Model               | Type           |
|---------------------|----------------|
| Logistic Regression | Classification |
| Decision Tree       | Classification |
| SVM                 | Classification |
| Random Forest       | Ensemble       |
| Gradient Boosting   | Ensemble       |
| XGBoost             | Ensemble       |
| RF (Tuned)          | Ensemble       |
| Voting Classifier   | Ensemble       |

---

## Segment Intelligence Report

After clustering, segment profiles were reported for all 167 countries:

- Listed every country per segment (Underdeveloped / Developing / Developed)
- Scatter plot of GDP vs Life Expectancy with segment colors and country labels
- 3x3 bar chart grid comparing segment mean values across all 9 features

---

## Issue Faced

**FileNotFoundError on Kaggle:**

```
FileNotFoundError: [Errno 2] No such file or directory:
'/kaggle/input/unsupervised-learning-on-country-data/Country-data.csv'
```

**Cause:** The dataset was not attached to the Kaggle notebook session.

**Fix:** Replace the `read_csv` line with an auto-discovery loader, or attach the dataset manually via **Add Input** in the Kaggle notebook UI.

```python
import os

csv_path = None
for dirname, _, filenames in os.walk('/kaggle/input'):
    for f in filenames:
        if f.endswith('.csv') and 'country' in f.lower():
            csv_path = os.path.join(dirname, f)

df = pd.read_csv(csv_path)
```

---

## How to Run

**On Kaggle:**

1. Open a new Kaggle notebook
2. Click **Add Input** and search `unsupervised-learning-on-country-data`
3. Upload `customer_intelligence.ipynb`
4. Click **Run All**

**Locally:**

```bash
pip install numpy pandas matplotlib seaborn scikit-learn xgboost jupyter

jupyter notebook customer_intelligence.ipynb
```

---

## Tech Stack

| Category              | Library / Tool                        |
|-----------------------|---------------------------------------|
| Data handling         | pandas, numpy                         |
| Visualization         | matplotlib, seaborn                   |
| Preprocessing         | sklearn.preprocessing.StandardScaler  |
| Dimensionality reduction | sklearn.decomposition.PCA          |
| Clustering            | sklearn.cluster.KMeans, DBSCAN        |
| Cluster evaluation    | silhouette_score, davies_bouldin_score|
| Classification        | LogisticRegression, DecisionTree, SVC |
| Ensemble learning     | RandomForest, GradientBoosting, XGBoost, VotingClassifier |
| Tuning                | GridSearchCV                          |
| Evaluation            | classification_report, ConfusionMatrixDisplay |
| Environment           | Kaggle Notebook (Python 3.10)         |

---

## Key Takeaways

- Clustering on an unlabeled dataset can create meaningful targets for supervised learning — this is a common real-world pattern when ground truth labels are unavailable.
- `gdpp`, `child_mort`, `income`, and `life_expec` are the four features that drive the most separation between country segments.
- Ensemble models (Random Forest, XGBoost) outperform single classifiers because they reduce variance through aggregation of multiple learners.
- DBSCAN is more appropriate than K-Means when the data contains outliers, since K-Means forces every point into a cluster regardless of how isolated it is.
- The Voting Classifier provides the most stable accuracy by combining the strengths of linear and non-linear models.

---

<div align="center">

![Celebal](https://img.shields.io/badge/Celebal_Technologies-ML_Internship-blue?style=flat-square)
&nbsp;&nbsp;
![Week](https://img.shields.io/badge/Week-3_of_8-orange?style=flat-square)

</div>
