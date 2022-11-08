# Pull base image
FROM python:3.7-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

RUN apk update && \
   apk add build-base \
   postgresql-dev \
   bash \
   # Tessaract
   tesseract-ocr \
   tesseract-ocr-dev \
   # Poppler
   cmake \
   poppler-utils \
   poppler-dev \
   # Pillow Dependencies
   freetype-dev \
   fribidi-dev \
   harfbuzz-dev \
   jpeg-dev \
   lcms2-dev \
   libimagequant-dev \
   openjpeg-dev \
   tcl-dev \
   tiff-dev \
   tk-dev \
   zlib-dev

RUN mkdir /app
COPY ./app /app
WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

RUN python -m spacy download en_core_web_lg
RUN python -m spacy download en_core_web_sm