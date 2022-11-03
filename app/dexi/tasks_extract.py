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


from .models import Doc, Entity, EntityFound, Extraction
from .serializers import DocSerializer, EntitySerializer, ExtractionSerializer


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
def doc_extract(doc_id, extraction_id):

    doc = Doc.objects.get(pk=doc_id)
    extraction = Extraction.objects.get(pk=extraction_id)

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

            text = extractEntities(str(doc.file) + '.txt')

            

            # doc.status = 4
            # doc.save()

            # build index
            for key in ner:
                buildIndex(key, doc, text, extraction)

            # doc.status = 5
            # doc.save()

        else:
            print("Can't Find That File")

def indexEnt(pos, text):

    text_before = text[:pos]
    matches = re.findall(r"_dexipage_(\d+)", text_before)

    return matches[-1] if len(matches) > 0 else None

def extractEntities(file):

    with open(file, 'r') as f:
        text = f.read()

    # Find email addresses
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)
    for email in emails:
        ner['EMAIL'].append(email)

    # Find IBAN
    # ibans = re.findall(r'([A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16})', text)
    # for iban in ibans:
    #     ner['IBAN'].append(iban[0])

    # Find websites that may start without http
    # websites = re.findall(r'(?<!\w)(?:https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?', text)
    # for website in websites:
    #     ner['WEB'].append(website[0])

    
    

    # strip \n from plain text
    text = text.replace('\n', ' ')

    doc = nlp(text)

    for ent in [(X.text, X.label_) for X in doc.ents]:
        
        for key in ner:
            if key != 'EMAIL':

                if key in ent:
                    # if lowercase entity is not in the list
                    if ent[0].lower() not in [x.lower() for x in ner[key]]:
                    # if ent[0] not in ner[key]:

                        # This excludes the included page numbers we've added for indexing purposes
                        if ('dexipage' not in ent[0] and '/tmp/' not in ent[0]):

                            # No one letter entities please
                            if (len(ent[0]) > 1):

                                # This gets rid of most rubbish entities but is very crude and skips some good ones like emails
                                # !"#$%&'()*+, -./:;<=>?@[\]^_`{|}~

                                ent[0].replace('\n','')

                                invalidcharacters = set(string.punctuation.replace("_", "")
                                .replace("-", "")
                                .replace(".", "")
                                .replace(" ", "")
                                .replace("/", "")
                                .replace(":", "")
                                .replace("(", "")
                                .replace(")", "")
                                .replace(",", "")
                                .replace("'", ""))
                                
                                
                                invalidcharacters = set(string.punctuation)

                                if any(char in invalidcharacters for char in ent[0]):
                                    print ("invalid")
                                else:
                                    ner[key].append(ent[0])

    return text

def buildIndex(key, doc, text, extraction):

    text = text.lower()

    for ent in ner[key]:

        # If entity with same name and same doc does not exist, create

        entity = Entity.objects.filter(entity=ent, extraction=extraction)

        if entity.count() > 0:
            print('Found....' + ent + '....' + str(entity[0].id))
        else:
            Entity.objects.create(
                entity=ent,
                schema=key,
                extraction=extraction
            )
            

        # Add every occurence of entity to EntityFound

        res = [i for i in range(len(text)) if text.startswith(ent.lower(), i)]

        entity = Entity.objects.filter(entity=ent, extraction=extraction).first()

        for pos in res:
            page = indexEnt(pos, text)
            if entity:
                EntityFound.objects.create(
                    entity=entity,
                    doc=doc,
                    page=page,
                    pos=pos
                )     