from decouple import config as env_config

PERPLEXITY_API_KEY = env_config("PERPLEXITY_API_KEY", default="")
CEREBRAS_API_KEY = env_config("CEREBRAS_API_KEY", default="")
