import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

from celery import shared_task

import time
from random import *

import os

import boto3

from io import BytesIO
from django.conf import settings

import re
import csv
import numpy as np
import os
from collections import Counter

from .models import Doc, Entity, EntityFound, Extraction, Reference
from .serializers import DocSerializer, EntitySerializer, ExtractionSerializer, ReferenceSerializer


s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID , aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)

text = ''

ner = {
    "ORG": [],
    "PERSON": [], # ORG (organizations), 
    "GPE": [], # GPE (countries, cities etc.), 
    "NORP": [], # NORP (nationalities, religious and political groups), 
    "LOC": [], # LOC (mountain ranges, water bodies etc.),
    "FAC": [], # FAC (buildings, airports etc.), 
    "PRODUCT": [], # PRODUCT (products),
    # "EVENT": [], # EVENT (event names), 
    "LAW": [], # LAW (legal document titles), 
    # "LANGUAGE": [], # LANGUAGE (named languages), 
    # "DATE": [],
    # "MONEY": [],
    # "PERCENT": [],
    # "WORK_OF_ART": [], # WORK_OF_ART (books, song titles), 
    # "TIME": [],
    # "QUANTITY": [],
    # "ORDINAL": [],
    # "CARDINAL": []
    "EMAIL": [],
    # "IBAN": [],
    # "WEB": []
}

ner_index = []

# Approx size of filename string  ie /tmp/fef71b03-8ebf-4c45-8afd-4fc4c504a28e.pdf_work/fef71b03-8ebf-4c45-8afd-4fc4c504a28e.pdf_dexipage_1.pdf.txt
# Could be longer if the pagenumber is > 9
offset = 112 

@shared_task
def doc_extract_reference(doc_id, extraction_id):

    doc = Doc.objects.get(pk=doc_id)
    extraction = Extraction.objects.get(pk=extraction_id)
    reference = Reference.objects.get(pk=extraction.reference_id)


    if doc.status == 3:

        result = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Prefix=str(doc.file) + '.txt')
        
        if 'Contents' in result:
            # download file and extract entities
            s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, str(doc.file) + '.txt', str(doc.file) + '.txt')

            global ner
            ner = {
                "ORG": [],
                "PERSON": [], # ORG (organizations), 
                "GPE": [], # GPE (countries, cities etc.), 
                "NORP": [], # NORP (nationalities, religious and political groups), 
                "LOC": [], # LOC (mountain ranges, water bodies etc.),
                "FAC": [], # FAC (buildings, airports etc.), 
                "PRODUCT": [], # PRODUCT (products),
                # "EVENT": [], # EVENT (event names), 
                "LAW": [], # LAW (legal document titles), 
                # "LANGUAGE": [], # LANGUAGE (named languages), 
                # "DATE": [],
                # "MONEY": [],
                # "PERCENT": [],
                # "WORK_OF_ART": [], # WORK_OF_ART (books, song titles), 
                # "TIME": [],
                # "QUANTITY": [],
                # "ORDINAL": [],
                # "CARDINAL": []
                "EMAIL": [],
                # "IBAN": [],
                # "WEB": []
            }
            
            reference_file = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Prefix=str(reference.file))

            if 'Contents' in reference_file:
                s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, str(reference.file), str(reference.file))

                with open(str(reference.file), mode='r') as csv_file:
                    reference_file = csv.reader(csv_file)
            
                    text = extractEntities(str(doc.file) + '.txt', reference_file)

                    # Delete file
                    # os.remove(str(reference.file))

                    # Delete file
                    # os.remove(str(doc.file) + '.txt')

                    # build index
                    for key in ner:
                        buildIndex(key, doc, text, extraction, reference_file)

            else:
                print("Reference file not found")

        else:
            print("Can't Find That Document")

def indexEnt(pos, text):

    text_before = text[:pos]
    matches = re.findall(r"_dexipage_(\d+)", text_before)

    return matches[-1] if len(matches) > 0 else None

def extractEntities(file, reference_rows):

    with open(file, 'r') as f:
        text = f.read()

    return text

def buildIndex(key, doc, text, extraction, reference_rows):

    text = text.lower()

    for row in reference_rows:

        if row[0] != 'entity' and row[1] != 'schema':

            res = [i for i in range(len(text)) if text.startswith(row[0], i)]    

            entity = Entity.objects.filter(entity=row[0], extraction=extraction)

            if entity.count() > 0:
                print('Found....' + row[0] + '....' + str(entity[0].id))
            else:
                Entity.objects.create(
                    entity=row[0],
                    schema=row[1],
                    extraction=extraction
                )
                
            res = [i for i in range(len(text)) if text.startswith(row[0].lower(), i)]

            entity = Entity.objects.filter(entity=row[0], extraction=extraction).first()

            for pos in res:
                page = indexEnt(pos, text)
                if entity:
                    EntityFound.objects.create(
                        entity=entity,
                        doc=doc,
                        page=page,
                        pos=pos
                    )     