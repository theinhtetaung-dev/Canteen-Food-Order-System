let cart = [];
let foodsData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');
    
    if (!token || role !== 'USER') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${localStorage.getItem('user_name')}`;
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    document.getElementById('cart-btn').addEventListener('click', toggleCart);
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);

    // Search functionality
    document.getElementById('search-input').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword) {
            renderFoods(foodsData.filter(f => f.foodName.toLowerCase().includes(keyword)));
        } else {
            renderFoods(foodsData);
        }
    });

    await loadCategories();
    await loadFoods();
});

function showAlert(message, type) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
}

window.toggleCart = function() {
    const menuSection = document.getElementById('menu-section');
    const cartSection = document.getElementById('cart-section');
    
    if (menuSection.style.display !== 'none') {
        menuSection.style.display = 'none';
        cartSection.style.display = 'block';
        renderCart();
    } else {
        menuSection.style.display = 'block';
        cartSection.style.display = 'none';
    }
}

async function loadCategories() {
    try {
        const categories = await api.get('/food-categories');
        const container = document.getElementById('categories-filter');
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn cat-btn';
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'white';
            btn.textContent = cat.categoryName;
            btn.onclick = async () => {
                // UI active state
                document.querySelectorAll('.cat-btn').forEach(b => {
                    b.className = 'btn cat-btn';
                    b.style.background = 'rgba(255,255,255,0.1)';
                });
                btn.className = 'btn btn-primary cat-btn';
                btn.style.background = ''; // Use CSS default for primary
                
                // Fetch filtered foods
                try {
                    const filtered = await api.get(`/foods/category/${cat.categoryId || cat.id}`);
                    renderFoods(filtered);
                } catch(e) {
                    showAlert('Error filtering foods', 'danger');
                }
            };
            container.appendChild(btn);
        });

        // "All Foods" button logic
        const allBtn = container.querySelector('[data-id="all"]');
        allBtn.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(b => {
                b.className = 'btn cat-btn';
                b.style.background = 'rgba(255,255,255,0.1)';
            });
            allBtn.className = 'btn btn-primary cat-btn';
            allBtn.style.background = '';
            renderFoods(foodsData);
        };

    } catch (error) {
        console.error('Failed to load categories', error);
    }
}

async function loadFoods() {
    try {
        foodsData = await api.get('/foods');
        renderFoods(foodsData);
    } catch (error) {
        showAlert('Failed to load menu', 'danger');
    }
}

function renderFoods(foodsToRender) {
    const container = document.getElementById('food-list');
    container.innerHTML = '';

    if (!foodsToRender || foodsToRender.length === 0) {
        container.innerHTML = '<p>No foods available.</p>';
        return;
    }

    foodsToRender.forEach(food => {
        container.innerHTML += `
            <div class="glass-panel food-card">
                <div class="food-image-placeholder">
                    ${food.imageUrl ? `<img src="http://localhost:8080/food-images/${food.imageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : 'Delicious Food'}
                </div>
                <div class="food-info">
                    <div class="food-title">${food.foodName}</div>
                    <div class="food-desc">${food.description || 'Tasty treat!'}</div>
                    <div class="food-footer">
                        <span class="food-price">$${food.price.toFixed(2)}</span>
                        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" onclick="addToCart(${food.foodId || food.id}, '${food.foodName.replace(/'/g, "\\'")}', ${food.price})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    });
}

window.addToCart = function(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartCounter();
    showAlert(`${name} added to cart!`, 'success');
}

function updateCartCounter() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function renderCart() {
    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = '';
    
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Your cart is empty.</td></tr>';
        document.getElementById('cart-total').textContent = '0.00';
        document.getElementById('place-order-btn').disabled = true;
        return;
    }

    document.getElementById('place-order-btn').disabled = false;
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="d-flex align-center" style="gap: 0.5rem;">
                        <button class="btn" style="background: rgba(255,255,255,0.1); color: white; padding: 0.2rem 0.5rem;" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn" style="background: rgba(255,255,255,0.1); color: white; padding: 0.2rem 0.5rem;" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="removeFromCart(${index})">Remove</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
}

window.updateQuantity = function(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartCounter();
    renderCart();
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartCounter();
    renderCart();
}

async function placeOrder() {
    if (cart.length === 0) return;

    const orderItems = cart.map(item => ({
        foodId: item.id,
        quantity: item.quantity
    }));

    const orderRequest = {
        userName: localStorage.getItem('user_name'),
        orderItems: orderItems
    };

    const btn = document.getElementById('place-order-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
        await api.post('/orders', orderRequest);
        showAlert('Order placed successfully!', 'success');
        cart = [];
        updateCartCounter();
        toggleCart(); // go back to menu
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        btn.textContent = 'Place Order';
        btn.disabled = false;
    }
}
