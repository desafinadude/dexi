# Pull base image
FROM python:3.7-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND noninteractive

RUN pip install --upgrade pip

RUN apt update -y && \
   apt install -y build-essential \
   postgresql \
   bash \
   # Tessaract
   tesseract-ocr \
   libtesseract-dev \
   # Poppler
   cmake \
   poppler-utils \
   libpoppler-dev \
   libpoppler-cpp-dev \
   # Pillow Dependencies
   libfreetype-dev \
   libfribidi-dev \
   libharfbuzz-dev \
   libjpeg-dev \
   liblcms2-dev \
   libimagequant-dev \
   # openjpeg-dev \
   tcl-dev \
   libtiff-dev \
   tk-dev \
   libghc-zlib-dev

RUN mkdir /app
COPY ./app /app
WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

RUN python -m spacy download en_core_web_sm

CMD gunicorn dexi.wsgi:application --bind