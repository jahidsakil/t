# Stock table -> price and quantity of each product (by sku)
from sqlalchemy import Column, Integer, String, Numeric
from db import base


class Stock(base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_sku = Column(String(30), unique=True)
    price = Column(Numeric(10, 2))        # price of one unit
    quantity = Column(Integer)            # how many units are in the store
    reorder_level = Column(Integer)       # when quantity falls to this, order more
