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
RUN apt-get install -y sudo
RUN apt-get install -y wget

# Install mongodbtools
RUN TEMP_DEB="$(mktemp)" && \                                                        
wget -O "$TEMP_DEB" 'https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian10-x86_64-100.2.1.deb' && \
sudo dpkg -i "$TEMP_DEB"; \
rm -f "$TEMP_DEB"

# Install production dependencies.
RUN pip install Flask gunicorn
RUN pip install flask-cors
RUN pip install google-cloud-storage
RUN pip install firebase-admin
RUN pip install 'pymongo[srv]'
RUN pip install numpy
RUN pip install tqdm

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.

CMD exec gunicorn --bind :$PORT --workers 1 --threads 1 --timeout 600 app:app