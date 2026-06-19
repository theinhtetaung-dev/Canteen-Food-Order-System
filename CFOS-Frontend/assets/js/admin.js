document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');
    
    if (!token || role !== 'ADMIN') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('admin-name').textContent = `Welcome, ${localStorage.getItem('user_name')}`;
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Initialize Admin Data
    await loadCategories();
    await loadFoods();

    // Setup Add Food form
    const addFoodForm = document.getElementById('add-food-form');
    if (addFoodForm) {
        addFoodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const foodName = document.getElementById('foodName').value;
            const price = document.getElementById('foodPrice').value;
            const categoryId = document.getElementById('foodCategory').value;

            // Using FormData because endpoint expects @RequestPart
            const formData = new FormData();
            
            // The dto part
            const foodRequest = {
                foodName: foodName,
                price: parseFloat(price),
                categoryId: parseInt(categoryId),
                isAvailable: true,
                createdBy: 1, // Hack for demo, would normally extract from token ID or endpoint wouldn't need it
                description: 'Added from Admin panel'
            };

            // Convert DTO to JSON blob and append as 'data' part
            formData.append('data', new Blob([JSON.stringify(foodRequest)], {
                type: 'application/json'
            }));

            try {
                await api.postFormData('/foods', formData);
                showAlert('Food added successfully', 'success');
                addFoodForm.reset();
                await loadFoods();
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }
});

// Show alert message
function showAlert(message, type) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
}

// Tab Switching
window.showTab = function(tabName) {
    document.getElementById('food-section').style.display = tabName === 'food' ? 'block' : 'none';
    document.getElementById('orders-section').style.display = tabName === 'orders' ? 'block' : 'none';
    
    if (tabName === 'orders') {
        loadOrders();
    }
}

// Load Categories into Select
async function loadCategories() {
    try {
        const categories = await api.get('/food-categories');
        const select = document.getElementById('foodCategory');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.categoryId || cat.id; // adjust depending on your exact DTO field
            option.textContent = cat.categoryName;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories', error);
    }
}

// Load Foods List
async function loadFoods() {
    try {
        // Backend returns List<FoodResponse> based on the controller review
        const foods = await api.get('/foods');
        const container = document.getElementById('food-list');
        container.innerHTML = '';

        if (!foods || foods.length === 0) {
            container.innerHTML = '<p>No foods found.</p>';
            return;
        }

        foods.forEach(food => {
            container.innerHTML += `
                <div class="glass-panel food-card">
                    <div class="food-image-placeholder">
                        ${food.imageUrl ? `<img src="http://localhost:8080/food-images/${food.imageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : 'No Image'}
                    </div>
                    <div class="food-info">
                        <div class="food-title">${food.foodName}</div>
                        <div class="food-desc">${food.description || 'No description'}</div>
                        <div class="food-footer">
                            <span class="food-price">$${food.price.toFixed(2)}</span>
                            <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteFood(${food.foodId || food.id})">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        showAlert('Failed to load foods', 'danger');
    }
}

// Delete Food
window.deleteFood = async function(id) {
    if(!confirm('Are you sure you want to remove this food?')) return;
    try {
        await api.delete(`/foods/${id}`);
        showAlert('Food removed successfully', 'success');
        await loadFoods();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Load Orders
async function loadOrders() {
    try {
        const pageResponse = await api.get('/orders');
        // OrderController returns a Page<OrderResponseModel>, so data is in pageResponse.content
        const orders = pageResponse.content || [];
        const tbody = document.getElementById('orders-list');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const statusColor = order.orderStatus === 'PENDING' ? 'color: #fbbf24' : 
                              (order.orderStatus === 'COMPLETED' ? 'color: var(--success)' : 'color: var(--text-muted)');
            
            tbody.innerHTML += `
                <tr>
                    <td>#${order.orderId || order.id}</td>
                    <td>${order.userName}</td>
                    <td>$${order.totalAmount.toFixed(2)}</td>
                    <td style="font-weight: 600; ${statusColor}">${order.orderStatus}</td>
                    <td>
                        ${order.orderStatus === 'PENDING' ? 
                            `<button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="completeOrder(${order.orderId || order.id})">Mark Completed</button>` : 
                            '<span>-</span>'}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Failed to load orders', error);
        showAlert('Failed to load orders', 'danger');
    }
}

// Complete Order
window.completeOrder = async function(id) {
    try {
        await api.patch(`/orders/${id}/status`, 'COMPLETED');
        showAlert('Order status updated', 'success');
        await loadOrders();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}
