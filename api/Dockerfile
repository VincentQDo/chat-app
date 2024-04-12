FROM python:alpine3.19

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY app.py .

CMD [ "python", "app.py" ]