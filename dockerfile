FROM python:3.9.2-slim

WORKDIR /flask

COPY flask/requirement.txt ./

RUN pip install -r requirement.txt

COPY flask ./

CMD ["python3", "-u", "run.py"]
