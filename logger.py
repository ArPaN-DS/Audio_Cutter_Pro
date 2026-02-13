import psycopg2
from datetime import datetime
import os

# --- DATABASE CONFIGURATION ---
DB_CONFIG = {
    'dbname': 'audio_db',    # The database you created
    'user': 'postgres',      # The default admin user
    'password': '12345', # <--- PUT YOUR PASSWORD HERE
    'host': 'localhost',
    'port': '5432'
}

def log_upload_details(request, filename, file_size_bytes, target_format, status="Success"):
    """
    Connects to PostgreSQL and inserts a new log row.
    """
    conn = None
    try:
        # 1. GATHER DATA
        timestamp = datetime.now()
        
        # Robust IP detection
        if request.headers.getlist("X-Forwarded-For"):
            ip_address = request.headers.getlist("X-Forwarded-For")[0]
        else:
            ip_address = request.remote_addr

        user_agent = request.headers.get('User-Agent')
        file_ext = os.path.splitext(filename)[1]
        size_mb = round(file_size_bytes / (1024 * 1024), 2)

        # 2. CONNECT TO DATABASE
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 3. EXECUTE SQL QUERY
        query = """
            INSERT INTO upload_logs 
            (timestamp, ip_address, user_device, file_name, file_ext, file_size_mb, target_format, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        data = (timestamp, ip_address, user_agent, filename, file_ext, size_mb, target_format, status)
        
        cur.execute(query, data)
        
        # 4. SAVE CHANGES
        conn.commit()
        cur.close()

    except Exception as e:
        # If DB fails, print error but don't crash the User's download
        print(f"!!! DATABASE ERROR: {e}")
        
    finally:
        # 5. ALWAYS CLOSE CONNECTION
        if conn is not None:
            conn.close()
