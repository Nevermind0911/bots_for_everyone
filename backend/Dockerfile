FROM python:3.12-slim

# Не запускаем от root
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Зависимости отдельным слоем — кешируются при ребилде
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Исходник
COPY app.py .

# Директория для SQLite (монтируется как volume)
RUN mkdir -p /data && chown app:app /data

USER app

ENV DB_PATH=/data/botwork.db
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# gunicorn в продакшне; --workers 2 хватит для старта
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "60", "--worker-tmp-dir", "/dev/shm", "app:app"]
