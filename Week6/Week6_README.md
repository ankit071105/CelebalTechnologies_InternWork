# Week 6 — AE and GAN
## Project: Autoencoder for Image Denoising on MNIST

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![Keras](https://img.shields.io/badge/Keras-Deep_Learning-D00000?style=flat-square&logo=keras&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-Visualization-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=flat-square)

</div>

---

## Overview

This project builds a **Convolutional Autoencoder** that learns to remove Gaussian noise from MNIST handwritten digit images.

The model is trained by giving it a **noisy image as input** and a **clean image as the target**. After training, when the model sees a corrupted image it has never seen before, it reconstructs the clean digit from it.

This is a practical demonstration of the **Encoder-Decoder** architecture taught in Week 6.

---

## Folder Structure

```
Week_06_AE_and_GAN/
│
├── week6.ipynb   
└── README.md                   
```

---

## Dataset

| Field        | Detail                                  |
|--------------|-----------------------------------------|
| Name         | MNIST Handwritten Digits                |
| Source       | `tf.keras.datasets.mnist` (built-in)    |
| Train images | 60,000                                  |
| Test images  | 10,000                                  |
| Image size   | 28 × 28 × 1 (grayscale)                 |
| Classes      | 10 digits (0 to 9)                      |
| Download     | ~11 MB, automatic, cached after first run |

Labels are not used in this project. The autoencoder is fully unsupervised — it only uses the pixel values of images.

---

## What is an Autoencoder

An autoencoder is a neural network with two parts:

```
Input Image
     |
  [ Encoder ]  →  compresses image into a small latent vector
     |
  Latent Space  (compressed representation)
     |
  [ Decoder ]  →  reconstructs the image from the latent vector
     |
Output Image
```

For denoising, the trick is:
- Feed **noisy image** as input
- Set **clean image** as the target
- The model is forced to learn which parts of the image are real signal and which are noise

---

## Pipeline

```
MNIST Dataset (60,000 images)
        |
        |-- Normalize  0-255 → 0-1
        |-- Reshape  (28,28) → (28,28,1)
        |
        |-- Add Gaussian Noise  (noise_factor = 0.5)
        |-- Clip values to [0, 1]
        |
        |-- Visualize: Clean vs Noisy
        |
        |-- Build Encoder
        |       Conv2D(32, 3×3, relu) → MaxPool(2×2)  →  (14,14,32)
        |       Conv2D(64, 3×3, relu) → MaxPool(2×2)  →  (7,7,64)
        |
        |-- Build Decoder
        |       Conv2DTranspose(64, 3×3, stride=2)  →  (14,14,64)
        |       Conv2DTranspose(32, 3×3, stride=2)  →  (28,28,32)
        |       Conv2D(1, 3×3, sigmoid)             →  (28,28,1)
        |
        |-- Train
        |       Input  : noisy images
        |       Target : clean images
        |       Loss   : Binary Cross-Entropy
        |       Optimizer: Adam
        |       Epochs : 20  |  Batch: 128
        |
        |-- Evaluate
        |       Training loss curve
        |       Noisy → Denoised → Original comparison grid
        |       PCA of latent space
        |       MSE per digit class
        |       Noise level comparison (0.1 to 0.9)
```

---

## Architecture

### Encoder

Compresses the input image from **(28, 28, 1)** down to **(7, 7, 64)**.

| Layer | Output Shape | Operation |
|-------|-------------|-----------|
| Input | (28, 28, 1) | Raw noisy image |
| Conv2D(32, 3×3, relu) | (28, 28, 32) | Detects edges and textures |
| MaxPooling2D(2×2) | (14, 14, 32) | Reduces spatial size by half |
| Conv2D(64, 3×3, relu) | (14, 14, 64) | Detects higher-level features |
| MaxPooling2D(2×2) | (7, 7, 64) | Compresses to latent representation |

Compression: 784 pixels → 3136 values (latent vector)

### Decoder

Reconstructs the clean image from **(7, 7, 64)** back to **(28, 28, 1)**.

| Layer | Output Shape | Operation |
|-------|-------------|-----------|
| Conv2DTranspose(64, 3×3, stride=2) | (14, 14, 64) | Upsamples back to half size |
| Conv2DTranspose(32, 3×3, stride=2) | (28, 28, 32) | Upsamples to original size |
| Conv2D(1, 3×3, sigmoid) | (28, 28, 1) | Output clean image |

### Why Convolutional layers instead of Dense

Dense layers flatten the image and lose all spatial relationships between pixels. Conv2D layers process local patches and preserve the 2D structure — critical for images. This is the same reason CNN outperformed ANN in Week 4.

---

## Training

```python
ae.fit(
    x_tr_n, x_tr,         
    epochs=20,
    batch_size=128,
    validation_data=(x_te_n, x_te)
)
```

- Loss function: **Binary Cross-Entropy** — treats each pixel as an independent probability between 0 and 1
- Optimizer: **Adam** — adaptive learning rate, fast convergence
- The model never sees the clean image during the forward pass — only as a target in the loss calculation

---

## Results

### Visual Output

Three rows are plotted side by side for 10 test images:

```
Row 1 — Noisy   : corrupted input fed to the autoencoder
Row 2 — Denoised: model output after reconstruction
Row 3 — Original: ground truth clean image
```

### Noise Level Analysis

The model was tested at five noise levels to measure robustness:

| Noise Factor | Behavior |
|-------------|----------|
| 0.1 | Almost no corruption — very easy to denoise |
| 0.3 | Light noise — denoised almost perfectly |
| 0.5 | Moderate noise — good reconstruction, minor blur |
| 0.7 | Heavy noise — digit shape still recovered |
| 0.9 | Severe corruption — reconstruction degrades but digit outline visible |

### Latent Space

PCA reduced the 7×7×64 encoder output to 2 dimensions and plotted it coloured by digit class. Despite the model being fully unsupervised and trained only on noisy images, the latent space shows natural clustering — similar digits are grouped together. This shows the encoder learned meaningful structure, not just memorization.

### Reconstruction MSE per Digit Class

MSE (Mean Squared Error) between the clean test image and the reconstructed output is computed for each digit class (0 to 9). Digits with simpler shapes (like 1) tend to have lower MSE. Digits with complex structure (like 8) tend to have slightly higher MSE.

---

## Things You Can Change

| Parameter | Location | Default | Try |
|-----------|----------|---------|-----|
| `noise` | Add Noise cell | `0.5` | `0.1` to `0.9` |
| `epochs` | `ae.fit()` | `20` | `10` to `50` |
| `batch_size` | `ae.fit()` | `128` | `64` or `256` |
| Encoder filters | Build cell | `32, 64` | `64, 128` |
| Embedding dimensions | Conv2D kernel | `3` | `5` |

---

## How to Run in VS Code

### Step 1 — Create virtual environment with Python 3.11

```bash
python3.11 -m venv ae_env
source ae_env/bin/activate      
ae_env\Scripts\activate       
```

> Python 3.13 is not supported by TensorFlow — always use 3.10 or 3.11.

### Step 2 — Install packages

```bash
pip install tensorflow numpy matplotlib pandas scikit-learn jupyter ipykernel
```

### Step 3 — Register kernel

```bash
python -m ipykernel install --user --name ae_env --display-name "Python 3.11 (ae_env)"
```

### Step 4 — Open and run

1. Open `autoencoder_denoising.ipynb` in VS Code
2. Top right → Select Kernel → **Python 3.11 (ae_env)**
3. Run All

MNIST downloads automatically in about 5 seconds on first run and is cached locally after that. No manual dataset setup needed.

---

## Tech Stack

| Category | Library |
|----------|---------|
| Deep learning | TensorFlow 2.x, Keras |
| Data handling | NumPy |
| Visualization | Matplotlib |
| Dimensionality reduction | Scikit-learn PCA |
| Dataset | tf.keras.datasets.mnist (built-in) |
| Environment | Python 3.11, VS Code |

---

## Key Takeaways

- An autoencoder learns to compress and reconstruct data without any labels — it is fully unsupervised.
- For denoising, training with noisy input and clean target forces the encoder to discard noise and keep only the true signal in the latent space.
- Conv2DTranspose is the reverse of Conv2D — it upsamples feature maps back to the original image size.
- MaxPooling during encoding creates a bottleneck — the model cannot simply copy the input, so it must learn meaningful structure.
- The PCA visualization proves the latent space is meaningful — the model groups similar digits together even though it was never given class labels.
- Digits that are visually simple reconstruct with lower MSE than digits with complex overlapping strokes.
- The same encoder-decoder architecture is the foundation of more advanced models like VAE (Variational Autoencoder) and U-Net used in image segmentation.

---

<div align="center">

![Celebal](https://img.shields.io/badge/Celebal_Technologies-ML_Internship-blue?style=flat-square)
&nbsp;&nbsp;
![Week](https://img.shields.io/badge/Week-6_of_8-orange?style=flat-square)

</div>
