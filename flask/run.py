import sys
import argparse
from app import app
from app import route

if __name__ == "__main__":

  parser = argparse.ArgumentParser()

  args = parser.parse_args()
  app.run(host='0.0.0.0', port=5000, debug=True)