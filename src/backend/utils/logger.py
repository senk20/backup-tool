from loguru import logger
import sys
import os

# Configure logger
log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'logs', 'backup.log')

logger.add(log_file,
          format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
          rotation="10 MB",
          retention="30 days",
          level="INFO")

def get_logger():
    return logger