document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addFoodBtn = document.querySelector('.add-food-btn');
    const addFoodLink = document.getElementById('addFoodLink');
    const modal = document.getElementById('addFoodModal');
    const closeBtn = document.querySelector('.close');
    const addFoodForm = document.getElementById('addFoodForm');
    const foodGrid = document.querySelector('.food-grid');

    // Initialize food items array from localStorage or empty array
    let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

    // Open modal when clicking either the button or sidebar link
    addFoodBtn.onclick = openModal;
    addFoodLink.onclick = openModal;

    function openModal() {
        modal.style.display = "block";
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expiryDate').min = today;
    }

    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
        addFoodForm.reset();
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            addFoodForm.reset();
        }
    }

    // Handle form submission
    addFoodForm.onsubmit = function(e) {
        e.preventDefault();
        
        const newFood = {
            id: Date.now(),
            name: document.getElementById('foodName').value,
            category: document.getElementById('category').value,
            expiryDate: document.getElementById('expiryDate').value,
            status: calculateStatus(document.getElementById('expiryDate').value)
        };

        // Add new food item
        foodItems.push(newFood);
        
        // Save to localStorage
        localStorage.setItem('foodItems', JSON.stringify(foodItems));
        
        // Update display
        renderFoodItems();
        updateStats();
        
        // Close modal and reset form
        modal.style.display = "none";
        addFoodForm.reset();

        // Show success message
        showNotification('Food item added successfully!');
    }

    // Calculate status based on expiry date
    function calculateStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 3) return 'expiring-soon';
        return 'good';
    }

    // Render food items
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

    // Calculate days until expiry
    function calculateDaysUntilExpiry(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    }

    // Update dashboard statistics
    function updateStats() {
        const stats = {
            expiringSoon: foodItems.filter(item => item.status === 'expiring-soon').length,
            total: foodItems.length,
            expired: foodItems.filter(item => item.status === 'expired').length
        };

        document.querySelector('.stat-card:nth-child(1) .stat-info p').textContent = `${stats.expiringSoon} items`;
        document.querySelector('.stat-card:nth-child(2) .stat-info p').textContent = `${stats.total} items`;
        document.querySelector('.stat-card:nth-child(3) .stat-info p').textContent = `${stats.expired} items`;
    }

    // Delete food item
    window.deleteFood = function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            foodItems = foodItems.filter(item => item.id !== id);
            localStorage.setItem('foodItems', JSON.stringify(foodItems));
            renderFoodItems();
            updateStats();
            showNotification('Food item deleted successfully!');
        }
    }

    // Show notification
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

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initial render
    renderFoodItems();
    updateStats();
}); 