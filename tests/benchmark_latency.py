import urllib.request
import json
import time

def benchmark_speed():
    login_data = json.dumps({
        "email": "arjun.sharma@campus.edu",
        "password": "Campus@123"
    }).encode("utf-8")
    login_req = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as resp:
        token = json.loads(resp.read().decode("utf-8"))["access_token"]

    def send(q):
        t0 = time.time()
        data = json.dumps({"message": q}).encode("utf-8")
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/chat",
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            t1 = time.time()
            print(f'Query: "{q}" -> Latency: {t1 - t0:.2f}s | Source: {res.get("source")}')

    print("Running end-to-end latency benchmarks...")
    send("What are my exam dates?")
    send("What are my exam dates?")  # Test cached retrieval
    send("tell me a joke")

if __name__ == "__main__":
    benchmark_speed()
