// ==========================================
// script.js  ->  Calls the backend API from the frontend
// ==========================================

// Address of the backend
const API_URL = "http://127.0.0.1:8000/products";

// Remembers which sku is being edited (null means adding a new product)
let editingSku = null;


// Makes text safe to put inside HTML (so a name like <b> can't break the page)
function esc(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// ---------- 1. Load all products and show them in the table (GET) ----------
async function loadProducts() {
    const response = await fetch(API_URL);
    const products = await response.json();

    const table = document.getElementById("product-table");
    table.innerHTML = "";   // clear the old rows

    // Show the total number of products
    document.getElementById("total").innerText = products.length + " products";

    // No products yet
    if (products.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    No products yet. Add one using the form above.
                </td>
            </tr>
        `;
        return;
    }

    for (const p of products) {
        table.innerHTML += `
            <tr>
                <td>${esc(p.sku)}</td>
                <td>${esc(p.name)}</td>
                <td>${esc(p.category)}</td>
                <td>${esc(p.brand)}</td>
                <td>${esc(p.supplier_email)}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td>${p.reorder_level}</td>
                <td><strong>${p.stock_value.toFixed(2)}</strong></td>
                <td><span class="badge ${getBadgeColor(p.status)}">${esc(p.status)}</span></td>
                <td class="text-nowrap">
                    <button class="btn btn-warning btn-sm" data-sku="${esc(p.sku)}" onclick="editProduct(this.dataset.sku)">Edit</button>
                    <button class="btn btn-danger btn-sm" data-sku="${esc(p.sku)}" onclick="deleteProduct(this.dataset.sku)">Delete</button>
                </td>
            </tr>
        `;
    }
}


// ---------- 2. Form submit -> Add (POST) or Update (PATCH) ----------
document.getElementById("product-form").addEventListener("submit", async function (event) {
    event.preventDefault();   // stop the page from reloading

    // Build an object from the form data
    const data = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        brand: document.getElementById("brand").value,
        supplier_email: document.getElementById("email").value,
        sku: document.getElementById("sku").value.trim(),
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        reorder_level: Number(document.getElementById("reorder").value),
    };

    let response;
    if (editingSku === null) {
        // New product
        response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    } else {
        // Update existing product
        response = await fetch(`${API_URL}/${encodeURIComponent(editingSku)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    }

    if (response.ok) {
        showMessage(editingSku === null ? "Product added!" : "Product updated!", "success");
        resetForm();
        loadProducts();
    } else {
        const error = await response.json();
        showMessage("Error: " + getErrorText(error), "danger");
    }
});


// ---------- 3. Edit button -> fill the form with the product's data ----------
async function editProduct(sku) {
    const response = await fetch(`${API_URL}/${encodeURIComponent(sku)}`);
    const p = await response.json();

    document.getElementById("name").value = p.name;
    document.getElementById("category").value = p.category;
    document.getElementById("brand").value = p.brand;
    document.getElementById("email").value = p.supplier_email;
    document.getElementById("sku").value = p.sku;
    document.getElementById("price").value = p.price;
    document.getElementById("quantity").value = p.quantity;
    document.getElementById("reorder").value = p.reorder_level;

    // The SKU can't be updated (the API changes everything except the SKU)
    document.getElementById("sku").disabled = true;

    editingSku = sku;
    document.getElementById("form-title").innerText = "Edit Product (SKU " + sku + ")";
    document.getElementById("submit-btn").innerText = "Update Product";
    document.getElementById("submit-btn").className = "btn btn-success";
    document.getElementById("cancel-btn").classList.remove("d-none");

    window.scrollTo({ top: 0, behavior: "smooth" });   // scroll up to the form
}


// ---------- 4. Delete (DELETE) ----------
async function deleteProduct(sku) {
    if (!confirm("Delete product with SKU " + sku + "?")) return;

    const response = await fetch(`${API_URL}/${encodeURIComponent(sku)}`, { method: "DELETE" });

    if (response.ok) {
        showMessage("Product deleted!", "success");
        loadProducts();
    } else {
        const error = await response.json();
        showMessage("Error: " + getErrorText(error), "danger");
    }
}


// ---------- Small helper functions ----------

// Clear the form and go back to "Add" mode
function resetForm() {
    document.getElementById("product-form").reset();
    document.getElementById("sku").disabled = false;
    editingSku = null;
    document.getElementById("form-title").innerText = "Add New Product";
    document.getElementById("submit-btn").innerText = "Add Product";
    document.getElementById("submit-btn").className = "btn btn-primary";
    document.getElementById("cancel-btn").classList.add("d-none");
}

// Show a Bootstrap alert at the top. type = "success" (green) or "danger" (red)
function showMessage(text, type) {
    const message = document.getElementById("message");
    message.innerText = text;
    message.className = "alert alert-" + type;

    // Hide the message after 3 seconds
    setTimeout(() => message.classList.add("d-none"), 3000);
}

// Pick a badge color for each stock status
function getBadgeColor(status) {
    if (status === "Well Stocked") return "bg-success";
    if (status === "In Stock") return "bg-primary";
    if (status === "Low Stock") return "bg-warning text-dark";
    return "bg-danger";   // Out of Stock
}

// Turn a FastAPI error into simple text
function getErrorText(error) {
    if (typeof error.detail === "string") return error.detail;
    // For validation errors (e.g. price = -5)
    return error.detail.map(e => e.loc[e.loc.length - 1] + ": " + e.msg).join(", ");
}


// Load the product list as soon as the page opens
loadProducts();
