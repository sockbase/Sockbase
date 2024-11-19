## Sockbase

### 環境構築

#### 推奨ツール

- VSCode
  - VSCode拡張
    - [ESLint](https://marketvenue.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

#### 処理系バージョン

| | |
| - | - |
| node | 20 |

#### 共通

```bash
git clone https://github.com/sockbase/Sockbase.git Sockbase
yarn install
firebase use <Firebase環境名>
firebase target:apply hosting user <Firebase Hosting アプリケーション名 (ユーザアプリケーション用)>
firebase target:apply hosting admin <Firebase Hosting アプリケーション名 (管理アプリケーション用)>
firebase target:apply hosting circlelist <Firebase Hosting アプリケーション名 (サークルリスト用)>
```

ユーザアプリケーション・管理アプリケーションの開発には、開発用 SSL 証明書を作成する必要があります。  
mkcert を使用して作成した証明書を `~/certs` に配置してください。  
ファイル名は `localhost.pem` `localhost-key.pem` となるようにしてください。

#### ユーザアプリケーション (user)

```bash
yarn workspace user install
```

#### 管理アプリケーション (admin)

```bash
yarn workspace admin install
```

#### Cloud Functions

```bash
yarn workspace functions install
```

#### サークルリスト

```bash
yarn workspace circlelist install
```

### 開発

#### ユーザアプリケーション (user)

- 作業ディレクトリ: packages/user 以下

```bash
yarn workspace user dev
```

#### 管理アプリケーション (admin)

- 作業ディレクトリ: packages/admin 以下

```bash
yarn workspace admin dev
```

#### サークルリスト

- 作業ディレクトリ: packages/circlelist 以下

```bash
yarn workspace circlelist dev
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
| ユーザアプリケーション | hosting:user |
| 管理アプリケーション | hosting:admin |
| サークルリスト | hosting:circlelist |
| Cloud Functions | functions |
| Firestoreルール | firestore |
| Firebase Storageルール | storage |
