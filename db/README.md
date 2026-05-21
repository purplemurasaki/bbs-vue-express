# Database (DDL / DML)

掲示板アプリの MySQL スキーマと開発用シードです。

## ディレクトリ

| パス | 内容 |
| --- | --- |
| `schema/001_create_database.sql` | DB 作成・utf8mb4 設定 |
| `schema/002_create_tables.sql` | `posts` / `post_images` DDL |
| `seeds/dev_seed.sql` | 開発用データ（12 投稿 + 画像サンプル） |

設計の詳細は [docs/schema_design.md](../docs/schema_design.md) を参照してください。

## ローカル起動（docker compose）

前提: Docker Desktop 等で `docker compose` が使えること。

```powershell
# リポジトリルートで
docker compose up -d

# ヘルスチェック完了まで待つ（任意）
docker compose ps
```

初回起動時のみ `db/schema/*.sql` が `/docker-entrypoint-initdb.d` 経由で自動適用されます。

### シード投入（手動・再実行可）

```powershell
Get-Content db/seeds/dev_seed.sql | docker compose exec -T mysql mysql -uroot -pbbs_dev_root bbs
```

### 確認

```powershell
docker compose exec mysql mysql -uroot -pbbs_dev_root bbs -e "SELECT COUNT(*) AS posts FROM posts;"
docker compose exec mysql mysql -uroot -pbbs_dev_root bbs -e "SELECT id, author, created_at FROM posts ORDER BY created_at DESC LIMIT 11;"
```

- `posts` が 12 件
- `ORDER BY created_at DESC` で id 1〜10 が 1 ページ目、11〜12 が 2 ページ目想定

### CASCADE 削除の確認（任意）

```powershell
docker compose exec mysql mysql -uroot -pbbs_dev_root bbs -e "SELECT COUNT(*) FROM post_images WHERE post_id=5;"
docker compose exec mysql mysql -uroot -pbbs_dev_root bbs -e "DELETE FROM posts WHERE id=5;"
docker compose exec mysql mysql -uroot -pbbs_dev_root bbs -e "SELECT COUNT(*) FROM post_images WHERE post_id=5;"
```

2 回目の `COUNT` が 0 であること。

## スキーマのやり直し

init スクリプトは **ボリューム初回作成時のみ** 実行されます。DDL を変更した場合はボリュームを削除して再起動してください。

```powershell
docker compose down -v
docker compose up -d
# 再度シードを投入
```

## ポート競合

ホストの 3306 が使用中の場合は `docker-compose.yml` の `ports` を例: `3307:3306` に変更し、`.env` の `MYSQL_PORT` も合わせてください。
