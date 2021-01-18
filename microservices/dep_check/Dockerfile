# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.8-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install basics
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y git
RUN apt-get install -y bash
RUN apt-get install -y curl build-essential sudo
RUN curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
RUN apt-get install -y nodejs

# Install dep_scan
RUN git clone https://github.com/AppThreat/dep-scan.git
RUN npm install -g @appthreat/cdxgen
RUN cd dep-scan; pip install .; cd ..

# Install production dependencies.
RUN pip install Flask gunicorn
RUN pip install google-cloud-storage
RUN pip install flask-cors
RUN pip install pytest
RUN pip install pytest-cov
RUN pip install firebase-admin

# Set environment variables
ENV VDB_HOME=/app/db
ENV NVD_START_YEAR=2010
ENV GITHUB_PAGE_COUNT=5
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/solidmantra.json

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 app:app