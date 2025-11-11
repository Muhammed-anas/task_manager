import json
import urllib.request

BASE = 'http://127.0.0.1:8000/api'

def post(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            print('STATUS', resp.getcode())
            print(resp.read().decode())
    except urllib.error.HTTPError as e:
        print('STATUS', e.code)
        print(e.read().decode())

if __name__ == '__main__':
    print('Signup:')
    post('/signup', {'username': 'testuser', 'email': 'test@example.com', 'password': 'password123'})
    print('\nLogin:')
    post('/login', {'username': 'testuser', 'password': 'password123'})
