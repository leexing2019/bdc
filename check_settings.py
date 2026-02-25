import urllib.request
import urllib.parse
import json
import sys

url = 'https://aszsysdhmakczwwxabfr.supabase.co/rest/v1/system_settings?select=*'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTA2ODAsImV4cCI6MjA4NjcyNjY4MH0.RWYFx-qyyux6jV92K-AwHDdQo0L8R5PJmj4ERA3POmo',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTA2ODAsImV4cCI6MjA4NjcyNjY4MH0.RWYFx-qyyux6jV92K-AwHDdQo0L8R5PJmj4ERA3POmo'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print('Status:', response.status)
        data = json.loads(response.read().decode('utf-8'))
        print('Total settings:', len(data))
        for item in data:
            print(f"{item['setting_key']}: {item['setting_value']}")
except Exception as e:
    print('Error:', e)
    sys.exit(1)
