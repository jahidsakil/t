# ==========================================
# Service  ->  Business logic (calculations, checks, rules)
# ==========================================
from fastapi import HTTPException
from sqlalchemy.orm import Session

from model.product import Products
from model.stock import Stock
from repository.product_repository import ProductRepository
from repository.stock_repository import StockRepository
from utils.schema import ProductCreate, ProductUpdate, ProductResponse


# Returns the stock status based on quantity and reorder level
def get_status(quantity: int, reorder_level: int) -> str:
    if quantity == 0:
        return "Out of Stock"
    elif quantity <= reorder_level:
        return "Low Stock"
    elif quantity <= reorder_level * 3:
        return "In Stock"
    else:
        return "Well Stocked"


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repository = ProductRepository(db)
        self.stock_repository = StockRepository(db)

    # Combines a product and its stock into one response
    def make_response(self, product: Products) -> ProductResponse:
        stock = self.stock_repository.get_stock_by_sku(product.sku)

        # If there is no stock row, use 0 (so nothing crashes)
        price = float(stock.price) if stock else 0.0
        quantity = stock.quantity if stock else 0
        reorder_level = stock.reorder_level if stock else 0

        stock_value = round(price * quantity, 2)

        return ProductResponse(
            id=product.id,
            name=product.name,
            category=product.category,
            brand=product.brand,
            supplier_email=product.supplier_email,
            sku=product.sku,
            price=price,
            quantity=quantity,
            reorder_level=reorder_level,
            stock_value=stock_value,
            status=get_status(quantity, reorder_level),
        )

    # Finds a product by sku, raises a 404 error if not found
    def find_product_or_404(self, sku: str) -> Products:
        product = self.product_repository.get_product_by_sku(sku)
        if product is None:
            raise HTTPException(status_code=404, detail=f"No product found with SKU {sku}")
        return product

    # ---------- READ ----------
    def get_products(self):
        products = self.product_repository.get_all_product()
        return [self.make_response(product) for product in products]

    def get_product(self, sku: str):
        product = self.find_product_or_404(sku)
        return self.make_response(product)

    # ---------- CREATE ----------
    def add_product(self, payload: ProductCreate):
        # Check whether this sku already exists
        if self.product_repository.get_product_by_sku(payload.sku):
            raise HTTPException(status_code=400, detail=f"SKU {payload.sku} already exists")

        product = Products(
            name=payload.name,
            category=payload.category,
            brand=payload.brand,
            supplier_email=payload.supplier_email,
            sku=payload.sku,
        )
        stock = Stock(
            product_sku=payload.sku,
            price=payload.price,
            quantity=payload.quantity,
            reorder_level=payload.reorder_level,
        )
        self.product_repository.create_product(product)
        self.stock_repository.add_stock(stock)
        self.db.commit()          # save both tables together
        self.db.refresh(product)  # to get the new id
        return self.make_response(product)

    # ---------- UPDATE ----------
    def update_product(self, sku: str, payload: ProductUpdate):
        product = self.find_product_or_404(sku)

        if payload.name is not None:
            product.name = payload.name
        if payload.category is not None:
            product.category = payload.category
        if payload.brand is not None:
            product.brand = payload.brand
        if payload.supplier_email is not None:
            product.supplier_email = payload.supplier_email

        stock = self.stock_repository.get_stock_by_sku(sku)
        if stock is None:  # create a stock row if none exists
            stock = Stock(product_sku=sku, price=0, quantity=0, reorder_level=10)
            self.stock_repository.add_stock(stock)

        if payload.price is not None:
            stock.price = payload.price
        if payload.quantity is not None:
            stock.quantity = payload.quantity
        if payload.reorder_level is not None:
            stock.reorder_level = payload.reorder_level

        self.db.commit()
        return self.make_response(product)

    # ---------- DELETE ----------
    def delete_product(self, sku: str):
        product = self.find_product_or_404(sku)
        stock = self.stock_repository.get_stock_by_sku(sku)
        if stock:
            self.stock_repository.delete_stock(stock)
        self.product_repository.delete_product(product)
        self.db.commit()
