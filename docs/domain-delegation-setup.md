# Google Workspace ドメイン権限委譲 設定手順

## 概要
サービスアカウントが `info@digital-hakcs.com` として Google Drive にアクセスできるようにするため、ドメイン権限委譲を設定します。

## 現在の状況
- **サービスアカウント**: `calendar-sync-sa@digital-hacks-admincalendar.iam.gserviceaccount.com`
- **Client ID**: `116220813572250652702`
- **権限委譲先**: `info@digital-hakcs.com`

## 設定手順

### 1. Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト `digital-hacks-admincalendar` を選択
3. **IAM & Admin** > **Service Accounts** に移動
4. サービスアカウント `calendar-sync-sa@digital-hacks-admincalendar.iam.gserviceaccount.com` をクリック
5. **詳細** タブで **"Enable G Suite Domain-wide Delegation"** をチェック
6. 保存

### 2. Google Workspace Admin Console での設定

1. [Google Workspace Admin Console](https://admin.google.com/) にアクセス
2. **セキュリティ** > **アクセスとデータ管理** > **API の制御** に移動
3. **ドメイン全体の委任** をクリック
4. **新しく追加** をクリック
5. 以下の情報を入力：
   - **クライアント ID**: `116220813572250652702`
   - **OAuth スコープ**: 
     ```
     https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/calendar.readonly
     ```
6. **承認** をクリック

### 3. 確認事項

- `info@digital-hakcs.com` が有効な Google Workspace アカウントであること
- 該当アカウントが面談動画ファイルにアクセス権限を持っていること
- ドメイン `digital-hakcs.com` が Google Workspace で管理されていること

## テスト

設定完了後、以下のコマンドでテストを実行：

```bash
npm run test-domain-delegation
```

## トラブルシューティング

### エラー: "Invalid email or User ID"
- ドメイン権限委譲が正しく設定されていない
- `info@digital-hakcs.com` が存在しないか、アクセス権限がない
- 設定の反映に時間がかかる場合がある（最大10分程度）

### エラー: "unauthorized_client"
- Google Cloud Console でドメイン権限委譲が有効化されていない
- Google Workspace Admin Console でクライアント ID が承認されていない

### エラー: "access_denied"
- `info@digital-hakcs.com` がファイルにアクセス権限を持っていない
- ファイルの共有設定を確認

## 代替案

ドメイン権限委譲が設定できない場合：
1. `info@digital-hakcs.com` でOAuth2認証を使用
2. 動画ファイルをサービスアカウントと共有
3. ファイル名からの時間推定機能を使用 