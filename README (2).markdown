# Smart Grocery Management System / スマート食料管理システム

## Table of Contents
- [English Version](#english-version)
- [Japanese Version](#japanese-version)

## English Version

### Smart Grocery Management System
The **Smart Grocery Management System** is a web application designed to help households manage food inventory, plan meals, and track consumption efficiently. It is ideal for families aiming to reduce food waste and streamline grocery planning. The system supports three roles: **Home Cook** (manages food inventory, meal plans, and shopping lists), **Family Member** (views consumption reports and collaborates on shopping lists), and **Admin** (manages users and system performance).

### Key Features
- **Meal Planning & Food Management**: Home Cooks can create meal plans, manage refrigerator inventory, track expiration dates, and receive notifications for expiring food.
- **Shopping List Collaboration**: Create, categorize, and share shopping lists among family members.
- **Consumption Tracking**: Family Members can view reports on food consumption, expired or wasted food, and analyze trends.
- **System Administration**: Admins manage user accounts, data categories, user-generated content, and monitor system performance.

### Problem Solved
- **Food Waste**: Tracks expiration dates and sends notifications to minimize waste.
- **Inefficient Planning**: Simplifies meal planning and shopping list creation for better coordination.
- **Limited Insights**: Provides consumption reports to optimize grocery habits.

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/smart-grocery-management-system.git
   cd smart-grocery-management-system
   ```

2. **Backend Setup**:
   - Navigate to backend directory:
     ```bash
     cd backend
     ```
   - Create and activate Anaconda environment:
     ```bash
     conda create -n food-management python=3.8
     conda activate food-management
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     pip install pyodbc
     ```
   - Create `.env` file in `backend/`:
     ```
     SECRET_KEY=your-django-secret-key
     DEBUG=True
     DATABASE_URL=DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=food_management;UID=your-username;PWD=your-password
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_HOST_USER=your-email@gmail.com
     EMAIL_HOST_PASSWORD=your-email-password
     ```
   - Create database in SQL Server:
     ```sql
     CREATE DATABASE food_management;
     GO
     ```
   - Configure `DATABASES` in `backend/settings.py`:
     ```python
     DATABASES = {
         'default': {
             'ENGINE': 'sql_server.pyodbc',
             'NAME': 'food_management',
             'USER': 'your-username',
             'PASSWORD': 'your-password',
             'HOST': 'localhost',
             'PORT': '',
             'OPTIONS': {
                 'driver': 'ODBC Driver 17 for SQL Server',
             },
         }
     }
     ```
   - Run migrations:
     ```bash
     python manage.py makemigrations
     python manage.py migrate
     ```
   - (Optional) Create superuser:
     ```bash
     python manage.py createsuperuser
     ```

3. **Frontend Setup**:
   - Navigate to frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create `.env` file in `frontend/`:
     ```
     VITE_API_URL=http://localhost:8000/api
     ```

### Running the Project
1. **Start Backend**:
   ```bash
   cd backend
   conda activate food-management
   python manage.py runserver
   ```
   Backend runs at: `http://localhost:8000`

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`

3. **Access the Application**:
   Open your browser and navigate to: `http://localhost:3000`  
   Log in using a registered account or superuser credentials.

### Usage
- **Home Cook**: Manage food inventory, create meal plans, and share shopping lists.
- **Family Member**: View consumption reports and collaborate on shopping lists.
- **Admin**: Manage users, data categories, and monitor system performance.

### Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request with your changes.

### License
This project is licensed under the MIT License.

---

## Japanese Version / 日本語版

### スマート食料管理システム
**スマート食料管理システム**は、家庭での食品在庫管理、食事計画、消費追跡を効率的に行うためのウェブアプリケーションです。食品の無駄を減らし、食料計画を効率化したい家庭に最適です。3つの主な役割をサポートします：**ホームクック**（食品在庫、食事計画、買い物リストの管理）、**家族メンバー**（消費レポートの閲覧、買い物リストの共有）、**管理者**（ユーザーおよびシステムパフォーマンスの管理）。

### 主な機能
- **食事計画と食品管理**: ホームクックは食事計画を作成し、冷蔵庫の在庫を管理し、賞味期限を追跡し、期限切れの通知を受け取れます。
- **買い物リストの共同作業**: 買い物リストを作成、カテゴリ分けし、家族間で共有できます。
- **消費追跡**: 家族メンバーは食品消費、期限切れ、または無駄になった食品のレポートを閲覧し、傾向を分析できます。
- **システム管理**: 管理者はユーザーアカウント、データカテゴリ、ユーザー生成コンテンツを管理し、システムパフォーマンスを監視します。

### 解決される問題
- **食品の無駄**: 賞味期限の追跡と通知により無駄を最小限に抑えます。
- **非効率な計画**: 食事計画と買い物リスト作成を簡素化し、調整を容易にします。
- **洞察の不足**: 消費レポートを提供し、食料購入の習慣を最適化します。

### インストール方法
1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/your-username/smart-grocery-management-system.git
   cd smart-grocery-management-system
   ```

2. **バックエンドのセットアップ**:
   - バックエンドディレクトリに移動:
     ```bash
     cd backend
     ```
   - Anaconda環境の作成と有効化:
     ```bash
     conda create -n food-management python=3.8
     conda activate food-management
     ```
   - 依存関係のインストール:
     ```bash
     pip install -r requirements.txt
     pip install pyodbc
     ```
   - `backend/` に `.env` ファイルを作成:
     ```
     SECRET_KEY=your-django-secret-key
     DEBUG=True
     DATABASE_URL=DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=food_management;UID=your-username;PWD=your-password
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_HOST_USER=your-email@gmail.com
     EMAIL_HOST_PASSWORD=your-email-password
     ```
   - SQL Serverでデータベースを作成:
     ```sql
     CREATE DATABASE food_management;
     GO
     ```
   - `backend/settings.py` で `DATABASES` を設定:
     ```python
     DATABASES = {
         'default': {
             'ENGINE': 'sql_server.pyodbc',
             'NAME': 'food_management',
             'USER': 'your-username',
             'PASSWORD': 'your-password',
             'HOST': 'localhost',
             'PORT': '',
             'OPTIONS': {
                 'driver': 'ODBC Driver 17 for SQL Server',
             },
         }
     }
     ```
   - マイグレーションを実行:
     ```bash
     python manage.py makemigrations
     python manage.py migrate
     ```
   - （オプション）スーパーユーザーを作成:
     ```bash
     python manage.py createsuperuser
     ```

3. **フロントエンドのセットアップ**:
   - フロントエンドディレクトリに移動:
     ```bash
     cd ../frontend
     ```
   - 依存関係のインストール:
     ```bash
     npm install
     ```
   - `frontend/` に `.env` ファイルを作成:
     ```
     VITE_API_URL=http://localhost:8000/api
     ```

### プロジェクトの実行
1. **バックエンドの起動**:
   ```bash
   cd backend
   conda activate food-management
   python manage.py runserver
   ```
   バックエンドは `http://localhost:8000` で動作します。

2. **フロントエンドの起動**:
   ```bash
   cd frontend
   npm run dev
   ```
   フロントエンドは `http://localhost:3000` で動作します。

3. **アプリケーションにアクセス**:
   ブラウザを開き、`http://localhost:3000` にアクセスします。  
   登録済みのアカウントまたはスーパーユーザーの認証情報でログインします。

### 使用方法
- **ホームクック**: 食品在庫の管理、食事計画の作成、買い物リストの共有。
- **家族メンバー**: 消費レポートの閲覧、買い物リストの共同作業。
- **管理者**: ユーザー、データカテゴリ、システムパフォーマンスの管理。

### 貢献
貢献を歓迎します！リポジトリをフォークし、機能ブランチを作成し、変更をプルリクエストとして提出してください。

### ライセンス
このプロジェクトはMITライセンスの下でライセンスされています。