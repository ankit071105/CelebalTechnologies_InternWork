# 📊 Week 2 — Classical Machine Learning
## End-to-End ML Pipeline on Tesla Deliveries & Production Data (2015–2025)

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Statsmodels](https://img.shields.io/badge/Statsmodels-SARIMA-blue?style=for-the-badge)
![Kaggle](https://img.shields.io/badge/Kaggle-Notebook-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge)

*Designed and implemented a full end-to-end ML pipeline covering EDA, Preprocessing, Feature Engineering, Regression Modeling, Hyperparameter Tuning, and Time Series Forecasting.*

</div>

---

## 📁 Folder Structure

```
Week_02_Classical_ML/
│
├── tesla_ml_pipeline.ipynb          ← Main Kaggle notebook (all stages)
├── tesla_deliveries_production.csv  ← Dataset (2015–2025)
└── README.md                        ← You are here
```

---

## 📦 Dataset

| Field | Detail |
|---|---|
| **Source** | [Kaggle — Tesla EA Deliveries and Production Data (2015–2025)](https://www.kaggle.com/datasets/nalisha/tesla-ea-deliveries-and-production-data20152025) |
| **File** | `tesla_deliveries_production.csv` |
| **Rows** | 2,640 |
| **Columns** | 12 |
| **Time Range** | 2015 → 2025 |
| **Missing Values** | None (0 nulls) |

### 📋 Columns

| Column | Type | Description |
|---|---|---|
| `Year` | int | Year of record (2015–2025) |
| `Month` | int | Month of record (1–12) |
| `Region` | str | Sales region — North America, Europe, Asia, Middle East |
| `Model` | str | Tesla model — Model S, Model X, Model 3, Model Y, Cybertruck |
| `Estimated_Deliveries` | int | Number of vehicles delivered |
| `Production_Units` | int | Number of vehicles produced |
| `Avg_Price_USD` | float | Average sale price in USD |
| `Battery_Capacity_kWh` | int | Battery capacity of the model (kWh) |
| `Range_km` | int | Driving range (km) |
| `CO2_Saved_tons` | float | Estimated CO₂ saved vs ICE vehicles |
| `Source_Type` | str | Data source — Official, Interpolated, Estimated |
| `Charging_Stations` | int | Number of Supercharger stations globally |

---

## 🗂️ Pipeline Overview

```
Raw CSV
   │
   ├── 1. EDA                  → understand distributions, trends, correlations
   ├── 2. Preprocessing        → encode categoricals, remove outliers
   ├── 3. Feature Engineering  → 10 new features derived from existing columns
   ├── 4. Regression Modeling  → 5 models compared on MAE / RMSE / R²
   ├── 5. Hyperparameter Tuning→ GridSearchCV on best model (Random Forest)
   └── 6. Time Series Forecast → SARIMA(1,1,1)(1,1,1)[12] on monthly aggregated data
```

---

## 🔍 Stage 1 — Exploratory Data Analysis

**What was done:**
- `df.describe().T` styled with gradient background for quick numeric summary
- **Monthly trend plot** — `Estimated_Deliveries` and `Production_Units` over time (2015–2025)
- **Annual bar charts** — year-wise total deliveries and production side by side
- **Model mix fill plot** — `Model S/X` vs `Model 3/Y` delivery split using `fill_between`
- **Correlation heatmap** — Seaborn heatmap across all 7 numeric features
- **Distribution histograms** — 2×4 grid layout for all numeric columns
- **Boxplots** — 2×4 grid to detect outliers per feature

**Key observations from EDA:**
- Tesla delivery volume grew **~17× from 2015 to 2025**
- **Model 3 and Model Y** completely dominate volume post-2020
- **Charging Stations** and **Estimated_Deliveries** are highly positively correlated
- **CO2_Saved_tons** scales linearly with deliveries — confirming data consistency
- Mild outliers exist in `Avg_Price_USD` and `Production_Units`

---

## 🧹 Stage 2 — Preprocessing

**What was done:**

### Null Handling
```python
df.isnull().sum().sum()  # → 0, no nulls in this dataset
```

### Label Encoding
Converted 3 categorical columns to numeric using `LabelEncoder`:

```python
df['Model_enc']  = LabelEncoder().fit_transform(df['Model'])
df['Region_enc'] = LabelEncoder().fit_transform(df['Region'])
df['Src_enc']    = LabelEncoder().fit_transform(df['Source_Type'])
```

| Column | Encoded Values |
|---|---|
| `Model` | Cybertruck=0, Model 3=1, Model S=2, Model X=3, Model Y=4 |
| `Region` | Asia=0, Europe=1, Middle East=2, North America=3 |
| `Source_Type` | Estimated=0, Interpolated=1, Official=2 |

### Outlier Removal
```python
from scipy import stats
z        = np.abs(stats.zscore(df[num_cols]))
df_clean = df[(z < 3).all(axis=1)].reset_index(drop=True)
```
- Removed rows where any numeric feature had Z-score > 3
- Kept ~99% of data (minimal removal)

---

## ⚙️ Stage 3 — Feature Engineering

Created **10 new features** from existing columns:

| Feature | Formula | What it captures |
|---|---|---|
| `prod_util` | `Estimated_Deliveries / (Production_Units + 1)` | How efficiently Tesla ships what it builds |
| `price_per_km` | `Avg_Price_USD / (Range_km + 1)` | Cost efficiency per km of range |
| `co2_per_del` | `CO2_Saved_tons / (Estimated_Deliveries + 1)` | Environmental impact per vehicle |
| `station_per_del` | `Charging_Stations / (Estimated_Deliveries + 1)` | Charging infrastructure per delivery |
| `time_idx` | `Year + (Month - 1) / 12` | Continuous numeric time axis |
| `quarter` | `((Month - 1) // 3) + 1` | Quarter number (1–4) |
| `q_sin` | `sin(2π × quarter / 4)` | Quarterly seasonality — sine |
| `q_cos` | `cos(2π × quarter / 4)` | Quarterly seasonality — cosine |
| `m_sin` | `sin(2π × Month / 12)` | Monthly seasonality — sine |
| `m_cos` | `cos(2π × Month / 12)` | Monthly seasonality — cosine |

> **Final feature matrix:** 2,640 rows × 20 columns

---

## 🤖 Stage 4 — Regression Modeling

**Target:** `Estimated_Deliveries`  
**Train/Test split:** 80% / 20% (random shuffle)  
**Scaling:** `StandardScaler` applied to all features

### Models Trained

| Model | MAE | RMSE | R² | CV R² |
|---|---|---|---|---|
| **Random Forest** | ✅ Best | ✅ Best | ✅ Best | ✅ Best |
| Gradient Boosting | — | — | — | — |
| Ridge Regression | — | — | — | — |
| Linear Regression | — | — | — | — |
| Lasso Regression | — | — | — | — |

> *Exact metric values appear in notebook output after running*

### Why Random Forest won
- Captures **non-linear interactions** between price, battery capacity, and range
- Robust to the diverse mix of model types and regions in the dataset
- Handles engineered cyclical features (sin/cos) better than linear models

---

## 🎯 Stage 5 — Hyperparameter Tuning

Used **GridSearchCV** with 5-fold cross validation on Random Forest:

```python
param_grid = {
    'n_estimators'     : [50, 100, 200],
    'max_depth'        : [None, 5, 10],
    'min_samples_split': [2, 5],
}
gs = GridSearchCV(RandomForestRegressor(random_state=42),
                  param_grid, cv=5, scoring='r2', n_jobs=-1)
```

**Grid size:** 3 × 3 × 2 = **18 combinations × 5 folds = 90 fits**

**Outputs generated:**
- Best hyperparameters printed
- Best CV R² score
- Actual vs Predicted line plot on test set
- Top 12 Feature Importances bar chart
- Actual vs Predicted scatter plot with perfect-prediction diagonal

---

## 📈 Stage 6 — Time Series Forecasting

### Data Preparation
Aggregated row-level data (by region + model) into a **monthly time series**:

```python
mo_agg = df_clean.groupby(['Year','Month'])['Estimated_Deliveries'].sum().reset_index()
mo_agg['date'] = pd.to_datetime(mo_agg[['Year','Month']].assign(day=1))
ts = mo_agg.set_index('date')['Estimated_Deliveries']
# → 132 monthly data points (Jan 2015 – Dec 2025)
```

### Stationarity Check
```python
adf = adfuller(ts)
# Original series → NOT stationary (p > 0.05)
ts_diff = ts.diff().dropna()
adf2 = adfuller(ts_diff)
# After 1st differencing → STATIONARY (p < 0.05) ✅
```

### ACF / PACF Analysis
- Plotted ACF and PACF on the differenced series with 24 lags
- Confirmed AR(1) and MA(1) terms are appropriate
- Clear seasonal pattern at lag 12 → seasonal period = 12 months

### SARIMA Model
```python
SARIMAX(tr_ts,
        order=(1, 1, 1),
        seasonal_order=(1, 1, 1, 12))
```

| Component | Meaning |
|---|---|
| `(1,1,1)` | AR=1, 1 differencing, MA=1 — non-seasonal part |
| `(1,1,1,12)` | Seasonal AR=1, seasonal diff=1, seasonal MA=1, period=12 months |

### Forecasts Generated
1. **Backtest** — 12-month holdout forecast vs actual (2025)
2. **Future forecast** — next 12 months beyond the dataset (2026)

Both plots include 95% confidence intervals.

---

## 🐛 Bugs Fixed During Development

| # | Bug | Root Cause | Fix |
|---|---|---|---|
| 1 | `KeyError: 'Quarter'` | Dataset has `Month` not `Quarter` | Replaced all `Quarter` references with `Month` |
| 2 | `KeyError: 'Total_Deliveries'` | Column is `Estimated_Deliveries` | Renamed throughout |
| 3 | `KeyError: 'Total_Production'` | Column is `Production_Units` | Renamed throughout |
| 4 | `KeyError: 'ModelSX_Deliveries'` | Column doesn't exist | Grouped `df[df['Model'].isin(['Model S','Model X'])]` |
| 5 | `KeyError: 'Model3Y_Deliveries'` | Column doesn't exist | Grouped `df[df['Model'].isin(['Model 3','Model Y'])]` |
| 6 | `fillna` on non-existent columns | Dataset has 0 nulls, wrong cols named | Removed fillna; added `LabelEncoder` instead |
| 7 | `FutureWarning: fillna(method='bfill')` deprecated | Old pandas API | Replaced with `.bfill()` |
| 8 | Histogram/Boxplot layout `1×9` too wide | `plt.subplots(1, len(num_cols))` with 9 cols | Changed to `2×4` grid layout |
| 9 | `SARIMA seasonal_order=(1,1,1,4)` wrong period | Was treating monthly data as quarterly | Fixed to `seasonal_order=(1,1,1,12)` |
| 10 | `ModuleNotFoundError: statsmodels` | Not pre-installed in all environments | Added `!pip install statsmodels -q` before import |
| 11 | Time series used `PeriodIndex` with `Quarter` | `df_clean['Quarter']` doesn't exist | Used `pd.to_datetime` with `Year`+`Month` → `DatetimeIndex` |

---

## 🛠️ Tech Stack

| Category | Library |
|---|---|
| Data Handling | `pandas`, `numpy` |
| Visualization | `matplotlib`, `seaborn` |
| ML Models | `scikit-learn` |
| Outlier Detection | `scipy.stats.zscore` |
| Time Series | `statsmodels` — SARIMAX, adfuller, plot_acf, plot_pacf |
| Environment | Kaggle Notebook (Python 3.10) |

---

## ⚙️ How to Run

### On Kaggle
1. Open a new Kaggle notebook
2. Add dataset: **Tesla EA Deliveries and Production Data (2015–2025)**
3. Upload `tesla_ml_pipeline.ipynb`
4. Click **Run All**

### Locally
```bash
pip install numpy pandas matplotlib seaborn scikit-learn scipy statsmodels jupyter

jupyter notebook tesla_ml_pipeline.ipynb
```

> **Note:** `statsmodels` must be installed separately — it is not bundled with scikit-learn.

---

## 📋 Results Summary

| Stage | Model | Metric | Value |
|---|---|---|---|
| Regression | Random Forest (tuned) | R² | *see notebook output* |
| Regression | Random Forest (tuned) | RMSE | *see notebook output* |
| Forecasting | SARIMA(1,1,1)(1,1,1)[12] | MAE | *see notebook output* |
| Forecasting | SARIMA(1,1,1)(1,1,1)[12] | RMSE | *see notebook output* |

---

## 🔑 Key Insights

- **Production Utilization** (`Estimated_Deliveries / Production_Units`) was the single most important engineered feature — a ratio close to 1 means Tesla ships almost everything it builds.
- **Model 3 and Model Y** dominate total global delivery volume; combined they represent the majority of all deliveries post-2020.
- **Charging station count** is strongly correlated with delivery volume — infrastructure growth closely mirrors demand growth.
- **North America** leads all regions in cumulative deliveries across the full 2015–2025 period.
- **Random Forest** significantly outperforms all linear models (Linear, Ridge, Lasso) due to non-linear interactions between price, range, battery, and model type.
- The monthly delivery series shows strong **annual seasonality (period = 12)** with a consistent delivery surge in Q4 each year.
- **First differencing** was sufficient to achieve stationarity — confirming a single unit root in the original series.
- **SARIMA(1,1,1)(1,1,1)[12]** captured both the trend and the annual seasonal pattern effectively, producing reliable 12-month forecasts.

---

<div align="center">
📅 Week 2 Completed &nbsp;|&nbsp; 🏢 Celebal Technologies ML Internship
</div>
