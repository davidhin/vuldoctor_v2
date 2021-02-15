# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.8-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install basics
RUN apt-get update && apt-get upgrade -y
RUN apt install -y chromium-driver

# Install production dependencies.
RUN pip install Flask gunicorn
RUN pip install flask-cors
RUN pip install 'pymongo[srv]'
RUN pip install selenium
RUN pip install bs4
RUN pip install requests

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 600 app:app
