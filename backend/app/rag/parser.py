"""
Parse a PDF into markdown using MinerU. Here I used precision API key.
flow : Request upload URL -> Put file -> poll -> download zip -> read full.md
"""
import asyncio
import io
import time
import zipfile
import httpx

from app.config import settings

BASE = "https://mineru.net/api/v4"

# Take a raw pfs and return the extracted markdown text
async def parse_pdf(file_bytes: bytes, filename: str) ->str :
    headers = {"Authorization": f"Bearer {settings.mineru_api_token}"}
    async with httpx.AsyncClient(timeout=120) as client :
        #1. Request an upload url
        resp = await client.post(
            f"{BASE}/file-urls/batch",
            headers=headers,
            json={"files":[{"name": filename}], "model_version": "vlm"}
        )
        resp.raise_for_status()
        data = resp.json()["data"]
        batch_id = data["batch_id"]
        upload_url = data["file_urls"][0]

        # 2. Upload the file
        await client.put(upload_url, content=file_bytes)

        #3. Poll until done
        zip_url = None
        start = time.time()
        while time.time() - start < 300 :
            r = await client.get(f"{BASE}/extract-results/batch/{batch_id}", headers=headers)
            r.raise_for_status()
            result = r.json()["data"]["extract_result"][0]
            state = result["state"]
            if state == "done":
                zip_url = result["full_zip_url"]
                break
            if state == "failed":
                raise RuntimeError(f"MinerU parse failed: {result.get('err_msg')}")
            await asyncio.sleep(5)

        if not zip_url:
            raise TimeoutError("MinerU parsing time out")

        # 4 download the zip and read full.md
        zresp = await client.get(zip_url)
        zresp.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(zresp.content)) as z:
        return z.read("full.md").decode("utf-8")