# 📘 Week 1 — Python & ML Foundations

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge)

</div>

---

## 📌 Overview

This week covers the **mathematical and programming foundations** required for Machine Learning.
All topics are implemented from scratch in a single Jupyter Notebook assignment without using high-level ML libraries.

---

## 📁 Folder Structure

```
Week_01_Python/
│
├── week1_assignment.ipynb     ← Main assignment (all 6 parts)
├── requirements.txt
└── README.md                  ← You are here
```

---

## 🗂️ Topics Covered

### Part 1 — Python Fundamentals

| Section | Topic | Key Concept |
|---|---|---|
| 1.1 | Data Types & Control Flow | `if / elif / else` classification logic |
| 1.2 | Data Structures | `dict`, `set`, list comprehension |
| 1.3 | Exceptions | `try / except`, `raise TypeError` |
| 1.4 | Functions & Lambdas | Higher-order functions, `lambda` expressions |

---

### Part 2 — NumPy

| Section | Topic | Key Concept |
|---|---|---|
| 2.1 | Array Creation & Shapes | `np.arange`, `.reshape`, `ndim`, `dtype` |
| 2.2 | Indexing & Slicing | Row/col extract, submatrix, boolean indexing |
| 2.3 | Operations & Dot Product | `*` vs `@`, `np.dot`, scalar multiplication |

---

### Part 3 — Pandas

| Section | Topic | Key Concept |
|---|---|---|
| 3.1 | DataFrames vs Series | `df['col']` vs `df[['col1','col2']]` |
| 3.2 | iloc & loc | Position-based vs label-based selection |
| 3.3 | Filtering & Group By | Boolean filter, `.groupby().agg()` |
| 3.4 | Missing Data | `.fillna()`, `.dropna()`, median/mean imputation |

---

### Part 4 — Linear Algebra

| Section | Topic | Key Concept |
|---|---|---|
| 4.1 | Vectors & Matrices | L2 norm, `np.linalg.norm`, `quiver` plot |
| 4.2 | Matrix Operations | Addition, scalar mult, matrix mult, non-commutativity |
| 4.3 | Eigenvalues & Eigenvectors | `np.linalg.eig`, verify `Av = λv` |
| 4.4 | SVD & Dimensionality Reduction | `np.linalg.svd`, reconstruction, rank-1 approximation |

---

### Part 5 — Statistics

| Section | Topic | Key Concept |
|---|---|---|
| 5.1 | Descriptive Statistics | Mean, Median, Std, IQR, histogram + KDE |
| 5.2 | Hypothesis Testing | One-sample t-test, Pearson correlation |
| 5.3 | Error Metrics | MAE, MSE, RMSE, R², Adjusted R² from scratch |
| 5.4 | Distribution Testing | KS test, ADF test, stationarity, differencing |
| 5.5 | Model Monitoring | PSI (Population Stability Index), concept drift |

---

### Part 6 — Probability Theory

| Section | Topic | Key Concept |
|---|---|---|
| 6.1 | Core Concepts | Sample space, joint & conditional probability, independence |
| 6.2 | Distributions | Normal, Binomial, Poisson — PDFs & PMFs |
| 6.3 | Bayes' Theorem | Prior, Likelihood, Evidence, Posterior — spam filter |
| 6.4 | Central Limit Theorem | Sample means → Normal, KS verification |

---

## ✅ Assignment Checklist

- [x] Part 1 — Python Fundamentals (1.1 → 1.4)
- [x] Part 2 — NumPy (2.1 → 2.3)
- [x] Part 3 — Pandas (3.1 → 3.4)
- [x] Part 4 — Linear Algebra (4.1 → 4.4)
- [x] Part 5 — Statistics (5.1 → 5.5)
- [x] Part 6 — Probability Theory (6.1 → 6.4)
- [x] All `assert` blocks pass
- [x] All plots have labels and titles
- [x] All markdown explanation cells filled
- [x] Notebook runs clean top to bottom

---

## 💡 Key Concepts Learned

**Python**
- `dict.get(key, default)` is the cleanest way to build a frequency counter without `Counter`.
- `isinstance(x, (int, float))` catches both numeric types in one check.
- Higher-order functions like `apply_twice(f, x)` are the foundation of functional programming in ML pipelines.

**NumPy**
- `arr.reshape(r, c)` shares memory with the original — no copy made.
- Boolean indexing (`arr[arr > 7]`) is vectorized and faster than any Python loop.
- `A * B` is element-wise; `A @ B` is true matrix multiplication — never confuse them.

**Pandas**
- `iloc` uses integer positions; `loc` uses index labels — they are not interchangeable.
- Always impute with `median` for salary/skewed data and `mean` for approximately normal data.
- `.groupby().agg()` lets you compute multiple aggregations in one pass.

**Linear Algebra**
- An **eigenvector** is a direction that a matrix only *scales*, never rotates.
- The **eigenvalue** λ tells by how much — stretch (λ>1), shrink (0<λ<1), or flip (λ<0).
- **SVD** decomposes any matrix `X = U Σ Vᵀ`. The rows of `Vt` are the **principal components** in PCA.
- A **rank-1 approximation** keeps only the largest singular value — capturing the most variance with the least data.

**Statistics**
- **IQR = Q3 − Q1** is robust to outliers unlike standard deviation.
- **p-value < 0.05** → reject H₀ at the 5% significance level.
- **Pearson r** measures only *linear* relationships — always plot before concluding.
- **PSI > 0.2** signals major distribution shift in production → retrain the model.
- **ADF test** — fail to reject H₀ means the series is *non-stationary*; first differencing usually fixes it.

**Probability**
- Draws *without* replacement are **not independent** because the sample space shrinks.
- **Bayes' theorem**: `P(A|B) = P(B|A) × P(A) / P(B)` — update beliefs with evidence.
- **CLT**: sample means from *any* distribution converge to Normal as `n → ∞`. This is why t-tests work on non-normal data.
- The **Poisson distribution** models rare counts per interval; **Binomial** models counts of successes in `n` trials.

---

## 📊 Results & Outputs

| Metric | Value |
|---|---|
| Total Assertion Tests | **15 passed ✅** |
| Execution Errors | **0** |
| Plots Generated | 8 |
| Parts Completed | 6 / 6 |

---

## 🧪 How to Run

```bash
# Install dependencies
pip install numpy pandas matplotlib scipy statsmodels jupyter

# Launch notebook
jupyter notebook week1_assignment.ipynb
```

Or open in Google Colab:
> Upload `week1_assignment.ipynb` → Runtime → Run All

---

## 📚 References

| Topic | Resource |
|---|---|
| NumPy | https://numpy.org/doc/stable/ |
| Pandas | https://pandas.pydata.org/docs/ |
| SciPy Stats | https://docs.scipy.org/doc/scipy/reference/stats.html |
| Statsmodels ADF | https://www.statsmodels.org/stable/generated/statsmodels.tsa.stattools.adfuller.html |
| Linear Algebra (3Blue1Brown) | https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab |
| Bayes' Theorem | https://en.wikipedia.org/wiki/Bayes%27_theorem |
| Central Limit Theorem | https://en.wikipedia.org/wiki/Central_limit_theorem |

---

<div align="center">
📅 Week 1 Completed &nbsp;|&nbsp; 🏢 Celebal Technologies ML Internship
</div>
