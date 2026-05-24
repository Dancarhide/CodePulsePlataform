FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8004
ENV PYTHONPATH=/app
CMD ["uvicorn", "src.infrastructure.entry_points.api.main:app", "--host", "0.0.0.0", "--port", "8004"]
