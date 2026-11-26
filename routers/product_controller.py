# ==========================================
# Router / Controller  ->  The API URLs
# ==========================================
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db import get_db
from service.product_service import ProductService
from utils.schema import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Product"])


# GET /products  ->  get all products
@router.get("", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    return ProductService(db).get_products()


# GET /products/P-101  ->  get the product with SKU P-101
@router.get("/{sku}", response_model=ProductResponse)
def get_one_product(sku: str, db: Session = Depends(get_db)):
    return ProductService(db).get_product(sku)


# POST /products  ->  add a new product
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def add_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ProductService(db).add_product(payload)


# PATCH /products/P-101  ->  update the product with SKU P-101
@router.patch("/{sku}", response_model=ProductResponse)
def update_product(sku: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    return ProductService(db).update_product(sku, payload)


# DELETE /products/P-101  ->  delete the product with SKU P-101
@router.delete("/{sku}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(sku: str, db: Session = Depends(get_db)):
    ProductService(db).delete_product(sku)
