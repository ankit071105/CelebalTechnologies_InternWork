# Week 4 — Intro to Deep Learning
## CIFAR-10 Image Classification — ANN vs CNN

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10--3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![Keras](https://img.shields.io/badge/Keras-Deep_Learning-D00000?style=flat-square&logo=keras&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Datasets-FFD21E?style=flat-square&logo=huggingface&logoColor=black)
![Colab](https://img.shields.io/badge/Google_Colab-Recommended-F9AB00?style=flat-square&logo=googlecolab&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=flat-square)

</div>

---

## Overview

This week covered the fundamentals of deep learning by building and comparing two architectures on the **CIFAR-10 image classification dataset**:

- **ANN (Artificial Neural Network)** — treats images as flat vectors, ignores spatial structure
- **CNN (Convolutional Neural Network)** — preserves 2D spatial structure using convolution and pooling
- **CNN with Data Augmentation** — applies random transformations during training to improve generalization

The goal was to understand why CNN outperforms ANN on image tasks and how training strategies like dropout, batch normalization, and data augmentation affect performance.

---

## Folder Structure

```
Week_04_Intro_to_DL/
│
├── CIFAR10_ANN_CNN.ipynb     ← Main notebook (ANN + CNN + Augmentation)
└── README.md                 ← You are here
```

---

## Dataset

| Field        | Detail                                                  |
|--------------|---------------------------------------------------------|
| Name         | CIFAR-10                                                |
| Source       | HuggingFace — `uoft-cs/cifar10`                         |
| Train images | 50,000                                                  |
| Test images  | 10,000                                                  |
| Image size   | 32 × 32 × 3 (color)                                     |
| Classes      | 10                                                      |
| Labels       | airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck |

### How Data Was Loaded

The original `tf.keras.datasets.cifar10.load_data()` was taking 6+ hours to download due to slow server speed. The dataset was instead loaded from HuggingFace:

```python
from datasets import load_dataset
import numpy as np

ds   = load_dataset('uoft-cs/cifar10')
x_tr = np.array([np.array(i) for i in ds['train']['img']])
y_tr = np.array(ds['train']['label'])
x_te = np.array([np.array(i) for i in ds['test']['img']])
y_te = np.array(ds['test']['label'])
```

**Important difference from tf.keras loading:**
HuggingFace returns labels as a flat 1D array, not a 2D column. So `y_tr[i]` is used directly instead of `y_tr[i][0]`.

---

## Pipeline

```
CIFAR-10 (HuggingFace)
        |
        |-- Visualize sample images
        |-- Normalize pixels 0-255 → 0-1
        |-- Flatten for ANN  (50000, 3072)
        |-- Keep 3D for CNN  (50000, 32, 32, 3)
        |
        |-- ANN
        |       Dense(512) → Dropout(0.3) → Dense(256) → Dense(10)
        |       Train 10 epochs → Evaluate
        |
        |-- CNN
        |       Conv2D(32) → BatchNorm → MaxPool
        |       Conv2D(64) → BatchNorm → MaxPool
        |       Conv2D(128) → Flatten → Dense(128) → Dropout(0.4) → Dense(10)
        |       Train 10 epochs → Evaluate
        |
        |-- Learning Curve Comparison (Accuracy + Loss)
        |
        |-- CNN with Data Augmentation
        |       RandomFlip + RandomRotation + RandomZoom → CNN
        |       Train 10 epochs → Evaluate
        |
        |-- Prediction grid on 16 test images
        |-- Final comparison table + bar chart
```

---

## Stage 1 — Preprocessing

Two versions of the data were prepared:

```python
x_tr_n = x_tr / 255.0          # normalized (0-1), shape (50000, 32, 32, 3) — for CNN
x_tr_f = x_tr_n.reshape(len(x_tr_n), -1)   # flattened, shape (50000, 3072) — for ANN
```

- **Normalization** brings all pixel values to the same scale so gradient descent converges faster
- **Flattening** is required for ANN because Dense layers expect 1D input per sample

---

## Stage 2 — ANN Model

ANN receives a flat vector of 3072 values per image (32 × 32 × 3). It has no knowledge of which pixels are neighbors.

```
Input (3072)
    → Dense(512, relu)
    → Dropout(0.3)
    → Dense(256, relu)
    → Dense(10, softmax)
```

- Trained for 10 epochs, batch size 64, 10% validation split
- Dropout(0.3) randomly disables 30% of neurons each step to reduce overfitting

---

## Stage 3 — CNN Model

CNN receives the full 2D image (32, 32, 3). Convolution filters slide across the image to detect edges, textures, and shapes at different scales.

```
Input (32, 32, 3)
    → Conv2D(32, 3x3, relu) → BatchNorm → MaxPool(2x2)
    → Conv2D(64, 3x3, relu) → BatchNorm → MaxPool(2x2)
    → Conv2D(128, 3x3, relu)
    → Flatten
    → Dense(128, relu)
    → Dropout(0.4)
    → Dense(10, softmax)
```

**Why CNN is better than ANN for images:**

| ANN | CNN |
|-----|-----|
| Flattens image — loses 2D structure | Preserves spatial relationships |
| Every pixel connected to every neuron | Filters scan local regions only |
| Cannot detect position-independent patterns | Detects same feature anywhere in image |
| High parameter count, low efficiency | Fewer parameters, learns hierarchically |

**Batch Normalization:**
Normalizes layer outputs during training. This stabilizes gradients, allows higher learning rates, and helps the network converge faster.

---

## Stage 4 — Learning Curve Comparison

Plotted on two side-by-side charts:
- Left: Train accuracy and Val accuracy for both ANN and CNN across 10 epochs
- Right: Train loss and Val loss for both ANN and CNN across 10 epochs

CNN shows significantly faster accuracy improvement and lower final loss compared to ANN.

---

## Stage 5 — Data Augmentation

A data augmentation pipeline was added before the CNN layers:

```python
aug = tf.keras.Sequential([
    layers.RandomFlip('horizontal'),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1)
])
```

| Transform | Effect |
|-----------|--------|
| RandomFlip (horizontal) | Mirrors the image left to right |
| RandomRotation (0.1) | Rotates image up to 10% of full rotation |
| RandomZoom (0.1) | Zooms in or out by up to 10% |

Augmentation is only applied during training, not during evaluation. It makes the model see more variation in training data, reducing overfitting and improving test accuracy.

---

## Stage 6 — Predictions

Ran CNN predictions on the first 16 test images and displayed them in a 2×8 grid:
- Title shown in **green** if prediction is correct
- Title shown in **red** if prediction is wrong

```python
preds = np.argmax(cnn.predict(x_te_n[:16]), axis=1)
```

---

## Final Results

| Model | Test Accuracy | Test Loss |
|-------|--------------|-----------|
| ANN | *see notebook output* | *see notebook output* |
| CNN | *see notebook output* | *see notebook output* |
| CNN + Augmentation | *see notebook output* | *see notebook output* |

Expected ranges based on 10 epochs:

| Model | Expected Accuracy |
|-------|-------------------|
| ANN | ~50–55% |
| CNN | ~72–78% |
| CNN + Augmentation | ~70–76% (better generalization, less overfitting) |

---

## Issues Faced

### Issue 1 — TensorFlow ImportError on Python 3.13

```
ImportError: cannot import name 'runtime_version' from 'google.protobuf'
```

**Cause:** TensorFlow does not support Python 3.13 yet.

**Fix:** Use Python 3.11 with a virtual environment, or run on Google Colab which uses Python 3.10.

```bash
python3.11 -m venv tf_env
source tf_env/bin/activate
pip install tensorflow==2.15.0
```

---

### Issue 2 — CIFAR-10 download taking 6+ hours

```
Downloading data from https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz
1703936/170498071 ━━━━━━━━━━━━━━━━━━━━ 1:56:37 41us/step
```

**Cause:** Slow connection to the University of Toronto server that hosts the dataset.

**Fix:** Load from HuggingFace instead — much faster CDN.

```bash
pip install datasets
```

```python
from datasets import load_dataset
ds = load_dataset('uoft-cs/cifar10')
```

---

### Issue 3 — KeyError on y_tr[i][0]

```
KeyError: "Invalid key: 0. Please first select a split."
```

**Cause:** `tf.keras.datasets` returns labels with shape `(50000, 1)` so `y_tr[i][0]` is needed.
HuggingFace returns labels with shape `(50000,)` so `y_tr[i][0]` raises a KeyError.

**Fix:** Remove `[0]` everywhere labels are indexed.

```python
# wrong
plt.title(cls[y_tr[i][0]])
if preds[i] == y_te[i][0]

# correct
plt.title(cls[y_tr[i]])
if preds[i] == y_te[i]
```

---

## How to Run

**On Google Colab (recommended):**

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Upload `CIFAR10_ANN_CNN.ipynb`
3. Runtime → Change runtime type → T4 GPU
4. Run All

**Locally (Python 3.11 required):**

```bash
python3.11 -m venv tf_env
source tf_env/bin/activate
pip install tensorflow datasets numpy pandas matplotlib jupyter
jupyter notebook CIFAR10_ANN_CNN.ipynb
```

---

## Tech Stack

| Category | Library |
|----------|---------|
| Deep learning framework | TensorFlow 2.x, Keras |
| Dataset loading | HuggingFace `datasets` |
| Data handling | NumPy, Pandas |
| Visualization | Matplotlib |
| Environment | Google Colab / Python 3.11 venv |

---

## Key Takeaways

- ANN cannot learn spatial patterns — it sees a 32×32 image as 3072 unrelated numbers.
- CNN uses local filters that detect edges and shapes regardless of position — this is why it performs ~20% better than ANN on CIFAR-10.
- Batch Normalization stabilizes training and lets deeper networks converge reliably.
- Dropout prevents overfitting by randomly dropping neurons during training.
- Data Augmentation acts as a regularizer — the model never sees the exact same image twice, which forces it to generalize better.
- Python version compatibility matters for TensorFlow — always use Python 3.10 or 3.11.

---

<div align="center">

![Celebal](https://img.shields.io/badge/Celebal_Technologies-ML_Internship-blue?style=flat-square)
&nbsp;&nbsp;
![Week](https://img.shields.io/badge/Week-4_of_8-orange?style=flat-square)

</div>
