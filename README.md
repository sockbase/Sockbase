## Sockbase Main-repository

### 環境構築

#### 処理系バージョン

| | |
| - | - |
| node | 18 |

#### 共通

```bash
git clone https://github.com/sockbase/Sockbase.git Sockbase
yarn install
firebase use <Firebase環境名>
```

#### クライアント

```bash
cd packages/client
yarn install
```

#### Cloud Funcitons

```bash
cd packages/functions
yarn install
```

### 開発

#### クライアント
```bash
cd packages/client
yarn dev
```

### デプロイ

#### 全て
```bash
firebase deploy
```

#### 個別

- `--only` オプションの後にデプロイしたいサービスのIDを入力してください。
- 複数指定する場合は `--only hosting --only functions` のように指定してください。

| サービス | ID |
| - | - |
| クライアント(Hosting) | hosting |
| Cloud Functions | functions |
| Firestoreルール | firestore |
| Firebase Storageルール | storage |
