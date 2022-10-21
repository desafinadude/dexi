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

from entity.models import Entity
from entity.serializers import EntitySerializer

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
    "EVENT": [], # EVENT (event names), 
    "LAW": [], # LAW (legal document titles), 
    "LANGUAGE": [], # LANGUAGE (named languages), 
    "DATE": [],
    # "MONEY": [],
    # "PERCENT": [],
    # "WORK_OF_ART": [], # WORK_OF_ART (books, song titles), 
    # "TIME": [],
    # "QUANTITY": [],
    # "ORDINAL": [],
    # "CARDINAL": []
}

ner_index = []

# Approx size of filename string  ie /tmp/fef71b03-8ebf-4c45-8afd-4fc4c504a28e.pdf_work/fef71b03-8ebf-4c45-8afd-4fc4c504a28e.pdf_dexipage_1.pdf.txt
# Could be longer if the pagenumber is > 9
offset = 112 

@shared_task
def doc_extract(doc_id):

    doc = Doc.objects.get(pk=doc_id)

    if doc.status.id == 3:

        result = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Prefix=str(doc.file) + '.txt')
        
        if 'Contents' in result:
            # download file and extract entities
            s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, str(doc.file) + '.txt', str(doc.file) + '.txt')
            text = extractEntities(str(doc.file) + '.txt')

            doc.status_id = 4
            doc.save()

            # build index
            for key in ner:
                buildIndex(key, doc, text)

            doc.status_id = 5
            doc.save()

        else:
            print("Can't Find That File")


def cleanEnt(ent):
    return ent.replace('\n','').replace(':','')

def indexEnt(pos, text):

    text_before = text[:pos]
    matches = re.findall(r"_dexipage_(\d+)", text_before)

    return matches[-1] if len(matches) > 0 else None

def extractEntities(file):

    with open(file, 'r') as f:
        text = f.read()

    doc = nlp(text)

    for ent in [(X.text, X.label_) for X in doc.ents]:
        
        for key in ner:
            if key in ent:
                if cleanEnt(ent[0]) not in ner[key]:
                    # This excludes the included page numbers we've added for indexing purposes
                    if ('dexipage' not in cleanEnt(ent[0]) and '/tmp/' not in cleanEnt(ent[0])):

                        # This gets rid of most rubbish entities
                        invalidcharacters = set(string.punctuation)
                        if any(char in invalidcharacters for char in cleanEnt(ent[0])):
                            print ("invalid")
                        else:
                            ner[key].append(cleanEnt(ent[0]))

    return text

def buildIndex(key, doc, text):
    
    print(key, doc, text)

    for ent in ner[key]:
        page_numbers = []
        res = [i for i in range(len(text)) if text.startswith(ent, i)]

        for pos in res:
            page = indexEnt(pos, text)
            
            Entity.objects.create(
                entity=ent,
                schema=key,
                doc=doc,
                page=page,
                pos=pos-offset,
                reference=None
            )