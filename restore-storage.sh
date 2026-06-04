#!/bin/bash
# Storage restore script
# Run: bash restore-storage.sh YOUR_PROJECT_REF YOUR_SERVICE_ROLE_KEY

PROJECT_REF="${1:?Pass project ref as arg 1}"
SERVICE_ROLE_KEY="${2:?Pass service role key as arg 2}"

SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
ZIP="/Users/animesh/Downloads/gielqkfnsypadbplaaci.storage.zip"
TMP_DIR="/tmp/supabase-storage-restore"

echo "Extracting zip..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
unzip -q "$ZIP" -d "$TMP_DIR"

upload() {
  local BUCKET="$1"
  local FILE_PATH="$2"    # full local path
  local OBJECT_NAME="$3"  # path inside bucket

  local MIME="application/octet-stream"
  case "$FILE_PATH" in
    *.mp4)   MIME="video/mp4" ;;
    *.jpg|*.jpeg) MIME="image/jpeg" ;;
    *.png)   MIME="image/png" ;;
    *.pdf)   MIME="application/pdf" ;;
  esac

  echo "  Uploading $BUCKET/$OBJECT_NAME ..."
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${OBJECT_NAME}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: ${MIME}" \
    -H "x-upsert: true" \
    --data-binary "@${FILE_PATH}")
  echo "    → HTTP $HTTP"
}

BASE="$TMP_DIR/gielqkfnsypadbplaaci"

echo ""
echo "=== Uploading product videos ==="
for f in "$BASE/prodcut-vidoes/"*; do
  [ -f "$f" ] || continue
  upload "prodcut-vidoes" "$f" "$(basename "$f")"
done

echo ""
echo "=== Uploading hero section images ==="
for f in "$BASE/product-images/hero-section/"*; do
  [ -f "$f" ] || continue
  upload "product-images" "$f" "hero-section/$(basename "$f")"
done

echo ""
echo "Done! All files uploaded."
rm -rf "$TMP_DIR"
