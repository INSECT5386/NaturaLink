import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# 모델 불러오기
tokenizer = GPT2Tokenizer.from_pretrained("skt/kogpt2-base-v2")
model = GPT2LMHeadModel.from_pretrained("skt/kogpt2-base-v2")

def chat(user_input):
    input_ids = tokenizer.encode(user_input, return_tensors="pt")
    output = model.generate(input_ids, max_length=50, temperature=0.7)
    return tokenizer.decode(output[0], skip_special_tokens=True)
