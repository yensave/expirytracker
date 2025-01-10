document.addEventListener('DOMContentLoaded', function() {
    const addFoodBtn = document.querySelector('.add-food-btn');
    const addFoodLink = document.getElementById('addFoodLink');
    const modal = document.getElementById('addFoodModal');
    const closeBtn = document.querySelector('.close');
    const addFoodForm = document.getElementById('addFoodForm');
    // Add active class handling to all navigation links
const navLinks = document.querySelectorAll('.nav-links li a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // Remove active class from all links
        navLinks.forEach(l => l.parentElement.classList.remove('active'));
        // Add active class to clicked link
        this.parentElement.classList.add('active');
    });
});

    const foodGrid = document.querySelector('.food-grid');
    const expiredLink = document.querySelector('[data-section="expired"]');
if (expiredLink) {
    expiredLink.addEventListener('click', function(e) {
        e.preventDefault();
        showExpiredItems();
    });
}


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

    const viewByTagsLink = document.querySelector('.view-by-tags');
if (viewByTagsLink) {
    viewByTagsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showItemsByTags();
    });
}

function showItemsByTags() {
    const uniqueCategories = [...new Set(foodItems.map(item => item.category))];
    const taggedItems = {};
    
    uniqueCategories.forEach(category => {
        taggedItems[category] = foodItems.filter(item => item.category === category);
    });
    
    renderTaggedItems(taggedItems);
}
// Add this function to get unique active categories
function getActiveCategories() {
    const activeCategories = [...new Set(foodItems.map(item => item.category))];
    return activeCategories;
}

// Add this function to render category links
function renderCategoryLinks() {
    const activeCategories = getActiveCategories();
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'category-links';
    
    // Add header for categories section
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'nav-section-header';
    categoryHeader.innerHTML = '<i class="fas fa-tags"></i> Categories';
    categoriesContainer.appendChild(categoryHeader);

    activeCategories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = '#';
        categoryLink.className = 'category-link';
        categoryLink.innerHTML = `<i class="fas fa-tag"></i> ${capitalizeFirstLetter(category)}`;
        categoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            showCategoryItems(category);
        });
        categoriesContainer.appendChild(categoryLink);
    });

    // Insert before logout
    const logoutLink = document.querySelector('.logout');
    logoutLink.parentNode.insertBefore(categoriesContainer, logoutLink);
}

// Add function to show items by category
function showCategoryItems(category) {
    const categoryItems = foodItems.filter(item => item.category === category);
    renderFilteredItems(categoryItems, `${capitalizeFirstLetter(category)} Items`);
}

function renderTaggedItems(taggedItems) {
    document.querySelector('h1').textContent = 'Items by Category';
    foodGrid.innerHTML = '';
    
    if (Object.keys(taggedItems).length === 0) {
        foodGrid.innerHTML = `
            <div class="no-items">
                <i class="fas fa-box-open"></i>
                <p>No items available</p>
            </div>
        `;
        return;
    }

    Object.entries(taggedItems).forEach(([category, items]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `<h2>${capitalizeFirstLetter(category)}</h2>`;
        
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'items-grid';
        
        items.forEach(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            const card = document.createElement('div');
            card.className = `food-card ${item.status}`;
            card.innerHTML = `
                <div class="food-status ${item.status}"></div>
                <h3>${item.name}</h3>
                <p><i class="far fa-calendar"></i> Expires in: ${daysUntilExpiry} days</p>
            `;
            itemsGrid.appendChild(card);
        });
        
        categorySection.appendChild(itemsGrid);
        foodGrid.appendChild(categorySection);
    });
}
    function openModal() {
        modal.style.display = "block";
        // Remove the min date restriction
        document.getElementById('expiryDate').removeAttribute('min');
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
    function showExpiredItems() {
        const expiredItems = foodItems.filter(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            return daysUntilExpiry <= 0;
        });
        
        renderFilteredItems(expiredItems, 'Expired Items');
    }

    function showExpiringSoonItems() {
        const expiringSoonItems = foodItems.filter(item => {
            const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
            // Only show items that are expiring soon but not expired
            return daysUntilExpiry > 0 && daysUntilExpiry <= 15;
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
    
        if (daysUntilExpiry <= 0) return 'expired';
        if (daysUntilExpiry <= 7) return 'expiring-soon';
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
            const expiryText = daysUntilExpiry <= 0 
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : `Expires in: ${daysUntilExpiry} days`;
            const card = document.createElement('div');
            card.className = `food-card ${item.status}`;
            
            card.innerHTML = `
                <div class="food-status ${item.status}"></div>
                <h3>${item.name}</h3>
                <p><i class="far fa-calendar"></i> ${expiryText}</p>
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
            expiringSoon: foodItems.filter(item => {
                const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
                return daysUntilExpiry > 0 && daysUntilExpiry <= 7;  // Include items expiring within 7 days
            }).length,
            total: foodItems.length,
            expired: foodItems.filter(item => {
                const daysUntilExpiry = calculateDaysUntilExpiry(item.expiryDate);
                return daysUntilExpiry <= 0;
            }).length
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
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    renderCategoryLinks();
    renderFoodItems();
    updateStats();
});
