# デジタルハックス面談管理システム

## 📋 概要

デジタルハックス面談管理システムは、講師と生徒の面談履歴を効率的に管理するためのWebアプリケーションです。Google Calendarとの連携により、面談データの自動同期と実際の面談時間の抽出を行い、詳細な統計分析を提供します。

## 🚀 主要機能

### 📊 ダッシュボード
- **リアルタイム統計**: 面談数、平均時間、講師別パフォーマンス
- **月次カレンダー**: 面談スケジュールの視覚的表示
- **検索・フィルター**: 講師、日付、カテゴリ別の面談検索
- **データエクスポート**: CSV形式での統計データ出力

### 👥 講師管理
- 講師情報の追加・編集・削除
- 講師別面談統計の表示
- パフォーマンス分析

### 📅 面談履歴管理
- Google Calendarからの自動同期
- 実際の面談時間の自動抽出（Google Drive動画解析）
- 面談カテゴリの分類（teacher/entry）

### 📈 統計分析
- **日次統計**: 講師別・全体の日次パフォーマンス
- **月次統計**: 月単位での集計データ
- **実時間vs予定時間**: 実際の面談効率の分析

## 🛠 技術スタック

### フロントエンド
- **Next.js 14**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: モダンなスタイリング
- **Lucide React**: アイコンライブラリ

### バックエンド
- **Supabase**: データベース・認証・API
- **PostgreSQL**: メインデータベース
- **Google Calendar API**: カレンダー連携
- **Google Drive API**: 動画時間抽出

### 認証・セキュリティ
- **Supabase Auth**: セキュアな認証システム
- **Row Level Security (RLS)**: データアクセス制御
- **Google Domain-wide Delegation**: サービスアカウント権限委譲

## 📁 プロジェクト構造

```
digital-hacks-mtgadmin/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── login/         # 認証API
│   │   ├── teachers/      # 講師管理API
│   │   └── meeting-*/     # 面談関連API
│   ├── dashboard/         # ダッシュボードページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── auth/             # 認証関連
│   └── dashboard/        # ダッシュボード関連
├── lib/                  # ユーティリティライブラリ
│   ├── supabase.ts       # Supabaseクライアント
│   ├── api.ts            # API関数
│   └── utils.ts          # 共通ユーティリティ
├── scripts/              # データ同期スクリプト
├── sql/                  # SQLスキーマ
└── types/                # TypeScript型定義
```

## 🗄 データベーススキーマ

### 主要テーブル

#### `teachers`
講師情報の管理
```sql
- id: UUID (Primary Key)
- name: VARCHAR (講師名)
- email: VARCHAR (メールアドレス)
- created_at: TIMESTAMP
```

#### `meeting_history`
面談履歴の記録
```sql
- id: BIGSERIAL (Primary Key)
- calendar_event_id: VARCHAR (Google Calendar ID)
- title: VARCHAR (面談タイトル)
- organizer_email: VARCHAR (主催者メール)
- start_time: TIMESTAMP (開始時間)
- end_time: TIMESTAMP (終了時間)
- duration_minutes: INTEGER (予定時間)
- actual_duration_minutes: INTEGER (実際の時間)
- category: VARCHAR (teacher/entry)
- attendee_emails: TEXT[] (参加者メール)
```

#### 統計テーブル
- `stats_teacher_day`: 講師別日次統計
- `stats_teacher_month`: 講師別月次統計
- `stats_all_day`: 全体日次統計
- `stats_all_month`: 全体月次統計

## ⚙️ セットアップ

### 1. 環境変数設定
`.env.local`ファイルを作成:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CALENDAR_CREDENTIALS=your_google_credentials_json
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. データベースセットアップ
```bash
# Supabaseプロジェクトの作成とテーブル作成
# sql/フォルダ内のSQLファイルを実行
```

### 4. Google API設定
1. Google Cloud Consoleでプロジェクト作成
2. Calendar API・Drive APIを有効化
3. サービスアカウント作成
4. Domain-wide Delegationの設定

### 5. アプリケーション起動
```bash
npm run dev
```

## 📋 使用方法

### 面談データの同期

#### 日次同期
```bash
npm run sync-history daily
```

#### 期間指定同期
```bash
npm run sync-history bulk 2025-07-01 2025-07-16
```

#### 実際時間の更新
```bash
npm run update-durations
```

### ドメイン権限委譲テスト
```bash
npm run test-domain-delegation
```

## 🔧 主要機能の詳細

### Google Drive動画時間抽出
- **Domain-wide Delegation**を使用してサービスアカウントがユーザーを偽装
- 面談録画動画のメタデータから実際の面談時間を自動抽出
- 成功率約76%（288件中219件成功）

### 統計計算
- **実際時間優先**: `actual_duration_minutes`が存在する場合は実際時間を使用
- **フォールバック**: 実際時間がない場合は予定時間を使用
- **リアルタイム更新**: 面談データ同期と同時に統計を更新

### セキュリティ
- **Row Level Security**: ユーザー別データアクセス制御
- **認証必須**: 全ての管理機能に認証が必要
- **API保護**: サービスロールキーによるAPI保護

## 📊 パフォーマンス指標

### 現在の実績（2025年7月1-16日）
- **総面談数**: 288件
- **実時間抽出成功**: 219件（76%成功率）
- **平均予定時間**: 60分
- **平均実際時間**: 50.97分
- **効率性**: 実際時間は予定より約15%短縮

## 🐛 トラブルシューティング

### よくある問題

#### Google API権限エラー
```
Error: Invalid email or User ID
```
**解決方法**: Domain-wide Delegationの設定とメールアドレスを確認

#### 同期エラー
```
Calendar API quota exceeded
```
**解決方法**: Google Cloud ConsoleでAPI制限を確認・調整

#### データベース接続エラー
**解決方法**: Supabase接続設定と環境変数を確認

## 🔄 メンテナンス

### 定期的なタスク
- **週次**: 面談データの同期確認
- **月次**: 統計データの整合性チェック
- **四半期**: Google API使用量の確認

### データクリーンアップ
```bash
# 古いデータの削除（必要に応じて）
npm run clean-old-data
```

## 📝 開発ガイドライン

### コード規約
- **TypeScript**: 厳密な型定義を使用
- **ESLint**: コード品質の維持
- **Prettier**: 一貫したフォーマット

### コンポーネント設計
- **再利用可能**: 共通コンポーネントの作成
- **型安全**: PropsとStateの型定義
- **アクセシビリティ**: ARIA属性の適切な使用

## 🚀 今後の機能予定

- [ ] **通知システム**: 面談リマインダー
- [ ] **レポート生成**: PDF形式の統計レポート
- [ ] **モバイル対応**: レスポンシブデザインの改善
- [ ] **API拡張**: 外部システムとの連携

## 📞 サポート

技術的な問題や機能要望については、開発チームまでお問い合わせください。

同期コマンド:
npm run sync-history bulk 2025-07-17 2025-07-17
---

**バージョン**: 1.0.0  
**最終更新**: 2025年7月17日  
**開発**: デジタルハックス技術チーム 