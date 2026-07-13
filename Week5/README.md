# 📘 Text Generation using RNN, LSTM, and GRU

A beginner-friendly deep learning project that trains and compares three sequence
models — **Vanilla RNN**, **LSTM**, and **GRU** — on the same text corpus to learn
grammar, sentence flow, and contextual dependencies for next-word prediction and
text generation.

## 🎯 Problem Statement

Design and implement a deep learning model capable of learning the underlying
structure, grammar, and contextual dependencies of a given text corpus to generate
coherent and meaningful text sequences using:

1. Vanilla RNN
2. LSTM
3. GRU

Then compare training loss, generated text quality, memory handling, and long-term
dependency learning across the three architectures.

## 📂 File

- `Text_Generation_RNN_LSTM_GRU_Complete.ipynb` — the full, runnable notebook

## 📥 Dataset

No external download is required. The corpus is a small, direct in-memory text
string defined right in the notebook, so it runs immediately on any machine
(local, Colab, Kaggle, etc.) with no network dependency. You can swap in your own
paragraph, story, or lyrics later — see the Student Tasks section in the notebook.

## 🧠 What the Notebook Does

1. **Tokenization** — converts the corpus into integer tokens using Keras `Tokenizer`
2. **Sequence creation** — builds n-gram style sequences for next-word prediction
3. **Model building** — a single reusable function builds the same
   Embedding → recurrent layer → Dense(softmax) architecture for RNN, LSTM, and GRU,
   so the three are directly comparable
4. **Training** — trains all three models (150 epochs each) on identical data
5. **Comparison** — plots training loss and accuracy curves side by side
6. **Text generation** — a temperature-based sampling function generates new text
   from a seed phrase using each trained model
7. **Analysis** — a conclusion section summarizing the strengths/weaknesses of
   each architecture

## 🛠️ Requirements

- Python 3.8+
- TensorFlow 2.x
- NumPy
- Matplotlib

Install with:
```bash
pip install tensorflow numpy matplotlib
```

## ▶️ How to Run

1. Open `Text_Generation_RNN_LSTM_GRU_Complete.ipynb` in Jupyter Notebook, Google
   Colab, or JupyterLab.
2. Run all cells top to bottom (`Runtime > Run all` in Colab).
3. No configuration or dataset download needed — it works out of the box.

## 📊 Results You'll See

- Vocabulary size and sequence shapes printed after tokenization
- Model summaries for each architecture
- Side-by-side training loss and accuracy plots for RNN vs LSTM vs GRU
- Generated text samples from each model given the same seed phrases

## 📚 Learning Tasks

The notebook includes **Beginner**, **Intermediate**, and **Advanced** exercises,
such as:
- Replacing the corpus with your own text
- Tuning embedding size, hidden units, and epochs
- Adding dropout or a second recurrent layer
- Trying character-level tokenization
- Adding pre-trained embeddings or an attention layer

## ✅ Key Takeaways

- **Vanilla RNN** learns short patterns but struggles with long-term memory due to
  vanishing gradients.
- **LSTM** handles long-range dependencies better via its input/forget/output gates.
- **GRU** achieves similar results to LSTM with fewer parameters (reset + update
  gates only) and often trains faster.
- On a small corpus all three models will eventually memorize the training
  sentences — differences in long-term dependency handling become clearer on
  larger, more diverse text.

## 📄 License

Free to use and modify for learning and educational purposes.
