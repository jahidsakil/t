# ==========================================
# schema.py  ->  Rules for the data coming in / going out of the API (Pydantic)
# ==========================================
from typing import Optional
from pydantic import BaseModel, Field


# Data needed to add a new product
class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=50)
    brand: str = Field(min_length=1, max_length=50)
    supplier_email: str = Field(max_length=100)
    sku: str = Field(min_length=1, max_length=30, pattern=r"^[A-Za-z0-9_-]+$")   # letters, digits, - and _ only
    price: float = Field(default=0, ge=0, le=1000000)       # price must be 0 or more
    quantity: int = Field(default=0, ge=0)                  # quantity can't be negative
    reorder_level: int = Field(default=10, ge=0)


# For update every field is optional -> only the fields you send are changed
# (sku can't be changed because it is the product's identity)
class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    brand: Optional[str] = Field(default=None, min_length=1, max_length=50)
    supplier_email: Optional[str] = Field(default=None, max_length=100)
    price: Optional[float] = Field(default=None, ge=0, le=1000000)
    quantity: Optional[int] = Field(default=None, ge=0)
    reorder_level: Optional[int] = Field(default=None, ge=0)


# Data sent from the API to the frontend
class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    brand: str
    supplier_email: str
    sku: str
    price: float
    quantity: int
    reorder_level: int
    stock_value: float      # price x quantity
    status: str             # Out of Stock / Low Stock / In Stock / Well Stocked
