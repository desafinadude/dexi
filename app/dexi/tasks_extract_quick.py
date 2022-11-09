import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from copy import copy

from urllib.request import urlopen
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
from collections import Counter
import en_core_web_sm
# nlp = en_core_web_sm.load()
# nlp = spacy.load("en_core_web_sm", disable=["tok2vec", "tagger", "parser", "attribute_ruler", "lemmatizer"])
nlp = spacy.load("en_core_web_sm")

from .models import Doc, Entity, EntityFound, Extraction
from .serializers import DocSerializer, EntitySerializer, ExtractionSerializer


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
def url_extract_quick(url):

    
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

        text = extractEntities(url)
        
        entities = []

        # Group entities
        for key in ner:
            entities_key = groupEntities(key, None, text, None)
            for schema in entities_key:
                entities.append(schema)

        # Build Index

        text_lower = text.lower()

        for entity in entities:

            res = [i for i in range(len(text)) if text_lower.startswith(entity['entity'].lower(), i)]
            
            entity['pos'] = []

            for pos in res:
                entity['pos'].append(pos)     

        return [entities, text]
        



def extractEntities(url):

    f = urlopen(url)
    text = f.read().decode('utf-8')
    original_text = copy(text)

    # Find email addresses
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)
    for email in emails:
        ner['EMAIL'].append(email)
    

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

                        # No one letter entities please
                        if (len(ent[0]) > 1):

                            # This gets rid of most rubbish entities but is very crude and skips some good ones like emails
                            # !"#$%&'()*+, -./:;<=>?@[\]^_`{|}~

                            ent[0].replace('\r\n','')
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

    return original_text

def groupEntities(key, doc, text, extraction):

    text = text.lower()

    entities = []

    for ent in ner[key]:

        if ent not in entities:
            entities.append({
                'entity': ent,
                'schema': key
            })

    return entities

