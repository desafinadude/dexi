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

import spacy
import re
import csv
import numpy as np
import os
from spacy import displacy
from collections import Counter
import en_core_web_lg
nlp = en_core_web_lg.load()


from doc.models import Doc
from doc.serializers import DocSerializer

s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID , aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)

text = ''

ner = {
    "ORG": [],
    "PERSON": [],
    "GPE": [],
    "NORP": [],
    "LOC": []
}

# OTHER ?

ner_index = []


@shared_task
def doc_extract(doc_id):

    doc = Doc.objects.get(pk=doc_id)

    print(doc_id, doc.status)

    if doc.status.id == 3:

        # TODO: File exist on s3 bucket
        # result = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Prefix=str(doc.file))
        # if 'Contents' in result:
        # else:
        #     print("Can't Find That File")

        # File exists so let's extract
        if os.path.exists('/tmp/' + str(doc.file) + '.txt'):

            file = '/tmp/' + str(doc.file) + '.txt'

            # Setting document status to "Extracting"
            data = {
                'status': 4
            }
            serializer = DocSerializer(instance=doc, data=data, partial = True)
            if serializer.is_valid():
                serializer.save()

            # Named Entity Recognition

            ner = {
                "ORG": [],
                "PERSON": [],
                "GPE": [],
                "NORP": [],
                "LOC": []
            }

            text = extractEntities(file)

            # for key in ner:
            #     pages = buildIndex(key, file, text)
            #     ner_index.extend(pages)

            print(ner)
        
            # writeCSV(ner_index)




def cleanEnt(ent):
    return ent.replace('\n','').replace(':','')

def indexEnt(pos, text):

    print('### Finding Page Number for entity...')

    text_before = text[:pos]
    matches = re.findall(r"TRANSCRIPT.*\.pdf_page_(\d+)\.txt", text_before)
    
    return matches[-1] if len(matches) > 0 else None

def writeCSV(arr):

    print('### Writing CSV ###')

    columns = ['entity','type','pages','document']
    try:
        with open("ner.csv", 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=columns)
            writer.writeheader()
            for key in arr:
                writer.writerow(key)
    except IOError:
        print("I/O error")

def extractEntities(file):

    print('### Extracting Entities... ###')

    with open(file, 'r') as f:
        text = f.read()

    doc = nlp(text)

    for ent in [(X.text, X.label_) for X in doc.ents]:
        
        for key in ner:
            if key in ent:
                if cleanEnt(ent[0]) not in ner[key]:
                    # This excludes the included page numbers we've added for indexing purposes
                    if ('TRANSCRIPT' not in cleanEnt(ent[0])) and ('./work' not in cleanEnt(ent[0])):
                        ner[key].append(cleanEnt(ent[0]))

    return text

def buildIndex(key, file, text):

    print('### Building Index For...###')

    print(key, file)

    pages = []

    for ent in ner[key]:

        page_numbers = []
        
        res = [i for i in range(len(text)) if text.startswith(ent, i)]

        for pos in res:
            page = indexEnt(pos, text)
            if page not in page_numbers:
                if page != None:
                    page_numbers.append(page)

        pages.append({
            "entity": ent,
            "type": key,
            "pages": str(page_numbers),
            "document": file
        })

    return pages