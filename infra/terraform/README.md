# Terraform（手順11）

掲示板アプリの AWS 基盤（VPC / EC2 / RDS / S3 / CloudFront）を構築する。

設計の詳細は [docs/infra_design.md](../../docs/infra_design.md) を参照。

## 前提

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- AWS CLI 認証済み（`aws sts get-caller-identity` が成功すること）
- リージョン既定: `ap-northeast-1`

## 初回セットアップ

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を必要に応じて編集（コミットしない）
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

### 注意（PowerShell）

- 変数ファイル: `Copy-Item terraform.tfvars.example terraform.tfvars`
- `terraform.tfstate` は `terraform apply` 時に Terraform が自動生成する。**手動で作成・コピーしない**（`terraform.tfvars.example` を `terraform.tfstate` にコピーすると `terraform init` が失敗する）
- 誤って tfstate を壊した場合（未 `apply` のとき）: `Remove-Item terraform.tfstate` のあと `terraform init` を再実行

### apply で失敗した場合（既知の制約）

- EC2: AL2023 のルートディスクは **30GB 以上**（`modules/compute` の `volume_size`）
- RDS: DB subnet group は **2 AZ 以上**の private subnet が必要（`modules/network` の `private_secondary`）

## 主な outputs

```bash
terraform output app_url
terraform output ec2_instance_id
terraform output s3_bucket_name
terraform output cloudfront_url
terraform output -raw rds_endpoint
terraform output db_secret_arn
terraform output github_actions_role_arn
terraform output deploy_bucket_name
```

## State（local）

- 初回は **local state**（`terraform.tfstate` は `.gitignore` 済み）
- チームで共有する場合は state ファイルを安全な場所にバックアップする
- 本番運用では S3 backend + DynamoDB ロックへの移行を推奨:
  1. 別途 S3 バケットと DynamoDB テーブルを作成
  2. `versions.tf` に `backend "s3" { ... }` を追加
  3. `terraform init -migrate-state` で移行

## 手順11完了後の検証チェックリスト

`terraform apply` 後、以下を確認する。

| 項目 | 確認方法 |
| --- | --- |
| SSM 接続 | AWS Console → Systems Manager → Session Manager → `ec2_instance_id` |
| RDS 到達 | SSM 上で `mysql -h <rds_endpoint> -u bbs_app -p`（Secrets Manager のパスワード） |
| S3 PUT | SSM 上で `aws s3 cp`（インスタンスロールでバケットへ PUT） |
| CloudFront GET | テストオブジェクトを PUT 後、`cloudfront_url/<key>` で GET |
| RDS 非公開 | インターネットから 3306 に到達できないこと |

DDL（`db/schema/*.sql`）とアプリデプロイは手順12で実施する。

## 手順12: CI/CD デプロイ追補

手順12のコードマージ後、**既存環境に追補 apply** する（`main` への自動 apply はしない）。

```bash
cd infra/terraform
terraform plan   # github_deploy モジュール + EC2 IAM 追補
terraform apply
```

### GitHub Repository Variables

`terraform output` の値を GitHub → Settings → Secrets and variables → Actions → **Variables** に登録する。

| Variable | output |
| --- | --- |
| `AWS_ROLE_ARN` | `github_actions_role_arn` |
| `AWS_REGION` | `ap-northeast-1` |
| `EC2_INSTANCE_ID` | `ec2_instance_id` |
| `DEPLOY_BUCKET` | `deploy_bucket_name` |
| `DB_SECRET_ARN` | `db_secret_arn` |
| `S3_BUCKET` | `s3_bucket_name` |
| `CLOUDFRONT_BASE_URL` | `cloudfront_url` |
| `CORS_ORIGIN` | `app_url` |

### 初回デプロイ

1. PR マージ前: ブランチ `work/cicd-auto-deploy` 上で Actions → **CD** → Run workflow → `bootstrap=true`
2. 成功後 `curl http://<app_url>/api/health` を確認
3. `main` マージ後は CI 成功時に CD が自動実行される

詳細は [docs/deploy_design.md](../../docs/deploy_design.md) を参照。

## 破棄

検証環境を削除する場合:

```bash
terraform destroy
```

`rds_skip_final_snapshot = false` の場合は最終スナップショットが作成される。
