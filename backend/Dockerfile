FROM python:3.12-slim

# Install system dependencies including Firefox and wget
RUN apt-get update && apt-get install -y \
    firefox-esr \
    wget \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Install Geckodriver
RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz \
    && tar -xvzf geckodriver-v0.34.0-linux64.tar.gz \
    && chmod +x geckodriver \
    && mv geckodriver /usr/local/bin/ \
    && rm geckodriver-v0.34.0-linux64.tar.gz

WORKDIR /app

# Copy requirements and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables for Firefox (optional, but good practice)
ENV MOZ_HEADLESS=1

# Run the application
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:10000", "run:app"]
