"""
Standalone test of the MinerU parser. Run with: uv run python test_parser.py
NOT wired into FastAPI yet — we prove it works in isolation first.

Flow (MinerU Precision API, token-based):
  1. Ask MinerU for an upload URL (POST /file-urls/batch) -> batch_id + upload URL
  2. PUT our local PDF to that upload URL
  3. Poll the batch results until state == "done"
  4. Download the result ZIP, open it, read full.md (the Markdown)
"""

import io
import time
import zipfile

import httpx

from app.config import settings

BASE = "https://mineru.net/api/v4"
PDF_PATH = "Data/SPV-Credit-Agt.pdf"          # the file in your project root
HEADERS = {"Authorization": f"Bearer {settings.mineru_api_token}"}


def main() -> None:
    # --- Step 1: request an upload URL ---
    print("Requesting upload URL...")
    resp = httpx.post(
        f"{BASE}/file-urls/batch",
        headers=HEADERS,
        json={"files": [{"name": "sample.pdf"}], "model_version": "vlm"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()["data"]
    batch_id = data["batch_id"]
    upload_url = data["file_urls"][0]
    print(f"batch_id: {batch_id}")

    # --- Step 2: upload the PDF (no auth header, no content-type per MinerU docs) ---
    print("Uploading PDF...")
    with open(PDF_PATH, "rb") as f:
        up = httpx.put(upload_url, content=f.read(), timeout=120)
    up.raise_for_status()
    print("Uploaded. Waiting for MinerU to parse...")

    # --- Step 3: poll until done ---
    zip_url = None
    start = time.time()
    while time.time() - start < 300:          # 5-minute cap
        r = httpx.get(f"{BASE}/extract-results/batch/{batch_id}", headers=HEADERS, timeout=30)
        r.raise_for_status()
        result = r.json()["data"]["extract_result"][0]
        state = result["state"]
        elapsed = int(time.time() - start)
        if state == "done":
            zip_url = result["full_zip_url"]
            print(f"[{elapsed}s] done!")
            break
        if state == "failed":
            print(f"[{elapsed}s] FAILED: {result.get('err_msg')}")
            return
        print(f"[{elapsed}s] state: {state}...")
        time.sleep(5)

    if not zip_url:
        print("Timed out.")
        return

    # --- Step 4: download the zip and pull full.md out of it ---
    print("Downloading result...")
    zresp = httpx.get(zip_url, timeout=120)
    zresp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(zresp.content)) as z:
        markdown = z.read("full.md").decode("utf-8")

    print("\n===== MARKDOWN (first 3000 chars) =====\n")
    print(markdown[:3000])
    print(f"\n===== total length: {len(markdown)} chars =====")


if __name__ == "__main__":
    main()