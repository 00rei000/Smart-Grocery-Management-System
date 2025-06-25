import pandas as pd
import pyodbc
import environ
import os

env = environ.Env()
# reading .env file
environ.Env.read_env()

DRIVER_NAME="ODBC Driver 17 for SQL Server"
SERVER_NAME="DESKTOP-TSILIEL"
DATABASE_NAME="FoodRecipeDB"
CSV_FILE_PATH="D:\cac loai files\\archive\Food Ingredients and Recipe Dataset with Image Name Mapping.csv"
TRUSTED_CONNECTION="yes"
DATABASE_PORT="1433"

available_drivers = pyodbc.drivers()
if DRIVER_NAME not in available_drivers:
    print(f"Lỗi: Driver {DRIVER_NAME} không tồn tại. Các driver có sẵn: {available_drivers}")
    exit(1)

# Kiểm tra file CSV tồn tại
if not os.path.exists(CSV_FILE_PATH):
    print(f"Lỗi: File CSV không tìm thấy tại {CSV_FILE_PATH}")
    exit(1)


env = environ.Env()
# reading .env file
environ.Env.read_env()
DRIVER_NAME = env('DRIVER_NAME')
SERVER_NAME = env('SERVER_NAME')
DATABASE_NAME = env('DATABASE_NAME')
CSV_FILE_PATH = env('CSV_FILE_PATH')
TRUSTED_CONNECTION = env('TRUSTED_CONNECTION')
# Đọc CSV
try:
    df = pd.read_csv(CSV_FILE_PATH, encoding='utf-8', usecols=['Title', 'Ingredients', 'Instructions', 'Image_Name', 'Cleaned_Ingredients'])
except FileNotFoundError:
    print(f"Lỗi: File CSV không tìm thấy tại {CSV_FILE_PATH}")
    exit(1)
except Exception as e:
    print(f"Lỗi khi đọc CSV: {e}")
    exit(1)

# Xử lý dữ liệu
df = df.dropna(subset=['Title', 'Instructions'], how='all')
df['Title'] = df['Title'].fillna('Không có tiêu đề')
df['Instructions'] = df['Instructions'].fillna('Không có hướng dẫn')
df['Image_Name'] = df['Image_Name'].fillna('')
df['Cleaned_Ingredients'] = df['Cleaned_Ingredients'].fillna('')
df['img_url'] = df['Image_Name'].apply(lambda x: f"/static/images/{x}.jpg" if x else "")

# Giới hạn độ dài chuỗi
df['Title'] = df['Title'].str.slice(0, 255)
df['Image_Name'] = df['Image_Name'].str.slice(0, 255)
df['img_url'] = df['img_url'].str.slice(0, 255)

# Ép kiểu thành chuỗi
df['Title'] = df['Title'].astype(str)
df['Ingredients'] = df['Ingredients'].astype(str)
df['Instructions'] = df['Instructions'].astype(str)
df['Image_Name'] = df['Image_Name'].astype(str)
df['Cleaned_Ingredients'] = df['Cleaned_Ingredients'].astype(str)
df['img_url'] = df['img_url'].astype(str)

# Kết nối SQL Server
try:
    conn = pyodbc.connect(
        f'DRIVER={{{DRIVER_NAME}}};'
        f'SERVER={SERVER_NAME};'
        f'DATABASE={DATABASE_NAME};'
        f'PORT={DATABASE_PORT};'
        f'Trusted_Connection={TRUSTED_CONNECTION};'
    )
    print("Kết nối SQL Server thành công!")
except pyodbc.Error as e:
    print(f"Lỗi kết nối SQL Server: {e}")
    exit(1)

cursor = conn.cursor()

# Kiểm tra bảng Recipes
try:
    cursor.execute("SELECT * FROM Recipes WHERE 1=0")  # Kiểm tra bảng mà không lấy dữ liệu
except pyodbc.Error as e:
    print(f"Lỗi: Bảng Recipes không tồn tại hoặc cấu trúc không đúng: {e}")
    exit(1)


print(df[['Image_Name', 'img_url']].head(10))
# Chèn dữ liệu
for index, row in df.iterrows():
    try:
        cursor.execute("""
            INSERT INTO Recipes (Title, Ingredients, Instructions, Image_Name, Cleaned_Ingredients, img_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, row['Title'], row['Ingredients'], row['Instructions'], row['Image_Name'], row['Cleaned_Ingredients'], row['img_url'])
    except pyodbc.Error as e:
        print(f"Lỗi tại dòng {index}: {e}")
        print(f"Dữ liệu: {row}")
        continue

# Commit và đóng kết nối
conn.commit()
cursor.close()
conn.close()

print("Data imported successfully!")