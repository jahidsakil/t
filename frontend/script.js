// Backend API address
const API_URL = "http://127.0.0.1:8000/products";

// null = adding a new product, a text = editing that sku
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


// 1. Show all products in the table (GET)
async function loadProducts() {
    const response = await fetch(API_URL);
    const products = await response.json();

    let rows = "";
    for (const p of products) {
        rows += `
            <tr>
                <td>${esc(p.sku)}</td>
                <td>${esc(p.name)}</td>
                <td>${esc(p.category)}</td>
                <td>${esc(p.brand)}</td>
                <td>${esc(p.supplier_email)}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td>${p.reorder_level}</td>
                <td>${p.stock_value.toFixed(2)}</td>
                <td>${esc(p.status)}</td>
                <td>
                    <button class="btn btn-warning btn-sm" data-sku="${esc(p.sku)}" onclick="editProduct(this.dataset.sku)">Edit</button>
                    <button class="btn btn-danger btn-sm" data-sku="${esc(p.sku)}" onclick="deleteProduct(this.dataset.sku)">Delete</button>
                </td>
            </tr>
        `;
    }
    document.getElementById("product-table").innerHTML = rows;
}


// 2. Save button: add a new product (POST) or update one (PATCH)
document.getElementById("product-form").addEventListener("submit", async function (event) {
    event.preventDefault();   // stop the page from reloading

    const product = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        brand: document.getElementById("brand").value,
        supplier_email: document.getElementById("email").value,
        sku: document.getElementById("sku").value.trim(),
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        reorder_level: Number(document.getElementById("reorder").value),
    };

    let url = API_URL;
    let method = "POST";

    if (editingSku !== null) {
        url = API_URL + "/" + encodeURIComponent(editingSku);
        method = "PATCH";
    }

    const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
    });

    if (response.ok) {
        alert("Saved!");
        resetForm();
        loadProducts();
    } else {
        const error = await response.json();
        alert("Error: " + JSON.stringify(error.detail));
    }
});


// 3. Edit button: put the product's data into the form
async function editProduct(sku) {
    const response = await fetch(API_URL + "/" + encodeURIComponent(sku));
    const p = await response.json();

    document.getElementById("name").value = p.name;
    document.getElementById("category").value = p.category;
    document.getElementById("brand").value = p.brand;
    document.getElementById("email").value = p.supplier_email;
    document.getElementById("sku").value = p.sku;
    document.getElementById("price").value = p.price;
    document.getElementById("quantity").value = p.quantity;
    document.getElementById("reorder").value = p.reorder_level;

    // The SKU can't be changed (the API only changes the other fields)
    document.getElementById("sku").disabled = true;

    editingSku = sku;
    document.getElementById("form-title").innerText = "Edit Product (SKU " + sku + ")";
}


// 4. Delete button (DELETE)
async function deleteProduct(sku) {
    if (!confirm("Delete this product?")) return;

    await fetch(API_URL + "/" + encodeURIComponent(sku), { method: "DELETE" });
    loadProducts();
}


// Clear the form and go back to "Add" mode
function resetForm() {
    document.getElementById("product-form").reset();
    document.getElementById("sku").disabled = false;
    editingSku = null;
    document.getElementById("form-title").innerText = "Add Product";
}


// Show the products when the page opens
loadProducts();
