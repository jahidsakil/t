# Products table
from sqlalchemy import Column, Integer, String
from db import base


class Products(base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(100))
    category = Column(String(50))
    brand = Column(String(50))
    supplier_email = Column(String(100))
    sku = Column(String(30), unique=True)   # SKU = unique product code, e.g. "P-101"
