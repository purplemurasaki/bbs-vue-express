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

## 主な outputs

```bash
terraform output app_url
terraform output ec2_instance_id
terraform output s3_bucket_name
terraform output cloudfront_url
terraform output -raw rds_endpoint
terraform output db_secret_arn
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

## 破棄

検証環境を削除する場合:

```bash
terraform destroy
```

`rds_skip_final_snapshot = false` の場合は最終スナップショットが作成される。
