import urllib.request
import ssl
import json

url = 'https://aszsysdhmakczwwxabfr.supabase.co/functions/v1/baidu-translate'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzenN5c2RobWFrY3p3d3hhYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTA2ODAsImV4cCI6MjA4NjcyNjY4MH0.RWYFx-qyyux6jV92K-AwHDdQo0L8R5PJmj4ERA3POmo'
}

# Test 1: Simple text
data1 = json.dumps({'text': 'hello', 'from': 'en', 'to': 'zh'}).encode('utf-8')
print("Test 1: Simple text 'hello'")
print("Request body:", data1.decode('utf-8'))

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req1 = urllib.request.Request(url, data=data1, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req1, context=ctx) as response:
        print('Status:', response.status)
        print('Response:', response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('Status:', e.code)
    print('Error:', e.read().decode('utf-8'))
except Exception as e:
    print('Error:', str(e))

print("\n" + "="*50 + "\n")

# Test 2: Empty object to see what server expects
data2 = b'{}'
print("Test 2: Empty object '{}'")
req2 = urllib.request.Request(url, data=data2, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req2, context=ctx) as response:
        print('Status:', response.status)
        print('Response:', response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('Status:', e.code)
    print('Error:', e.read().decode('utf-8'))
except Exception as e:
    print('Error:', str(e))
