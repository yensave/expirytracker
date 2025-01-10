document.addEventListener('DOMContentLoaded', function() {
    const addFoodBtn = document.querySelector('.add-food-btn');
    const addFoodLink = document.getElementById('addFoodLink');
    const modal = document.getElementById('addFoodModal');
    const closeBtn = document.querySelector('.close');
    const addFoodForm = document.getElementById('addFoodForm');
    const foodGrid = document.querySelector('.food-grid');

    const subcategories = {
        food: ["Bakery", "Dairy", "Fruits", "Vegetables", "Meat", "Seafood"],
        cosmetics: ["Skincare", "Makeup", "Haircare", "Fragrances"],
        other: ["Cleaning Supplies", "Pet Food", "Medications"]
    };

    const expiringSoonLink = document.querySelector('[data-section="expiring-soon"]');
    const dashboardLink = document.querySelector('[data-section="dashboard"]');
    
    if (expiringSoonLink) {
        expiringSoonLink.addEventListener('click', function(e) {
            e.preventDefault();
            showExpiringSoonItems();
        });
    }

    if (dashboardLink) {
        dashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAllItems();
        });
    }

    function populateSubcategories() {
        const categorySelect = document.getElementById("category");
        const subcategorySelect = document.getElementById("subcategory");
        const selectedCategory = categorySelect.value;

        subcategorySelect.innerHTML = "<option value=''>Select Subcategory</option>";

        if (selectedCategory in subcategories) {
            subcategories[selectedCategory].forEach(subcat => {
                const option = document.createElement("option");
                option.value = subcat.toLowerCase().replace(" ", "_");
                option.textContent = subcat;
                subcategorySelect.appendChild(option);
            });
        }
    }

    document.getElementById("category").addEventListener("change", populateSubcategories);
    populateSubcategories();

    let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

    addFoodBtn.onclick = openModal;
    addFoodLink.onclick = openModal;

    function openModal() {
        modal.style.display = "block";
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expiryDate').min = today;
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
        addFoodForm.reset();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            addFoodForm.reset();
        }
    }

    function showExpiringSoonItems() {
        const expiringSoonItems = foodItems.filter(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            return daysUntilExpiry <= 15; // Only show items expiring within 15 days
        });
        
        renderFilteredItems(expiringSoonItems, 'Expiring Soon Items');
    }

    function showAllItems() {
        document.querySelector('h1').textContent = 'Food Tracker Dashboard';
        renderFoodItems();
    }

    function renderFilteredItems(items, title) {
        document.querySelector('h1').textContent = title;
        foodGrid.innerHTML = '';
        
        if (items.length === 0) {
            foodGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-box-open"></i>
                    <p>No items are expiring soon!</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            const card = document.createElement('div');
            card.className = `food-card ${item.status}`;
            card.innerHTML = `
                <div class="food-status ${item.status}"></div>
                <h3>${item.name}</h3>
                <p><i class="far fa-calendar"></i> Expires in: ${daysUntilExpiry} days</p>
                <p><i class="fas fa-tag"></i> ${capitalizeFirstLetter(item.category)}</p>
                <div class="card-actions">
                    <button class="delete-btn" onclick="deleteFood(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            foodGrid.appendChild(card);
        });
    }

    addFoodForm.onsubmit = function(e) {
        e.preventDefault();
        
        const newFood = {
            id: Date.now(),
            name: document.getElementById('foodName').value,
            category: document.getElementById('category').value,
            expiryDate: document.getElementById('expiryDate').value,
            status: calculateStatus(document.getElementById('expiryDate').value)
        };

        foodItems.push(newFood);
        localStorage.setItem('foodItems', JSON.stringify(foodItems));
        renderFoodItems();
        updateStats();
        modal.style.display = "none";
        addFoodForm.reset();
        showNotification('Food item added successfully!');
    }

    function calculateStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 3) return 'expiring soon';
        if (daysUntilExpiry <= 7) return 'expiring in a week';
        return 'good';
    }

    function renderFoodItems() {
        foodGrid.innerHTML = '';
        
        if (foodItems.length === 0) {
            foodGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-box-open"></i>
                    <p>No food items added yet. Click "Add New Food" to get started!</p>
                </div>
            `;
            return;
        }

        foodItems.forEach(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            const card = document.createElement('div');
            card.className = `food-card ${item.status}`;
            card.innerHTML = `
                <div class="food-status ${item.status}"></div>
                <h3>${item.name}</h3>
                <p><i class="far fa-calendar"></i> Expires in: ${daysUntilExpiry} days</p>
                <p><i class="fas fa-tag"></i> ${capitalizeFirstLetter(item.category)}</p>
                <div class="card-actions">
                    <button class="delete-btn" onclick="deleteFood(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            foodGrid.appendChild(card);
        });
    }

    function calculateDaysUntilExpiry(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    }

    function updateStats() {
        const stats = {
            expiringSoon: foodItems.filter(item => 
                item.status === 'expiring soon' || 
                item.status === 'expiring in a week'
            ).length,
            total: foodItems.length,
            expired: foodItems.filter(item => item.status === 'expired').length
        };

        document.querySelector('.stat-card:nth-child(1) .stat-info p').textContent = `${stats.expiringSoon} items`;
        document.querySelector('.stat-card:nth-child(2) .stat-info p').textContent = `${stats.total} items`;
        document.querySelector('.stat-card:nth-child(3) .stat-info p').textContent = `${stats.expired} items`;
    }

    window.deleteFood = function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            foodItems = foodItems.filter(item => item.id !== id);
            localStorage.setItem('foodItems', JSON.stringify(foodItems));
            renderFoodItems();
            updateStats();
            showNotification('Food item deleted successfully!');
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    renderFoodItems();
    updateStats();
});
