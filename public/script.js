document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("product-form");
    const productsList = document.getElementById("products");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const clearSearchButton = document.getElementById("clear-search");

    async function fetchProducts() {
        try {
            const response = await fetch("http://localhost:6969/api/products");
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function displayProducts(products) {
        productsList.innerHTML = "";
        products.forEach(product => {
            const li = document.createElement("li");
            li.classList.add("product-item");
            li.innerHTML = `
                ${product.name} - Count: ${product.count}, Price: $${product.price}
                <button class="increment-button" onclick="incrementCount('${product._id}')">+</button>
                <button class="decrement-button" onclick="decrementCount('${product._id}')">-</button>
                <button onclick="deleteProduct('${product._id}')">Delete</button>
            `;
            productsList.appendChild(li);
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const count = document.getElementById("count").value;
        const price = document.getElementById("price").value;

        try {
            const response = await fetch("http://localhost:6969/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, count, price })
            });

            if (response.ok) {
                form.reset();
                fetchProducts();
            } else {
                const error = await response.json();
                console.error("Error adding product:", error.message);
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    });

    window.deleteProduct = async function(id) {
        try {
            const response = await fetch(`http://localhost:6969/api/products/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                fetchProducts();
            } else {
                const error = await response.json();
                console.error("Error deleting product:", error.message);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    window.incrementCount = async function(id) {
        await updateProductCount(id, 1);
    };

    window.decrementCount = async function(id) {
        await updateProductCount(id, -1);
    };

    async function updateProductCount(id, delta) {
        try {
            const response = await fetch(`http://localhost:6969/api/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ delta })
            });

            if (response.ok) {
                fetchProducts();
            } else {
                const error = await response.json();
                console.error("Error updating product count:", error.message);
            }
        } catch (error) {
            console.error("Error updating product count:", error);
        }
    }

    searchButton.addEventListener("click", async () => {
        const name = searchInput.value;
        if (!name) return fetchProducts();

        try {
            const response = await fetch(`http://localhost:6969/api/products/search?name=${encodeURIComponent(name)}`);
            if (response.ok) {
                const product = await response.json();
                displayProducts([product]);
            } else {
                productsList.innerHTML = `<li>No products found with the name "${name}"</li>`;
            }
        } catch (error) {
            console.error("Error searching product:", error);
        }
    });

    clearSearchButton.addEventListener("click", () => {
        searchInput.value = "";
        fetchProducts();
    });

    fetchProducts();
});
