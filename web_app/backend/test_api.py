#!/usr/bin/env python3
"""Test script to upload an image and trigger model loading."""

import requests
import json
import time

# Test credentials
EMAIL = "test@example.com"
PASSWORD = "testpass123"

BASE_URL = "http://localhost:8000/api"
HEALTH_BASE = "http://localhost:8000"

PREDICT_TIMEOUT_SECONDS = 180
MAX_PREDICT_RETRIES = 2
AUTH_TIMEOUT_SECONDS = 20
MAX_AUTH_RETRIES = 3


def wait_for_api(timeout_seconds=30):
    """Wait until API health endpoint is reachable."""
    start = time.time()
    while time.time() - start < timeout_seconds:
        try:
            resp = requests.get(f"{HEALTH_BASE}/health", timeout=3)
            if resp.status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(1)
    return False


def read_model_status():
    """Fetch model readiness details from backend."""
    try:
        resp = requests.get(f"{HEALTH_BASE}/health/model", timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return None


def request_with_retry(method, url, *, retries=3, timeout=10, **kwargs):
    """Issue an HTTP request with retry for transient timeout errors."""
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            return requests.request(method, url, timeout=timeout, **kwargs)
        except requests.ReadTimeout as exc:
            last_error = exc
            print(f"Request timeout on attempt {attempt}/{retries}: {method} {url}")
            if attempt < retries:
                time.sleep(1)

    raise last_error

def register_and_login():
    """Register and login to get auth token."""
    # Register
    register_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Test User"
    }
    
    try:
        resp = request_with_retry(
            "POST",
            f"{BASE_URL}/auth/register",
            json=register_data,
            timeout=AUTH_TIMEOUT_SECONDS,
            retries=MAX_AUTH_RETRIES
        )
        print(f"Register: {resp.status_code}")
    except requests.RequestException:
        print("Register request failed (may already exist or backend is busy)")
    
    # Login
    login_data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    resp = request_with_retry(
        "POST",
        f"{BASE_URL}/auth/login",
        json=login_data,
        timeout=AUTH_TIMEOUT_SECONDS,
        retries=MAX_AUTH_RETRIES
    )
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        print(f"✅ Login successful. Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {resp.status_code}")
        print(resp.text)
        return None

def upload_image(token):
    """Upload test image."""
    image_path = r"D:\Brain-tumor-detection-of-MRI-images-using-CNN-main\BrainTumor\testImages\1.jpg"
    
    headers = {"Authorization": f"Bearer {token}"}
    
    last_error = None
    resp = None
    for attempt in range(1, MAX_PREDICT_RETRIES + 1):
        try:
            with open(image_path, "rb") as f:
                files = {"file": f}
                resp = requests.post(
                    f"{BASE_URL}/analysis/predict",
                    files=files,
                    headers=headers,
                    timeout=PREDICT_TIMEOUT_SECONDS
                )
            break
        except requests.ReadTimeout as exc:
            last_error = exc
            print(
                f"Predict attempt {attempt}/{MAX_PREDICT_RETRIES} timed out "
                f"after {PREDICT_TIMEOUT_SECONDS}s (possible cold model load)."
            )

            if attempt < MAX_PREDICT_RETRIES:
                time.sleep(2)

    if resp is None:
        print("Prediction failed: no response received")
        if last_error is not None:
            print(str(last_error))
        return
    
    print(f"\n📤 Upload: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Prediction successful!")
        print(f"   - Tumor Detected: {data['is_tumor']}")
        print(f"   - Label: {data['label']}")
        print(f"   - Confidence: {data['confidence']:.2%}")
        print(f"   - Tumor Type: {data.get('tumor_type', 'N/A')}")
        print(f"   - Tumor Subtype: {data.get('tumor_subtype', 'N/A')}")
        print(f"\n📋 Full response:")
        print(json.dumps(data, indent=2, default=str))
    else:
        print(f"❌ Prediction failed: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    print("🧪 Testing Brain Tumor Detection API\n")

    if not wait_for_api(timeout_seconds=30):
        print("❌ API is not reachable at /health within 30s. Start backend first.")
        raise SystemExit(1)

    model_status = read_model_status()
    if model_status:
        print(f"Model state before test: {model_status.get('state')}")
        print(f"Model message: {model_status.get('message')}")
    
    token = register_and_login()
    if token:
        upload_image(token)

    model_status = read_model_status()
    if model_status:
        print(f"\nModel state after test: {model_status.get('state')}")
        print(json.dumps(model_status, indent=2))
    
    print("\n✅ Test complete. Check backend logs for model loading messages.")
