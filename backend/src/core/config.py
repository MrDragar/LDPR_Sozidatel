import os

from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("API_TOKEN")
BOT_NAME = os.getenv("BOT_NAME")

log_level = os.getenv("LOG_LEVEL", "INFO")
log_file = os.getenv("LOG_FILE", None)
log_format = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
