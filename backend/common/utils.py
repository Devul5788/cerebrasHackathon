import logging
import os
import sys
import typing
import socket
import random
from cerebras.cloud.sdk import Cerebras
import re
import time
from common.config import PERPLEXITY_API_KEY, CEREBRAS_API_KEY
from typing import Tuple

logger = logging.getLogger("django")


def ask_cerebras(question, context, model = "deepseek-r1-distill-llama-70b", temp=1.0):
    try:
        cerebras_api_key = CEREBRAS_API_KEY
        os.environ["CEREBRAS_API_KEY"] = cerebras_api_key
        cerebras_client = Cerebras()

        max_retries = 3
        base_delay = 2  # Start with 2 second delay
        
        for retry_count in range(max_retries + 1):
            try:
                random_id = random.randint(1000, 9999)
                
                # Clearer separation between context, instructions and expected output format
                combined_message = f"Request ID: {random_id}\n\n===== CONTEXT =====\n{context}\n\n===== INSTRUCTIONS =====\n{question}\n\n"
                
                response = cerebras_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "user", "content": combined_message}
                    ],
                    temperature=temp,
                    seed=42
                )
                
                content = response.choices[0].message.content.strip()
                
                # Remove any text between <think> and </think> tags
                clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
                
                clean_content = clean_content.strip()
                
                return clean_content
                
            except Exception as e:
                error_message = str(e)
                # Check if this is a rate limit error
                if retry_count < max_retries and ("429" in error_message or "request_quota_exceeded" in error_message or "too_many_requests" in error_message):
                    # Calculate exponential backoff delay with jitter
                    delay = base_delay * (2 ** retry_count) + random.uniform(0, 1)
                    print(f"Rate limit hit, retrying in {delay:.2f} seconds... (Attempt {retry_count + 1}/{max_retries})")
                    time.sleep(delay)
                    continue
                else:
                    # If we've exhausted our retries or it's not a rate limit error, raise the exception
                    raise
                    
    except Exception as e:
        return f"Error: {str(e)}"

