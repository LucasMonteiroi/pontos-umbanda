from __future__ import print_function

import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file"]


DOCUMENT_ID=''

def createDocument(service):
  title = 'My Document'
  body = {
      'title': title
  }
  doc = service.documents() \
      .create(body=body).execute()
  return doc.get('documentId')
 


def main():
    """Shows basic usage of the Docs API.
    Prints the title of a sample document.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client-secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    

    try:
        service = build('docs', 'v1', credentials=creds)
        DOCUMENT_ID = createDocument(service)
        text1 = 'Olá'
        text2 = 'tudo bem?'
        text3 = 'Sim'
        requests = [
         {
            'insertText': {
                'location': {
                    'index': 1,
                },
                'text': text1
            }
        },
                 {
            'insertText': {
                'location': {
                    'index': 4,
                },
                'text': text2
            }
        },
                 {
            'insertText': {
                'location': {
                    'index': 13,
                },
                'text': text3
            }
        },
        ]

        result = service.documents().batchUpdate(
          documentId=DOCUMENT_ID, 
          body={'requests': requests}).execute()
        print(result)
    except HttpError as err:
        print(err)


if __name__ == '__main__':
    main()