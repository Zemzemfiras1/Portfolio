
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from PIL import Image

DATA_FILE = Path("data/community-testimonials.json")
IMAGE_DIR = Path("images/testimonial/community")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

with DATA_FILE.open("r", encoding="utf-8") as f:
    testimonials = json.load(f)

changed = False

for testimonial in testimonials:
    url = testimonial.get("imageUrl", "")
    if not url:
        continue

    # Leave already-local images unchanged.
    if url.startswith("images/testimonial/"):
        continue

    parsed = urlparse(url)
    file_id = parse_qs(parsed.query).get("id", [""])[0]

    if (
        parsed.hostname not in ("drive.google.com", "www.drive.google.com")
        or not re.fullmatch(r"[A-Za-z0-9_-]+", file_id)
    ):
        print(f"Skipping unsupported image URL for {testimonial.get('id')}")
        continue

    image_id = re.sub(
        r"[^A-Za-z0-9_-]", "_", testimonial.get("id", file_id)
    )

    with tempfile.TemporaryDirectory() as temp_dir:
        downloaded = Path(temp_dir) / "download"
        result = subprocess.run(
            ["gdown", "--id", file_id, "-O", str(downloaded)],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0 or not downloaded.exists():
            raise RuntimeError(
                f"Could not download Drive image for "
                f"{testimonial.get('id')}: {result.stderr}"
            )

        # Verify that the downloaded file is a real supported image.
        with Image.open(downloaded) as image:
            extension = {
                "JPEG": ".jpg",
                "PNG": ".png",
                "WEBP": ".webp",
            }.get(image.format)

            if not extension:
                raise ValueError(
                    f"Unsupported image format for {testimonial.get('id')}"
                )

            image.verify()

        destination = IMAGE_DIR / f"{image_id}{extension}"
        shutil.copyfile(downloaded, destination)

    testimonial["imageUrl"] = destination.as_posix()
    changed = True
    print(f"Added image: {destination}")

if changed:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(testimonials, f, indent=2, ensure_ascii=False)
        f.write("\n")
