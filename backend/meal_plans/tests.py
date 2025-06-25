import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-TSILIEL;"
    "DATABASE=FoodRecipeDB;"
    "Trusted_Connection=yes;"
)
try:
    conn = pyodbc.connect(conn_str)
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")