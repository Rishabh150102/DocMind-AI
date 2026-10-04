FROM python:3.11-slim

WORKDIR /DocMind-backend-docker

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /DocMind-backend-docker

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]