import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

from celery import shared_task
# from celery.signals import task_postrun, task_prerun, task_success, task_failure

import time
from random import *

import os
from PyPDF2 import PdfFileReader, PdfFileWriter
import shutil
import errno
import subprocess
from tempfile import mkdtemp
import time
from PIL import Image
import pytesseract
# from pdf2image import convert_from_path, convert_from_bytes

import pypandoc

import boto3

from io import BytesIO
from django.conf import settings

import glob
from natsort import natsorted

from .models import Doc
from .serializers import DocSerializer
from .redis import set_redis, get_redis


s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID , aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)



@shared_task
def doc_ocr(doc_id, user):

    set_redis(user, 'user', 'Starting Conversion...')
    set_redis(user, 'status', '1')
    

    doc = Doc.objects.get(pk=doc_id)

    if doc.status == 1:

        if doc.type == 'application/pdf':

            message = "Found a PDF"
            
            print(message)
        
            # Setting document status to "CONVERTING"
            data = {
                'status': 2
            }
            serializer = DocSerializer(instance=doc, data=data, partial = True)
            if serializer.is_valid():
                serializer.save()
                
            # Converting PDF to TXT
            s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, str(doc.file), '/tmp/' + str(doc.file))
            
            pdf = PdfFileReader('/tmp/' + str(doc.file))

            # Make a working forlder for this PDF
            if not os.path.exists('/tmp/' + str(doc.file) + '_work'):
                os.mkdir('/tmp/' + str(doc.file) + '_work')
    
            source = '/tmp/' 
            destination = '/tmp/' + str(doc.file) + '_work/'

            for page in range(pdf.getNumPages()):
                pdf_writer = PdfFileWriter()
                pdf_writer.addPage(pdf.getPage(page))

                output_filename = '{}_dexipage_{}.pdf'.format(str(doc.file), page + 1)

                with open(destination + output_filename, 'wb') as out:
                    pdf_writer.write(out)

                message = 'Created page ' + str(page + 1) + ' of ' + str(pdf.getNumPages())
                set_redis(user, 'user', message)
                print(message)
            
            # For every pdf file in folder, convert to txt
            numpages = len(glob.glob1(destination,"*.pdf"))
            countpages = 0
            for filename in glob.glob(destination + '*dexipage*.pdf'):
                countpages += 1
                converted = convert(filename, filename + '.txt', user)
                set_redis(user, 'user', 'Converted ' + str(countpages) + ' of ' + str(numpages) + ' pages')

            with open(destination + str(doc.file) + '.txt', 'w') as outfile:
                for txtfile in natsorted(glob.glob(destination + '*dexipage*.txt')):
                    with open(txtfile, 'r', encoding='utf-8', errors='ignore') as infile:
                        outfile.write(txtfile + '\n\n\n' + infile.read() + '\n\n\n')
            
            for filename in glob.glob(destination + '*dexipage*'):
                os.remove(filename)

            # Upload converted file to S3
            s3.upload_file(destination + str(doc.file) + '.txt', settings.AWS_STORAGE_BUCKET_NAME, str(doc.file) + '.txt')
            response = s3.put_object_acl(ACL='public-read', Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key="%s" % (str(doc.file) + '.txt'))


            # Setting document status to "CONVERTED"
            data = {
                'status': 3
            }
            serializer = DocSerializer(instance=doc, data=data, partial = True)

            if serializer.is_valid():
                set_redis(user, 'user', 'Done with document ' + str(doc.name))
                set_redis(user, 'queue', str(int(get_redis(user, 'queue')) - 1))
                print(get_redis(user, 'queue'))
                if get_redis(user, 'queue') == '0':
                    set_redis(user, 'user', '')
                    set_redis(user, 'status', '0')
                serializer.save()
                return 1
            else:
                print(serializer.errors)
                return 0

        elif doc.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or doc.type == 'application/msword' or doc.type == 'application/vnd.oasis.opendocument.text' or doc.type == 'application/rtf':
                
                message = 'Found a Doc'
                print(message)
    
                # Setting document status to "CONVERTING"
                data = {
                    'status': 2
                }
                serializer = DocSerializer(instance=doc, data=data, partial = True)
                if serializer.is_valid():
                    set_redis(user, 'user', 'Done with document ' + str(doc.name))
                    set_redis(user, 'queue', str(int(get_redis(user, 'queue')) - 1))
                    print(get_redis(user, 'queue'))
                    if get_redis(user, 'queue') == '0':
                        set_redis(user, 'user', '')
                        set_redis(user, 'status', '0')
                    serializer.save()
    
                # Converting DOCX to TXT
                s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, str(doc.file), '/tmp/' + str(doc.file))
                pypandoc.convert_file('/tmp/' + str(doc.file), 'plain', outputfile='/tmp/' + str(doc.file) + '.txt')
    
                message = 'Upload to S3'
                print(message)

                # Upload converted file to S3
                s3.upload_file('/tmp/' + str(doc.file) + '.txt', settings.AWS_STORAGE_BUCKET_NAME, str(doc.file) + '.txt')
                response = s3.put_object_acl(ACL='public-read', Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key="%s" % (str(doc.file) + '.txt'))
    
                # Setting document status to "CONVERTED"
                data = {
                    'status': 3
                }
                serializer = DocSerializer(instance=doc, data=data, partial = True)
                if serializer.is_valid():
                    set_redis(user, 'user', 'Done with document ' + str(doc.name))
                    set_redis(user, 'queue', str(int(get_redis(user, 'queue')) - 1))
                    print(get_redis(user, 'queue'))
                    if get_redis(user, 'queue') == '0':
                        set_redis(user, 'user', '')
                        set_redis(user, 'status', '0')
                    serializer.save()

        elif doc.type == 'text/plain':
                
                message = 'Found a Plain Text File'
                print(message)
    
                # Setting document status to "CONVERTED"
                data = {
                    'status': 3
                }
                serializer = DocSerializer(instance=doc, data=data, partial = True)
                if serializer.is_valid():
                    set_redis(user, 'user', 'Done with document ' + str(doc.name))
                    set_redis(user, 'queue', str(int(get_redis(user, 'queue')) - 1))
                    print(get_redis(user, 'queue'))
                    if get_redis(user, 'queue') == '0':
                        set_redis(user, 'user', '')
                        set_redis(user, 'status', '0')
                    serializer.save()

    

        
        
     


def convert(sourcefile, destination_file, user):
    print(sourcefile, destination_file)
    text = extract_tesseract(sourcefile)
    with open(destination_file, 'w', encoding='utf-8') as f_out:
        f_out.write(text)
    
    message = 'Converted ' + sourcefile
    print(message)
    
    return True

def extract_tesseract(filename):
    temp_dir = mkdtemp()
    base = os.path.join(temp_dir, 'conv')
    contents = []
    try:
        stdout, _ = run(['pdftoppm', filename, base])

        for page in sorted(os.listdir(temp_dir)):
            page_path = os.path.join(temp_dir, page)
            page_content = pytesseract.image_to_string(Image.open(page_path))
            contents.append(page_content)
        return ''.join(contents)
    finally:
        shutil.rmtree(temp_dir)

def run(args):
    try:
        pipe = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    except OSError as e:
        if e.errno == errno.ENOENT:
            raise Exception('File Not Found')
    stdout, stderr = pipe.communicate()

    if pipe.returncode != 0:
        raise Exception(stderr)

    return stdout, stderr

# @task_prerun.connect
# def task_prerun_handler(sender=None, body=None, headers=None, *args, **kwargs):
#     return
    

# @task_success.connect
# def task_success_handler(sender, body, headers, *args, **kwargs):
#     set_redis(args[1], 'user', '')
#     set_redis(args[1], 'status', '0')
    

# @task_failure.connect
# def task_failure_handler(sender=None, body=None, headers=None, *args, **kwargs):
#     return
