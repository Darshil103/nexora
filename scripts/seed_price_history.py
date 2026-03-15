import mysql.connector
from datetime import datetime, timedelta
import random

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="darshil6410",
    database="nexora"
)
cursor = db.cursor()

# Get current date
end_date = datetime.now()

# Stocks and their current prices
stocks = {
    1: 248.12, # TFLOW
    2: 80.34,  # HSYNC
    3: 178.30, # FMTRIC
    4: 156.00, # EDUHB
    5: 313.50, # GRNEV
    6: 67.20   # AGRIX
}

insert_query = """
INSERT INTO price_history 
(date, open_price, high_price, low_price, close_price, volume, stock_id) 
VALUES (%s, %s, %s, %s, %s, %s, %s)
"""

# Base list to insert
records = []

for stock_id, current_price in stocks.items():
    # Generate 30 days of history going backwards
    # We want it to trend upwards slightly to show positive P&L on dashboard
    # So older days should be slightly lower
    
    current_simulated_price = current_price * 0.90 # Start 30 days ago at -10%
    
    for i in range(30, -1, -1):
        target_date = end_date - timedelta(days=i)
        
        # Add a random daily fluctuation (-2% to +2.5% trending up)
        fluctuation = current_simulated_price * random.uniform(-0.02, 0.025)
        
        # Ensure the last day matches the current database price exactly
        if i == 0:
            close_price = current_price
            open_price = round(close_price * random.uniform(0.99, 1.01), 2)
            high_price = round(max(open_price, close_price) * random.uniform(1.0, 1.02), 2)
            low_price = round(min(open_price, close_price) * random.uniform(0.98, 1.0), 2)
        else:
            current_simulated_price = current_simulated_price + fluctuation
            close_price = round(current_simulated_price, 2)
            open_price = round(close_price * random.uniform(0.99, 1.01), 2)
            high_price = round(max(open_price, close_price) * random.uniform(1.0, 1.02), 2)
            low_price = round(min(open_price, close_price) * random.uniform(0.98, 1.0), 2)
            
        volume = random.randint(50000, 250000)
        
        records.append((
            target_date.strftime('%Y-%m-%d'),
            open_price,
            high_price,
            low_price,
            close_price,
            volume,
            stock_id
        ))

# Execute the inserts
cursor.executemany(insert_query, records)
db.commit()

print(f"Successfully inserted {cursor.rowcount} price history records.")
cursor.close()
db.close()
