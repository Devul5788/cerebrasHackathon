#!/usr/bin/env python3

from common.utils import ask_cerebras, ask_perplexity
from common.config import CEREBRAS_API_KEY, PERPLEXITY_API_KEY
import json

def main():

    # # Test ask_cerebras
    # if not CEREBRAS_API_KEY:
    #     print("CEREBRAS_API_KEY not configured.")
    # else:
    #     question = "What is 2 + 2?"
    #     context = "You are a helpful math assistant. Output in plain text."
    #     result = ask_cerebras(question, context)
    #     print("Cerebras Result:", result)

    # Test ask_perplexity
    if not PERPLEXITY_API_KEY:
        print("PERPLEXITY_API_KEY not configured.")
    else:
        question = "What are cerebras's products offerings and give me a list of possible customers that cerebras gtm team can target for each product. Try to give as many possible customers as possible."
        context = "You are an expert at providing information about Cerebras products."
        result = ask_perplexity(question, context)
        print("Perplexity Result:", json.dumps(result, indent=2))

if __name__ == "__main__":
    main()