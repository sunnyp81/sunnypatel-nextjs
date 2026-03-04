
import json, time, requests, google.auth.transport.requests
from google.oauth2 import service_account
CREDENTIALS_PATH = r'C:UserssunnyDownloadsclaudeindex-6b5681c013d4.json'
SCOPES = ['https://www.googleapis.com/auth/indexing']
ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
URLS = [
    "https://sunnypatel.co.uk/",
    "https://sunnypatel.co.uk/services/seo-consultant-reading",
    "https://sunnypatel.co.uk/services/seo-agency-reading",
    "https://sunnypatel.co.uk/contact"
]
credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH, scopes=SCOPES)
request = google.auth.transport.requests.Request()
credentials.refresh(request)
headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {credentials.token}'}
for url in URLS:
    body = json.dumps({'url': url, 'type': 'URL_UPDATED'})
    r = requests.post(ENDPOINT, headers=headers, data=body)
    print(f'{url}: {r.status_code} {r.text[:100]}')
    time.sleep(1)
