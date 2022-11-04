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
from PyPDF2 import PdfFileReader, PdfFileWriter
import shutil
import errno
import subprocess
from tempfile import mkdtemp
import time
from PIL import Image
import pytesseract
# from pdf2image import convert_from_path, convert_from_bytes

import boto3

from io import BytesIO
from django.conf import settings

import glob
from natsort import natsorted

from .models import Doc
from .serializers import DocSerializer

s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID , aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)

@shared_task
def doc_ocr(doc_id):

    print('Worker conversion task here...ready')

    doc = Doc.objects.get(pk=doc_id)

    if doc.status == 1:

        # TODO: Why not write these to a file's log? That could be a useful feature.

        print('yes it\'s ready to be converted')

        if doc.type == 'application/pdf':

            print('yes it\'s a pdf')

            # time.sleep(randint(1, 30))
        
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

                print('Created: {}'.format(output_filename))
            
            # For every pdf file in folder, convert to txt
            for filename in glob.glob(destination + '*dexipage*.pdf'):
                converted = convert(filename, filename + '.txt')

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
                serializer.save()


def convert(sourcefile, destination_file):
    print(sourcefile, destination_file)
    text = extract_tesseract(sourcefile)
    with open(destination_file, 'w', encoding='utf-8') as f_out:
        f_out.write(text)
    print()
    print('Converted ' + sourcefile)
    
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