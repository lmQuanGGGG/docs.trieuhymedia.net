#!/usr/bin/env bash
# Deploy Triệu Hỷ Media Docs trên droplet. Nhận mã nguồn dạng tar qua stdin
# (GitHub Actions: git archive HEAD | ssh docsapp@droplet), build trong thư mục
# release mới, rồi chuyển symlink "current" và khởi động lại. Lỗi thì giữ bản cũ.
set -euo pipefail

BASE=/opt/trieuhymedia-docs
# Chỉ thư mục app/ thuộc docsapp; phần còn lại của BASE thuộc root
APP=$BASE/app
RELEASES=$APP/releases
KEEP=3
STAMP=$(date +%Y%m%d%H%M%S)
NEW=$RELEASES/$STAMP
export PATH=/opt/node/bin:$PATH

mkdir -p "$RELEASES" "$NEW"
tar -x -C "$NEW"
cd "$NEW"

# Biến môi trường production (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL…)
set -a
# shellcheck disable=SC1091
. "$BASE/shared/.env"
set +a
# NODE_ENV=production khiến npm bỏ devDependencies cần cho build
export NODE_ENV=development

echo "==> npm ci"
npm ci --no-audit --no-fund --loglevel=error
echo "==> prisma generate + migrate deploy"
npx prisma generate --config prisma/prisma.config.ts >/dev/null
npx prisma migrate deploy --config prisma/prisma.config.ts
echo "==> next build"
NODE_ENV=production npx next build

PREV=$(readlink -f "$APP/current" 2>/dev/null || true)
ln -sfn "$NEW" "$APP/current.tmp" && mv -T "$APP/current.tmp" "$APP/current"
sudo /usr/bin/systemctl restart trieuhy-docs

echo "==> kiểm tra sức khoẻ"
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3100/vi/login; then
    echo "OK: đang chạy bản $STAMP"
    ls -1dt "$RELEASES"/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    exit 0
  fi
  sleep 2
done

echo "LỖI: bản mới không khởi động được, quay về bản trước" >&2
if [ -n "$PREV" ] && [ -d "$PREV" ]; then
  ln -sfn "$PREV" "$APP/current.tmp" && mv -T "$APP/current.tmp" "$APP/current"
  sudo /usr/bin/systemctl restart trieuhy-docs
fi
exit 1
