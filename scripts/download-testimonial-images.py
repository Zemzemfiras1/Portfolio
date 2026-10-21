import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from PIL import Image, UnidentifiedImageError


DATA_FILE = Path("data/community-testimonials.json")
IMAGE_DIR = Path("images/testimonial")
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MiB
ALLOWED_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


def fail(message):
    raise RuntimeError(message)


def extract_drive_file_id(url):
    """Accept only the expected Google Drive image URL format."""
    try:
        parsed = urlparse(url)
    except (TypeError, ValueError):
        return None

    if (
        parsed.scheme != "https"
        or parsed.hostname not in {
            "drive.google.com",
            "www.drive.google.com",
        }
        or parsed.path != "/uc"
        or parsed.username
        or parsed.password
        or parsed.port
        or parsed.fragment
    ):
        return None

    params = parse_qs(parsed.query, strict_parsing=True)

    if set(params) != {"export", "id"}:
        return None

    file_id = params["id"][0]

    if (
        params["export"] != ["view"]
        or not re.fullmatch(r"[A-Za-z0-9_-]+", file_id)
    ):
        return None

    return file_id


def download_drive_image(file_id, destination):
    """Download a public Google Drive image using supported gdown syntax."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temporary_file = Path(temp_dir) / "download"

        command = [
            "gdown",
            f"https://drive.google.com/uc?id={file_id}",
            "--output",
            str(temporary_file),
            "--no-cookies",
            "--retries",
            "3",
            "--timeout",
            "30",
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )

        if result.returncode != 0 or not temporary_file.is_file():
            details = (result.stderr or result.stdout or "").strip()
            fail(
                f"Could not download Google Drive image {file_id}. "
                "Confirm that the file is shared as "
                "'Anyone with the link — Viewer'. "
                f"gdown output: {details[-2000:]}"
            )

        size = temporary_file.stat().st_size

        if size == 0:
            fail(f"Downloaded image {file_id} is empty.")

        if size > MAX_IMAGE_SIZE:
            fail(f"Image {file_id} exceeds the 5 MiB limit.")

        try:
            with Image.open(temporary_file) as image:
                image_format = image.format
                image.verify()

            extension = ALLOWED_FORMATS.get(image_format)

            if not extension:
                fail(
                    f"Unsupported image format for {file_id}: "
                    f"{image_format!r}. Use JPEG, PNG, or WebP."
                )

            # Verify that the image can also be decoded.
            with Image.open(temporary_file) as image:
                image.load()

        except (UnidentifiedImageError, OSError) as exc:
            fail(
                f"Downloaded file {file_id} is not a valid image: {exc}"
            )

        destination = destination.with_suffix(extension)
        destination.parent.mkdir(parents=True, exist_ok=True)

        destination.write_bytes(temporary_file.read_bytes())

        return destination


def main():
    if not DATA_FILE.is_file():
        fail(f"Testimonials JSON file not found: {DATA_FILE}")

    with DATA_FILE.open("r", encoding="utf-8") as file:
        testimonials = json.load(file)

    if not isinstance(testimonials, list):
        fail(f"{DATA_FILE} must contain a JSON array.")

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    changed = False

    for testimonial in testimonials:
        if not isinstance(testimonial, dict):
            fail("The testimonials JSON contains an invalid record.")

        url = testimonial.get("imageUrl", "")

        if not url:
            continue

        if not isinstance(url, str):
            fail(
                f"Invalid imageUrl for testimonial "
                f"{testimonial.get('id', 'unknown')}."
            )

        # Already-local paths do not need downloading.
        if url.startswith("images/testimonial/"):
            continue

        file_id = extract_drive_file_id(url)

        if not file_id:
            fail(
                f"Unsupported image URL for testimonial "
                f"{testimonial.get('id', 'unknown')}: {url}"
            )

        testimonial_id = testimonial.get("id", file_id)

        image_name = re.sub(
            r"[^A-Za-z0-9_-]",
            "_",
            str(testimonial_id),
        )

        destination = IMAGE_DIR / image_name

        print(f"Downloading photo for testimonial {testimonial_id}...")

        try:
            saved_image = download_drive_image(file_id, destination)
        except subprocess.TimeoutExpired:
            fail(
                f"Timed out downloading the photo for "
                f"testimonial {testimonial_id}."
            )

        # Use a relative path so the website can load the image.
        testimonial["imageUrl"] = saved_image.as_posix()
        changed = True

        print(f"Saved image: {saved_image}")
        print(f"Updated imageUrl: {testimonial['imageUrl']}")

    if changed:
        with DATA_FILE.open("w", encoding="utf-8") as file:
            json.dump(
                testimonials,
                file,
                indent=2,
                ensure_ascii=False,
            )
            file.write("\n")

        print(f"Updated {DATA_FILE}")
    else:
        print("No remote testimonial images needed downloading.")

    print("Image processing completed.")


if __name__ == "__main__":
    main()
