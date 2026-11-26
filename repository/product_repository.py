# ==========================================
# Repository  ->  database work only (queries)
# ==========================================
from sqlalchemy.orm import Session
from model.product import Products


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_product(self):
        return self.db.query(Products).all()

    def get_product_by_sku(self, sku: str):
        return self.db.query(Products).filter(Products.sku == sku).first()

    def create_product(self, product: Products):
        self.db.add(product)

    def delete_product(self, product: Products):
        self.db.delete(product)
