FROM python:3.9.2-slim

WORKDIR /flask

COPY flask ./

RUN pip install -r requirement.txt

CMD ["python3", "-u", "run.py"]
