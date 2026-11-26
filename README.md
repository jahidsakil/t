# 📦 Product Management Project (FastAPI + MySQL + HTML/JS)

একটা সহজ প্রজেক্ট, যেখানে **Frontend (HTML/CSS/JS) → Backend (FastAPI) → Database (MySQL)** একসাথে কাজ করে।
এখানে পণ্য (product) যোগ, দেখা, আপডেট ও ডিলিট করা যায় এবং প্রতিটি পণ্যের stock-এর হিসাব আর অবস্থা (status) দেখা যায়।

---

## 📁 ফোল্ডার গঠন

```
product_management/
├── main.py                  ← প্রজেক্ট এখান থেকে চালু হয়
├── db.py                    ← MySQL এর সাথে connection
├── requirements.txt         ← যে library গুলো লাগবে
├── run.bat                  ← double-click করে চালানোর ফাইল (Windows)
├── instruction.txt          ← হাতে চালানোর ছোট নির্দেশনা
├── model/                   ← Database এর table
│   ├── product.py           (products table - পণ্যের তথ্য)
│   └── stock.py             (stock table - দাম, পরিমাণ)
├── utils/schema.py          ← API তে কী data আসবে/যাবে (Pydantic)
├── repository/              ← শুধু database query
├── service/                 ← হিসাব আর নিয়ম (stock value, status, error)
├── routers/                 ← API এর URL গুলো
├── frontend/                ← সাধারণ ব্রাউজার পেজ (main.py এটাই দেখায়)
│   ├── index.html
│   └── script.js
└── frontend-bootstrap-advanced/   ← Bootstrap দিয়ে সুন্দর version
    ├── index.html
    ├── script.js
    └── style.css
```

### Data কীভাবে চলে?

```
Browser (script.js)
   │  fetch("/products")
   ▼
Router  (routers/product_controller.py)   → কোন URL এ request এলো
   ▼
Service (service/product_service.py)      → হিসাব, check, error
   ▼
Repository (repository/*.py)              → database query
   ▼
MySQL Database (products, stock table)
```

---

## ▶️ চালানোর ধাপ

### ১. XAMPP এ MySQL চালু করো
XAMPP Control Panel খুলে **MySQL** এর পাশে **Start** চাপো (Apache লাগবে না)।
> Database (`product_management`) আর table গুলো প্রজেক্ট চালু হলে নিজেই বানাবে।

### ২. (দরকার হলে) `db.py` তে username/password ঠিক করো
```python
SERVER_URL = "mysql+pymysql://root:@localhost:3306"   # XAMPP: password খালি
DB_NAME = "product_management"
```

### ৩. প্রজেক্ট চালাও
প্রজেক্ট ফোল্ডারে **`run.bat`** এ double-click করো। এটা নিজেই:
- কম্পিউটারের Python খুঁজে নেয়
- প্রথমবার `venv` ফোল্ডার বানায় আর library install করে (ইন্টারনেট লাগবে)
- server চালু করে

> কালো window বন্ধ করবে না, ওটাই server।

### ৪. ব্রাউজারে খোলো
| কী দেখবে | লিংক |
|---|---|
| 🖥️ Frontend (website) | http://127.0.0.1:8000 |
| 📘 API Docs (Swagger) | http://127.0.0.1:8000/docs |

> **Bootstrap version দেখতে:** `main.py` এর `FRONTEND_FOLDER` এ `"frontend"` এর জায়গায় `"frontend-bootstrap-advanced"` লেখো।

---

## 🔗 API গুলো

| কাজ | Method | URL |
|---|---|---|
| সব product দেখা | GET | `/products` |
| একটা product দেখা | GET | `/products/{sku}` |
| নতুন product যোগ | POST | `/products` |
| product update | PATCH | `/products/{sku}` |
| product delete | DELETE | `/products/{sku}` |

> **SKU** = প্রতিটি পণ্যের আলাদা কোড (যেমন `P-101`)। এটা student প্রজেক্টের `roll` এর মতো কাজ করে।

### POST এর জন্য JSON উদাহরণ
```json
{
  "name": "Wireless Mouse",
  "category": "Electronics",
  "brand": "Logitech",
  "supplier_email": "sales@supplier.com",
  "sku": "P-101",
  "price": 850,
  "quantity": 40,
  "reorder_level": 10
}
```

### নিয়ম
- দাম (price) ০ বা তার বেশি হতে হবে
- পরিমাণ (quantity) আর reorder level ঋণাত্মক হতে পারবে না
- একই SKU দুইবার দেওয়া যাবে না
- SKU তে শুধু ইংরেজি অক্ষর, সংখ্যা, `-` আর `_` চলবে (যেমন `P-101`), কারণ SKU URL এর অংশ
- SKU পরে বদলানো যাবে না (update এ শুধু বাকি তথ্য বদলায়)
- **Stock Value** = দাম × পরিমাণ
- **Status** (পরিমাণ আর reorder level দেখে):

| শর্ত | Status |
|---|---|
| পরিমাণ = ০ | Out of Stock |
| পরিমাণ ≤ reorder level | Low Stock |
| পরিমাণ ≤ reorder level × ৩ | In Stock |
| তার বেশি | Well Stocked |

---

## ❗ সাধারণ সমস্যা ও সমাধান

| Error | কারণ | সমাধান |
|---|---|---|
| `Can't connect to MySQL server` | MySQL চালু নেই | XAMPP / MySQL service চালু করো |
| `Access denied for user 'root'` | পাসওয়ার্ড ভুল | `db.py` তে ঠিক পাসওয়ার্ড দাও |
| `cryptography package is required` | library নেই | `pip install cryptography` |
| `No module named 'fastapi'` | install হয়নি | `pip install -r requirements.txt` |
| পেজ খোলে কিন্তু টেবিল খালি / error | server বন্ধ | terminal এ `uvicorn main:app --reload` চালু আছে কিনা দেখো |
| Save চাপলে পেজ reload হয়, URL এ `?` আসে, data যায় না | ব্রাউজার আগের প্রজেক্টের পুরোনো `script.js` cache থেকে দিচ্ছে | **Ctrl + Shift + R** চাপো (hard refresh)। F12 → Console এ লাল error দেখো |

---

## 🧑‍🏫 ক্লাসে পড়ানোর ক্রম (পরামর্শ)

1. **db.py** — database connection আর `get_db()` কী করে
2. **model/** — Python class কীভাবে MySQL table হয়
3. **utils/schema.py** — Pydantic দিয়ে input check (price -5 দিয়ে error দেখাও)
4. **repository → service → router** — একটা request কীভাবে ভেতরে যায়
5. **/docs** এ গিয়ে API test করো
6. **frontend/script.js** — `fetch()` দিয়ে কীভাবে API call হয়
7. ব্রাউজারে add/edit/delete করে MySQL table এ পরিবর্তন দেখাও

## 🏋️ ছাত্রদের জন্য অনুশীলন
- নতুন একটা field যোগ করো (যেমন `discount`)
- নাম দিয়ে search এর একটা API বানাও (`/products/search?name=...`)
- শুধু "Low Stock" পণ্যগুলো দেখানোর একটা API বানাও
- Frontend এ "Out of Stock" পণ্য লাল রঙে দেখাও
