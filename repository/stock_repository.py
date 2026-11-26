# ==========================================
# Repository  ->  queries for the stock table
# ==========================================
from sqlalchemy.orm import Session
from model.stock import Stock


class StockRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_stock_by_sku(self, sku: str):
        return self.db.query(Stock).filter(Stock.product_sku == sku).first()

    def add_stock(self, stock: Stock):
        self.db.add(stock)

    def delete_stock(self, stock: Stock):
        self.db.delete(stock)
