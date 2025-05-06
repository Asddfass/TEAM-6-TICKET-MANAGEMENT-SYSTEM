document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    setActiveLink('dashboard'); // Highlight dashboard link
    showSection('dashboard');   // Show dashboard section
    initializeAllCharts();      // Initialize all charts
    initializeEventListeners(); // Setup search, filters, etc.

    // Initialize all modals for closing (can be done once)
    document.querySelectorAll('.modal').forEach(modal => initializeModalClose(modal));
});

// --- Core UI Functions ---

function showSection(sectionId) {
    // Hide all sections first
    document.querySelectorAll('.main-content > .section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the target section
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
        setActiveLink(sectionId); // Update active sidebar link
        // Initialize section-specific things if needed when shown
        if (sectionId === 'reports') {
            initializeReportsPage(); // Re-initialize reports if necessary
        }
        // Reset scroll position when changing sections
        document.querySelector('.main-content').scrollTop = 0;
    } else {
        console.warn(`Section with ID "${sectionId}" not found.`);
        // Fallback to dashboard if section not found
        const dashboard = document.getElementById('dashboard');
        if (dashboard) dashboard.style.display = 'block';
        setActiveLink('dashboard');
    }
}

function setActiveLink(sectionId) {
    // Remove active class from all links
    document.querySelectorAll('.sidebar .nav-links li').forEach(li => {
        li.classList.remove('active');
    });

    // Add active class to the clicked link
    const activeLink = Array.from(document.querySelectorAll('.sidebar .nav-links li'))
                           .find(li => li.getAttribute('onclick') === `showSection('${sectionId}')`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else if (sectionId === 'dashboard') { // Ensure dashboard is highlighted if fallback
         const dashboardLink = Array.from(document.querySelectorAll('.sidebar .nav-links li'))
                               .find(li => li.getAttribute('onclick') === `showSection('dashboard')`);
        if(dashboardLink) dashboardLink.classList.add('active');
    }
}

function closeModal(element) {
    // Find the closest parent modal and hide it
    const modal = element.closest('.modal');
    if (modal) {
        modal.style.display = 'none';
        // Clear dynamic content or reset forms if needed (optional)
        // Example: Reset delete confirmation details
        const detailsContainer = modal.querySelector('#deleteDetailsContainer');
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
            detailsContainer.style.display = 'none';
        }
        const confirmBtn = modal.querySelector('#confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.onclick = null; // Remove specific delete action
        }

    } else {
        console.error("Could not find modal to close from element:", element);
    }
}

// Function to initialize closing modals via overlay click or close button
function initializeModalClose(modal) {
    if (!modal) return;
    const closeBtn = modal.querySelector('.close');

    // Close button click
    if (closeBtn) {
        // Use event listener for better management
        closeBtn.removeEventListener('click', () => closeModal(closeBtn)); // Remove existing listener
        closeBtn.addEventListener('click', () => closeModal(closeBtn)); // Add listener
    }

    // Overlay click - use a named function for removal if needed, simple approach:
     modal.addEventListener('click', (event) => {
         if (event.target === modal) { // Check if click is directly on the modal background
             closeModal(modal);
         }
     });

    // Prevent clicks inside modal content from closing the modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        // Remove previous listener if needed, or use stopPropagation
         modalContent.addEventListener('click', (event) => {
             event.stopPropagation(); // Stop click from bubbling up to the modal overlay
         });
    }
}


// --- Chart Initialization ---
let dashboardTicketChart = null;
let reportCollegeChart = null;
let reportResolutionChart = null;

function initializeAllCharts() {
    initializeDashboardChart();
    initializeReportsCharts(); // Assumes reports charts exist on load
}

function initializeDashboardChart() {
    const ctx = document.getElementById('ticketChart');
    if (ctx) {
        if (dashboardTicketChart) dashboardTicketChart.destroy(); // Destroy existing chart
        dashboardTicketChart = new Chart(ctx, {
            type: 'doughnut', // Example type
            data: {
                labels: ['Open', 'Pending', 'Closed'],
                datasets: [{
                    label: 'Ticket Status',
                    // Use actual data from dashboard stats for consistency?
                    data: [
                        parseInt(document.querySelector('#dashboard .stats .card:nth-child(2) h2')?.textContent || 0), // Pending
                        parseInt(document.querySelector('#dashboard .stats .card:nth-child(1) h2')?.textContent || 0), // Availed (assuming closed)
                        0 // Need an 'Open' stat card or separate data source
                     ],
                    backgroundColor: [
                        'rgb(255, 159, 64)', // Orange (Pending)
                        'rgb(75, 192, 192)', // Green (Closed/Availed)
                        'rgb(54, 162, 235)' // Blue (Open - needs data)

                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ticket Status Overview'
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    } else {
        console.warn("Dashboard chart canvas ('ticketChart') not found.");
    }
}


// --- Event Listeners Setup ---

function initializeEventListeners() {
    // Generic Table Search
    setupTableSearch('onlineUserSearch', '.online-users-table tbody');
    setupTableSearch('ticketSearch', '.tickets-table tbody');
    setupTableSearch('userSearch', '.users-table tbody');
    setupTableSearch('.reports-filters input[data-filter-type="search"]', '.reports-table tbody');

    // Generic Table Filters
    setupTableFilter('ticketStatusFilter', '.tickets-table tbody', 2); // Col index 2: Status
    setupTableFilter('ticketPriorityFilter', '.tickets-table tbody', 3); // Col index 3: Priority
    setupTableFilter('userRoleFilter', '.users-table tbody', 2); // Col index 2: Role
    setupTableFilter('userStatusFilter', '.users-table tbody', 3); // Col index 3: Status

    // Reports Specific Filters
    setupReportFilters();

    // Settings Form Submission
     const settingsForm = document.getElementById('settingsForm');
     if (settingsForm) {
         settingsForm.addEventListener('submit', handleSettingsSave);
     }

     // Edit Form Submissions (attach here for modals that exist on load)
     const editTicketForm = document.getElementById('editTicketForm');
     if(editTicketForm) editTicketForm.addEventListener('submit', handleEditTicketSave);

     const editUserForm = document.getElementById('editUserForm');
     if(editUserForm) editUserForm.addEventListener('submit', handleEditUserSave);

}

function setupTableSearch(inputSelector, tableBodySelector) { // Changed inputId to selector
    const searchInput = document.querySelector(inputSelector); // Use querySelector
    const tableBody = document.querySelector(tableBodySelector);

    if (searchInput && tableBody) {
        searchInput.addEventListener('keyup', function() {
            const searchText = this.value.toLowerCase().trim();
            const rows = tableBody.getElementsByTagName('tr');
            let visibleCount = 0;
            Array.from(rows).forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const isVisible = rowText.includes(searchText);
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });
             // Update pagination after search
             updatePaginationForTable(tableBody.closest('table'), visibleCount);
        });
    } else {
         console.warn(`Search input ('${inputSelector}') or table body ('${tableBodySelector}') not found.`);
    }
}

function setupTableFilter(selectSelector, tableBodySelector, columnIndex) { // Changed selectId to selector
    const filterSelect = document.querySelector(selectSelector); // Use querySelector
    const tableBody = document.querySelector(tableBodySelector);

    if (filterSelect && tableBody) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase().trim();
            const rows = tableBody.getElementsByTagName('tr');
             let visibleCount = 0;
            Array.from(rows).forEach(row => {
                const cell = row.getElementsByTagName('td')[columnIndex];
                let isVisible = true; // Assume visible initially
                if (cell && filterValue) { // Only filter if a value is selected
                    const cellText = cell.textContent.toLowerCase().trim();
                    const badge = cell.querySelector('.status-badge, .priority-badge');
                    const valueToCompare = badge ? badge.textContent.toLowerCase().trim() : cellText;
                    isVisible = (valueToCompare === filterValue);
                }
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });
            // Update pagination after filter
            updatePaginationForTable(tableBody.closest('table'), visibleCount);
        });
    } else {
         console.warn(`Filter select ('${selectSelector}') or table body ('${tableBodySelector}') not found.`);
    }
}

// --- Logout ---

function showLogoutConfirmation() {
    const modal = document.getElementById('logoutConfirmModal');
    if (modal) {
        modal.style.display = 'flex'; // Use 'flex' for centering
        // initializeModalClose(modal); // Already initialized on load
    } else {
        console.error("Logout confirmation modal (#logoutConfirmModal) not found!");
    }
}

function confirmLogout() {
    const modal = document.getElementById('logoutConfirmModal');
    const logoutBtn = modal ? modal.querySelector('.logout-btn') : null;

    if (logoutBtn) {
        logoutBtn.innerHTML = '<span class="loading-spinner"></span>Logging out...';
        logoutBtn.disabled = true;
    }

    // Simulate logout action
    setTimeout(() => {
        console.log("Logging out and redirecting...");
        // Replace with your actual logout logic (e.g., clearing session, redirecting)
        window.location.href = '../LOGIN/'; // ADJUST PATH AS NEEDED
    }, 800);
}

// --- Ticket Management ---

function viewTicket(button) {
    const row = button.closest('tr');
    if (!row) return;
    const ticketId = row.dataset.ticketId || row.cells[0]?.textContent || 'N/A'; // Prefer data-id
    const ticketData = {
        id: ticketId,
        subject: row.cells[1]?.textContent || 'N/A',
        status: row.cells[2]?.querySelector('.status-badge')?.textContent || 'N/A',
        priority: row.cells[3]?.querySelector('.priority-badge')?.textContent || 'N/A',
        assigned: row.cells[4]?.textContent || 'N/A',
        description: "This is a sample description. Fetch real data if available." // Placeholder
    };

    const modal = document.getElementById('viewTicketModal');
    if (!modal) return;

    const modalTitle = modal.querySelector('.modal-header h2');
    const modalBody = modal.querySelector('.modal-body');

    if (modalTitle) modalTitle.textContent = `Ticket Details ${ticketData.id}`;
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="ticket-meta">
                <div class="meta-item"><span class="meta-label">Status</span><span class="status-badge ${ticketData.status.toLowerCase()}">${ticketData.status}</span></div>
                <div class="meta-item"><span class="meta-label">Priority</span><span class="priority-badge ${ticketData.priority.toLowerCase()}">${ticketData.priority}</span></div>
                <div class="meta-item"><span class="meta-label">Assigned To</span><span class="assigned-user">${ticketData.assigned}</span></div>
                <div class="meta-item"><span class="meta-label">Ticket ID</span><span>${ticketData.id}</span></div>
            </div>
            <div class="ticket-content">
                <div class="ticket-subject"><h3>Subject</h3><p>${ticketData.subject}</p></div>
                <div class="ticket-description"><h3>Description</h3><p>${ticketData.description}</p></div>
            </div>
        `;
    }

    modal.style.display = 'flex'; // Show modal using flex
    // initializeModalClose(modal); // Already initialized
}

function editTicket(button) {
    const row = button.closest('tr');
    if (!row) return;
    const ticketId = row.dataset.ticketId || row.cells[0]?.textContent;
    const modal = document.getElementById('editTicketModal');
    if (!modal || !ticketId) return;

    // Store context on the modal itself (safer than relying on globals)
    modal.dataset.editingTicketId = ticketId;
    modal.dataset.editingRowIndex = row.rowIndex; // rowIndex is 1-based, includes thead

    // Populate form fields
    modal.querySelector('#editTicketId').value = ticketId;
    modal.querySelector('#editSubject').value = row.cells[1]?.textContent || '';
    modal.querySelector('#editStatus').value = row.cells[2]?.querySelector('.status-badge')?.textContent || '';
    modal.querySelector('#editPriority').value = row.cells[3]?.querySelector('.priority-badge')?.textContent || '';
    modal.querySelector('#editAssigned').value = row.cells[4]?.textContent || '';
    modal.querySelector('#editDescription').value = "Existing description placeholder..."; // Populate description

    // Ensure submit handler is attached (already done in initializeEventListeners)
    // const form = modal.querySelector('#editTicketForm');
    // form.onsubmit = handleEditTicketSave;

    modal.style.display = 'flex'; // Show modal
    // initializeModalClose(modal); // Already initialized
}

function handleEditTicketSave(event) {
    event.preventDefault(); // Prevent default form submission
    const form = event.target;
    const modal = form.closest('.modal');
    const saveBtn = modal.querySelector('.save-btn');
    const ticketId = modal.dataset.editingTicketId; // Get ID from modal dataset
    const rowIndex = parseInt(modal.dataset.editingRowIndex, 10); // Get row index

    if (!ticketId || isNaN(rowIndex)) {
         showNotification('Error', 'Could not find ticket information to save.', 'error');
         console.error("Missing ticketId or rowIndex in modal dataset");
         return;
    }

    saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
    saveBtn.disabled = true;

    // Get updated data from form
    const updatedData = {
        subject: form.querySelector('#editSubject').value,
        status: form.querySelector('#editStatus').value,
        priority: form.querySelector('#editPriority').value,
        assigned: form.querySelector('#editAssigned').value,
        description: form.querySelector('#editDescription').value
    };

    console.log("Saving Ticket:", ticketId, updatedData); // Log data

    // --- SIMULATE SAVING ---
    setTimeout(() => {
        // Find the correct table and row using the stored index
        const table = document.querySelector('.data-table.tickets-table');
        const row = table?.rows[rowIndex]; // Get row by 1-based index

        if (row && (row.dataset.ticketId === ticketId || row.cells[0]?.textContent === ticketId)) { // Verify ID
            // Update the row in the table
            row.cells[1].textContent = updatedData.subject;
            row.cells[2].innerHTML = `<span class="status-badge ${updatedData.status.toLowerCase()}">${updatedData.status}</span>`;
            row.cells[3].innerHTML = `<span class="priority-badge ${updatedData.priority.toLowerCase()}">${updatedData.priority}</span>`;
            row.cells[4].textContent = updatedData.assigned;
            // Update data attribute if it was used for ID
            if (!row.dataset.ticketId) row.dataset.ticketId = ticketId; // Add if missing
        } else {
            console.error("Could not find or verify table row for ticket:", ticketId, "at index:", rowIndex);
            showNotification('Error', 'Failed to update table display.', 'error');
        }

        // Reset button and close modal
        saveBtn.innerHTML = 'Save Changes';
        saveBtn.disabled = false;
        closeModal(modal);
        showNotification('Success', `Ticket ${ticketId} updated successfully!`, 'success');

    }, 1000); // Simulate network delay
}


// --- User Management ---

function approveUser(button) {
    const row = button.closest('tr');
    if (!row) return;
    const userName = row.cells[0]?.textContent || 'User';
    const userId = row.dataset.userId; // Get user ID from data attribute

     if (!userId) {
         showNotification('Error', 'Cannot approve user: Missing user ID reference.', 'error');
         console.error("Missing data-user-id on table row:", row);
         return;
     }

    button.innerHTML = '<span class="loading-spinner"></span>Approving...';
    button.disabled = true;
    button.closest('.action-buttons').querySelector('.reject-btn')?.setAttribute('disabled', 'true');
    button.closest('.action-buttons').querySelector('.deleteBtn')?.setAttribute('disabled', 'true');


    console.log(`Approving user: ${userName} (ID: ${userId})`); // Placeholder for API call

    setTimeout(() => {
        // Update Status Badge
        const statusCell = row.cells[3];
        if (statusCell) statusCell.innerHTML = '<span class="status-badge active">Active</span>';

        // Update Action Buttons to View/Edit/Delete
        const actionCell = row.cells[4];
        if (actionCell) {
            actionCell.innerHTML = `
                <button class="viewBtn" onclick="viewUser(this)">View</button>
                <button class="editBtn" onclick="editUser(this)">Edit</button>
                <button class="deleteBtn" onclick="deleteUser(this)">Delete</button>
            `;
        }
        showNotification('Success', `User ${userName} has been approved.`, 'success');
    }, 800);
}

function rejectUser(button) {
    const row = button.closest('tr');
     if (!row) return;
    const userName = row.cells[0]?.textContent || 'User';
    const userId = row.dataset.userId;

     if (!userId) {
         showNotification('Error', 'Cannot reject user: Missing user ID reference.', 'error');
         console.error("Missing data-user-id on table row:", row);
         return;
     }

    button.innerHTML = '<span class="loading-spinner"></span>Rejecting...';
    button.disabled = true;
    button.closest('.action-buttons').querySelector('.approve-btn')?.setAttribute('disabled', 'true');
    button.closest('.action-buttons').querySelector('.deleteBtn')?.setAttribute('disabled', 'true');

    console.log(`Rejecting user: ${userName} (ID: ${userId})`); // Placeholder for API call

    setTimeout(() => {
        // Update Status Badge
        const statusCell = row.cells[3];
        if (statusCell) statusCell.innerHTML = '<span class="status-badge rejected">Rejected</span>';

        // Update Action Buttons (Approve/Delete)
        const actionCell = row.cells[4];
        if (actionCell) {
             actionCell.innerHTML = `
                <button class="approve-btn" onclick="approveUser(this)">Approve</button>
                <button class="deleteBtn" onclick="deleteUser(this)">Delete</button>
            `;
        }
        showNotification('Warning', `User ${userName} has been rejected.`, 'error');
    }, 800);
}

function viewUser(button) {
     const row = button.closest('tr');
     if (!row) return;
     const userId = row.dataset.userId;
      if (!userId) {
         showNotification('Error', 'Cannot view user: Missing user ID reference.', 'error');
         console.error("Missing data-user-id on table row:", row);
         return;
     }
     const userData = {
        id: userId,
        name: row.cells[0]?.textContent || 'N/A',
        email: row.cells[1]?.textContent || 'N/A',
        role: row.cells[2]?.textContent || 'N/A',
        status: row.cells[3]?.querySelector('.status-badge')?.textContent || 'N/A'
    };

    const modal = document.getElementById('viewUserModal');
     if (!modal) return;

     const modalTitle = modal.querySelector('.modal-header h2');
     const modalBody = modal.querySelector('.modal-body');

     if (modalTitle) modalTitle.textContent = `User Details: ${userData.name}`;
     if (modalBody) {
        modalBody.innerHTML = `
            <div class="user-info">
                <p><strong>User ID:</strong> ${userData.id}</p>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Role:</strong> ${userData.role}</p>
                <p><strong>Status:</strong> <span class="status-badge ${userData.status.toLowerCase()}">${userData.status}</span></p>
                <!-- Add more user details if available -->
            </div>
        `;
     }

     modal.style.display = 'flex';
     // initializeModalClose(modal); // Already initialized
}

function editUser(button) {
     const row = button.closest('tr');
     if (!row) return;
     const userId = row.dataset.userId;
     const modal = document.getElementById('editUserModal');
     if (!modal || !userId) {
         showNotification('Error', 'Cannot edit user: Missing user ID or modal.', 'error');
         console.error("Missing data-user-id or modal for edit:", row);
         return;
     }


     modal.dataset.editingUserId = userId;
     modal.dataset.editingRowIndex = row.rowIndex;

     // Populate form
     modal.querySelector('#editUserId').value = userId;
     modal.querySelector('#editUserName').value = row.cells[0]?.textContent || '';
     modal.querySelector('#editUserEmail').value = row.cells[1]?.textContent || '';
     modal.querySelector('#editUserRole').value = row.cells[2]?.textContent || '';
     modal.querySelector('#editUserStatus').value = row.cells[3]?.querySelector('.status-badge')?.textContent || '';


     // Ensure submit handler is attached (already done in initializeEventListeners)
     // const form = modal.querySelector('#editUserForm');
     // form.onsubmit = handleEditUserSave;

     modal.style.display = 'flex';
     // initializeModalClose(modal); // Already initialized
}

function handleEditUserSave(event) {
     event.preventDefault();
     const form = event.target;
     const modal = form.closest('.modal');
     const saveBtn = modal.querySelector('.save-btn');
     const userId = modal.dataset.editingUserId;
     const rowIndex = parseInt(modal.dataset.editingRowIndex, 10);

     if (!userId || isNaN(rowIndex)) {
          showNotification('Error', 'Could not find user information to save.', 'error');
          console.error("Missing userId or rowIndex in modal dataset for user edit");
          return;
     }

     saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
     saveBtn.disabled = true;

     const updatedData = {
        name: form.querySelector('#editUserName').value,
        email: form.querySelector('#editUserEmail').value,
        role: form.querySelector('#editUserRole').value,
        status: form.querySelector('#editUserStatus').value,
     };

     console.log("Saving User:", userId, updatedData); // Log data

     // --- SIMULATE SAVING ---
    setTimeout(() => {
        const table = document.querySelector('.data-table.users-table');
        const row = table?.rows[rowIndex]; // Get row by 1-based index

        if (row && row.dataset.userId === userId) { // Verify ID
             row.cells[0].textContent = updatedData.name;
             row.cells[1].textContent = updatedData.email;
             row.cells[2].textContent = updatedData.role;
             row.cells[3].innerHTML = `<span class="status-badge ${updatedData.status.toLowerCase()}">${updatedData.status}</span>`;
        } else {
            console.error("Could not find or verify table row for user:", userId, "at index:", rowIndex);
             showNotification('Error', 'Failed to update user in table display.', 'error');
        }

        saveBtn.innerHTML = 'Save Changes';
        saveBtn.disabled = false;
        closeModal(modal);
        showNotification('Success', `User ${updatedData.name} updated successfully!`, 'success');

    }, 1000);
}


// --- Reports Section ---

function initializeReportsPage() {
    // Filters are setup globally
    updateReportsStats(); // Initial stat calculation
    updateReportsPagination(); // Initial pagination setup
    // Charts are initialized globally
}

function setupReportFilters() {
    const filters = document.querySelectorAll('#reports .reports-filters .report-filter');
    filters.forEach(filter => {
        // Use 'input' for text/date for immediate feedback
        const eventType = (filter.type === 'text' || filter.type === 'date') ? 'input' : 'change';
        filter.addEventListener(eventType, applyReportFilters);
    });
}

function applyReportFilters() {
    const tableBody = document.querySelector('.reports-table tbody');
    if (!tableBody) return;

    const rows = Array.from(tableBody.getElementsByTagName('tr'));
    const filters = document.querySelectorAll('#reports .reports-filters .report-filter');

    // Get filter values
    const filterValues = {};
    filters.forEach(f => {
        const filterType = f.dataset.filterType;
        if(filterType) {
            filterValues[filterType] = f.value.toLowerCase().trim();
        }
    });

    // Apply filters to each row
    let visibleCount = 0;
    rows.forEach(row => {
        let show = true;
        const college = row.cells[2]?.textContent.toLowerCase() || '';
        const problem = row.cells[3]?.textContent.toLowerCase() || '';
        const statusBadge = row.cells[4]?.querySelector('.status-badge');
        const status = statusBadge ? statusBadge.textContent.toLowerCase() : '';
        const priorityBadge = row.cells[5]?.querySelector('.priority-badge');
        const priority = priorityBadge ? priorityBadge.textContent.toLowerCase() : '';
        const dateStr = row.cells[1]?.textContent || ''; // Assuming YYYY-MM-DD

        // Apply each filter
        if (filterValues.college && college !== filterValues.college) show = false;
        if (filterValues.status && status !== filterValues.status) show = false;
        if (filterValues.priority && priority !== filterValues.priority) show = false;
        // Basic date comparison (adjust if date format is different or range is needed)
        if (filterValues.date && dateStr !== filterValues.date.replace(/-/g, '-')) show = false; // Ensure format consistency
        if (filterValues.search && !row.textContent.toLowerCase().includes(filterValues.search)) show = false;

        row.style.display = show ? '' : 'none';
        if(show) visibleCount++;
    });

    updateReportsStats(); // Update stats based on filtered data
    updateReportsPagination(); // Update pagination based on visible rows
    // updateReportsChartsData(visibleRows); // Optional: Update charts dynamically
}


function initializeReportsCharts() {
    const collegeCtx = document.getElementById('collegeChart');
    const resolutionCtx = document.getElementById('resolutionChart');

    // Example Data (replace with dynamic data fetch if needed)
    const collegeData = {
         labels: ['Computing', 'Engineering', 'Education', 'Arts'],
         data: [65, 59, 80, 81]
     };
    const resolutionData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        data: [75, 82, 78, 85, 88]
    };

    if (collegeCtx) {
         if (reportCollegeChart) reportCollegeChart.destroy(); // Destroy previous instance
        reportCollegeChart = new Chart(collegeCtx, {
            type: 'bar',
            data: {
                labels: collegeData.labels,
                datasets: [{ label: 'Tickets', data: collegeData.data, backgroundColor: 'crimson' }]
             },
            options: { responsive: true, maintainAspectRatio: false, plugins: { title:{ display: true, text:'Tickets by College' }, legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    } else { console.warn("College chart canvas not found."); }

     if (resolutionCtx) {
         if (reportResolutionChart) reportResolutionChart.destroy();
        reportResolutionChart = new Chart(resolutionCtx, {
            type: 'line',
            data: {
                labels: resolutionData.labels,
                datasets: [{ label: 'Resolved %', data: resolutionData.data, borderColor: '#2ecc71', tension: 0.1 }]
             },
            options: { responsive: true, maintainAspectRatio: false, plugins: { title:{ display: true, text:'Monthly Resolution Rate' } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    } else { console.warn("Resolution chart canvas not found."); }
}

function updateReportsStats() {
    const tableBody = document.querySelector('.reports-table tbody');
    if (!tableBody) return;

    const visibleRows = Array.from(tableBody.querySelectorAll('tr'))
                             .filter(row => row.style.display !== 'none');

    const totalTickets = visibleRows.length;
    const pendingTickets = visibleRows.filter(row => row.cells[4]?.querySelector('.status-badge.pending')).length;
    const resolvedTickets = visibleRows.filter(row => row.cells[4]?.querySelector('.status-badge.resolved')).length;
    const highPriorityTickets = visibleRows.filter(row => row.cells[5]?.querySelector('.priority-badge.high')).length;

    // Update the stat cards
    const statsContainer = document.querySelector('#reports .reports-stats');
    if (statsContainer) {
        statsContainer.querySelector('.report-card:nth-child(1) .report-value').textContent = totalTickets;
        statsContainer.querySelector('.report-card:nth-child(2) .report-value').textContent = pendingTickets;
        statsContainer.querySelector('.report-card:nth-child(3) .report-value').textContent = resolvedTickets;
        statsContainer.querySelector('.report-card:nth-child(4) .report-value').textContent = highPriorityTickets;
    }
}

function updateReportsPagination() {
    // Reuse generic pagination updater
    const table = document.querySelector('.reports-table');
    const visibleRows = table ? Array.from(table.querySelectorAll('tbody tr')).filter(row => row.style.display !== 'none') : [];
    updatePaginationForTable(table, visibleRows.length);
}


function viewReport(button) {
    const row = button.closest('tr');
     if (!row) return;
     const reportId = row.dataset.reportId || row.cells[0]?.textContent; // Prefer data-id
     if (!reportId) return; // Need an ID

    const reportData = {
        id: reportId,
        date: row.cells[1]?.textContent || 'N/A',
        college: row.cells[2]?.textContent || 'N/A',
        problem: row.cells[3]?.textContent || 'N/A',
        status: row.cells[4]?.querySelector('.status-badge')?.textContent || 'N/A',
        priority: row.cells[5]?.querySelector('.priority-badge')?.textContent || 'N/A',
    };
    // Use the generic view modal or create a specific one if layout differs greatly
    const modal = document.getElementById('viewTicketModal'); // Reusing ticket view modal for now
     if (!modal) return;

     const modalTitle = modal.querySelector('.modal-header h2');
     const modalBody = modal.querySelector('.modal-body');

     if (modalTitle) modalTitle.textContent = `Report Details ${reportData.id}`;
     if (modalBody) {
         // Customize display for reports
         modalBody.innerHTML = `
            <div class="report-info">
                 <p><strong>Report ID:</strong> ${reportData.id}</p>
                 <p><strong>Date:</strong> ${reportData.date}</p>
                 <p><strong>College:</strong> ${reportData.college}</p>
                 <p><strong>Problem:</strong> ${reportData.problem}</p>
                 <p><strong>Status:</strong> <span class="status-badge ${reportData.status.toLowerCase()}">${reportData.status}</span></p>
                 <p><strong>Priority:</strong> <span class="priority-badge ${reportData.priority.toLowerCase()}">${reportData.priority}</span></p>
             </div>`;
     }

     modal.style.display = 'flex';
     // initializeModalClose(modal); // Initialized on load
}

function editReport(button) {
     const row = button.closest('tr');
     if (!row) return;
     const reportId = row.dataset.reportId || row.cells[0]?.textContent;
     const modal = document.getElementById('editTicketModal'); // Reuse edit ticket modal structure
     if (!modal || !reportId) {
         showNotification('Error', 'Cannot edit report: Missing report ID or modal.', 'error');
         console.error("Missing data-report-id or modal for edit:", row);
         return;
     }

     modal.dataset.editingReportId = reportId; // Store context: This is a report
     modal.dataset.editingRowIndex = row.rowIndex;

     // Populate form - adapt fields from editTicketModal
     modal.querySelector('.modal-header h2').textContent = `Edit Report ${reportId}`;
     modal.querySelector('#editSubject').value = row.cells[3]?.textContent || ''; // Problem -> Subject
     modal.querySelector('#editStatus').value = row.cells[4]?.querySelector('.status-badge')?.textContent || '';
     modal.querySelector('#editPriority').value = row.cells[5]?.querySelector('.priority-badge')?.textContent || '';
     modal.querySelector('#editAssigned').value = row.cells[2]?.textContent || ''; // College -> Assigned
     modal.querySelector('#editDescription').value = `Date: ${row.cells[1]?.textContent || 'N/A'}`; // Put date here

     // Change form handler specifically for reports
     const form = modal.querySelector('#editTicketForm'); // The reused form ID
     form.onsubmit = null; // Clear previous submit handler
     form.onsubmit = handleEditReportSave; // Assign report save handler

     modal.style.display = 'flex';
     // initializeModalClose(modal); // Initialized on load
}

function handleEditReportSave(event) {
     event.preventDefault();
     const form = event.target;
     const modal = form.closest('.modal');
     const saveBtn = modal.querySelector('.save-btn');
     const reportId = modal.dataset.editingReportId; // Get report ID
     const rowIndex = parseInt(modal.dataset.editingRowIndex, 10);

      if (!reportId || isNaN(rowIndex)) {
          showNotification('Error', 'Could not find report information to save.', 'error');
          console.error("Missing reportId or rowIndex in modal dataset for report edit");
          return;
     }

     saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
     saveBtn.disabled = true;

     // Get data from form (map back to report structure)
     const updatedData = {
        problem: form.querySelector('#editSubject').value, // Subject -> Problem
        status: form.querySelector('#editStatus').value,
        priority: form.querySelector('#editPriority').value,
        college: form.querySelector('#editAssigned').value // Assigned -> College
        // Date is not currently editable in this form
     };

     console.log("Saving Report:", reportId, updatedData);

     // --- SIMULATE SAVING ---
     setTimeout(() => {
        const table = document.querySelector('.reports-table');
        const row = table?.rows[rowIndex];

        if (row && (row.dataset.reportId === reportId || row.cells[0]?.textContent === reportId) ) { // Verify ID
             row.cells[2].textContent = updatedData.college;
             row.cells[3].textContent = updatedData.problem;
             row.cells[4].innerHTML = `<span class="status-badge ${updatedData.status.toLowerCase()}">${updatedData.status}</span>`;
             row.cells[5].innerHTML = `<span class="priority-badge ${updatedData.priority.toLowerCase()}">${updatedData.priority}</span>`;
             // Update data attribute if needed
             if (!row.dataset.reportId) row.dataset.reportId = reportId;
        } else {
             console.error("Could not find or verify report row to update:", reportId, "at index:", rowIndex);
             showNotification('Error', 'Failed to update report in table.', 'error');
        }

        saveBtn.innerHTML = 'Save Changes';
        saveBtn.disabled = false;
        closeModal(modal);
        showNotification('Success', `Report ${reportId} updated.`, 'success');
        updateReportsStats(); // Recalculate stats after edit

    }, 1000);
}

// --- Delete Functionality ---

// Generic function to show the delete confirmation modal
function showDeleteConfirmation(itemId, itemType, displayInfo, rowIndex, extraDetails = {}) {
    const modal = document.getElementById('deleteConfirmModal');
    if (!modal) {
        console.error("Delete confirmation modal (#deleteConfirmModal) not found!");
        return;
    }

    // Set the confirmation message
    const messageElement = modal.querySelector('#deleteConfirmMessage');
    if (messageElement) {
        // Provide more context in the message
        messageElement.textContent = `Are you sure you want to delete this ${itemType}?`;
    }

    // Display item ID and extra details
    const detailsContainer = modal.querySelector('#deleteDetailsContainer');
    if (detailsContainer) {
        let detailsHtml = `<p><strong>Type:</strong> ${itemType}</p>`; // Always show type
        detailsHtml += `<p><strong>ID:</strong> ${itemId}</p>`;       // Always show ID
        detailsHtml += `<p><strong>Identifier:</strong> ${displayInfo}</p>`; // Show main display info
        for (const key in extraDetails) {
            if (Object.hasOwnProperty.call(extraDetails, key)) {
                // Escape HTML in values to prevent XSS if data comes from user input
                const safeValue = extraDetails[key].replace(/</g, "<").replace(/>/g, ">");
                detailsHtml += `<p><strong>${key}:</strong> ${safeValue}</p>`;
            }
        }
        detailsContainer.innerHTML = detailsHtml;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.style.display = 'none'; // Hide if container not found
    }

    // Set the action for the confirm button based on itemType
    const confirmBtn = modal.querySelector('#confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.onclick = null; // Clear previous listener first
        switch (itemType.toLowerCase()) { // Use lower case for safety
            case 'ticket':
                confirmBtn.onclick = () => confirmDeleteTicketAction(itemId, rowIndex);
                break;
            case 'user':
                confirmBtn.onclick = () => confirmDeleteUserAction(itemId, rowIndex);
                break;
            case 'report':
                confirmBtn.onclick = () => confirmDeleteReportAction(itemId, rowIndex);
                break;
            default:
                console.error("Unknown item type for deletion:", itemType);
                // Optionally disable the button or hide the modal
                confirmBtn.onclick = () => { console.error("Cannot delete unknown type."); closeModal(modal); };
                return;
        }
    } else {
        console.error("Confirm delete button (#confirmDeleteBtn) not found!");
        return;
    }

    modal.style.display = 'flex'; // Show the modal
    // initializeModalClose(modal); // Already initialized on load
}


// Specific Delete Initiation Functions
function deleteTicket(button) {
    const row = button.closest('tr');
    if (!row) return;
    const ticketId = row.dataset.ticketId || row.cells[0]?.textContent || 'Unknown ID';
    const subject = row.cells[1]?.textContent || 'No Subject';
    showDeleteConfirmation(ticketId, 'Ticket', subject, row.rowIndex);
}

function deleteUser(button) {
    const row = button.closest('tr');
    if (!row) return;
    const userId = row.dataset.userId;
    if (!userId) {
        showNotification('Error', 'Cannot delete user: Missing user ID reference.', 'error');
        console.error("Missing data-user-id on table row:", row);
        return;
    }
    const userName = row.cells[0]?.textContent || 'Unknown User';
    const userEmail = row.cells[1]?.textContent || 'No email';
    showDeleteConfirmation(userId, 'User', userName, row.rowIndex, { Email: userEmail });
}

function deleteReport(button) {
    const row = button.closest('tr');
    if (!row) return;
    const reportId = row.dataset.reportId;
    if (!reportId) {
         showNotification('Error', 'Cannot delete report: Missing report ID reference.', 'error');
         console.error("Missing data-report-id on table row:", row);
        return;
    }
    const problem = row.cells[3]?.textContent || 'Unknown Problem';
    const college = row.cells[2]?.textContent || 'Unknown College';
    showDeleteConfirmation(reportId, 'Report', reportId, row.rowIndex, { Problem: problem, College: college });
}


// Specific Confirmation Action Functions
function confirmDeleteTicketAction(ticketId, rowIndex) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmBtn = modal?.querySelector('#confirmDeleteBtn');
    const table = document.querySelector('.data-table.tickets-table');

    if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="loading-spinner"></span>Deleting...';
        confirmBtn.disabled = true;
    }

    console.log(`PERFORMING DELETE: Ticket ${ticketId}`); // Placeholder for API call

    setTimeout(() => { // Simulate network delay
        let deleted = false;
        if (table && rowIndex >= 0) {
            const row = table.rows[rowIndex];
            if (row && (row.dataset.ticketId === ticketId || row.cells[0]?.textContent === ticketId)) {
                row.remove();
                deleted = true;
                showNotification('Success', `Ticket ${ticketId} deleted.`, 'success');
                updatePaginationForTable(table); // Update pagination
            }
        }

        if (!deleted) {
            showNotification('Error', 'Could not find ticket row to remove.', 'error');
            console.error(`Failed to find ticket row for ID ${ticketId} at index ${rowIndex}`);
        }

        if (modal) closeModal(modal); // Close modal using the function
        if (confirmBtn) {
            confirmBtn.innerHTML = 'Delete';
            confirmBtn.disabled = false;
        }
    }, 1000);
}

function confirmDeleteUserAction(userId, rowIndex) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmBtn = modal?.querySelector('#confirmDeleteBtn');
    const table = document.querySelector('.data-table.users-table');

    if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="loading-spinner"></span>Deleting...';
        confirmBtn.disabled = true;
    }

    console.log(`PERFORMING DELETE: User ${userId}`); // Placeholder for API call

    setTimeout(() => { // Simulate network delay
        let deleted = false;
        if (table && rowIndex >= 0) {
            const row = table.rows[rowIndex];
            if (row && row.dataset.userId === userId) {
                row.remove();
                deleted = true;
                showNotification('Success', `User ${userId} deleted.`, 'success');
                 updatePaginationForTable(table); // Update pagination
            }
        }

        if (!deleted) {
            showNotification('Error', 'Could not find user row to remove.', 'error');
            console.error(`Failed to find user row for ID ${userId} at index ${rowIndex}`);
        }

        if (modal) closeModal(modal); // Close modal using the function
        if (confirmBtn) {
            confirmBtn.innerHTML = 'Delete';
            confirmBtn.disabled = false;
        }
    }, 1000);
}

function confirmDeleteReportAction(reportId, rowIndex) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmBtn = modal?.querySelector('#confirmDeleteBtn');
    const table = document.querySelector('.reports-table');

    if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="loading-spinner"></span>Deleting...';
        confirmBtn.disabled = true;
    }

    console.log(`PERFORMING DELETE: Report ${reportId}`); // Placeholder for API call

    setTimeout(() => { // Simulate network delay
        let deleted = false;
        if (table && rowIndex >= 0) {
             const row = table.rows[rowIndex];
             if (row && row.dataset.reportId === reportId) {
                 row.remove();
                 deleted = true;
                 showNotification('Success', `Report ${reportId} deleted.`, 'success');
                 updateReportsStats(); // Update report stats after deletion
                 updateReportsPagination(); // Update report pagination info
             }
        }

        if (!deleted) {
            showNotification('Error', 'Could not find report row to remove.', 'error');
            console.error(`Failed to find report row for ID ${reportId} at index ${rowIndex}`);
        }

        if (modal) closeModal(modal); // Close modal using the function
        if (confirmBtn) {
            confirmBtn.innerHTML = 'Delete';
            confirmBtn.disabled = false;
        }
    }, 1000);
}

// --- Settings ---

function handleSettingsSave(event) {
    event.preventDefault(); // Prevent actual form submission
    const form = event.target;
    const saveBtn = form.querySelector('.save-btn');

    saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
    saveBtn.disabled = true;

    const formData = new FormData(form);
    const settingsData = Object.fromEntries(formData.entries());

    console.log("Saving settings:", settingsData); // Log the data

    // Simulate saving settings
    setTimeout(() => {
        saveBtn.innerHTML = 'Save Settings';
        saveBtn.disabled = false;
        showNotification('Success', 'Settings saved successfully!', 'success');
        // Apply settings if needed (e.g., change theme, update notification preferences)
    }, 1000);
}


// --- Notification System ---

function showNotification(title, message, type = 'success', duration = 4000) { // Default duration 4s
    const container = document.querySelector('.notification-container');
    if (!container) {
        console.error("Notification container not found!");
        return;
    }

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`; // success, error, warning, info

    // Simple text icons for broader compatibility
    const iconMap = {
        success: '✓', // Check mark
        error: '✕',   // Cross mark
        warning: '⚠️', // Warning sign
        info: 'ℹ️'    // Information sign
    };
    const icon = iconMap[type] || 'ℹ️';

    // Sanitize message content if it could come from untrusted sources
    // For this example, assuming messages are safe internal strings.
    toast.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close" onclick="this.parentElement.remove()">×</div>
    `;

    container.appendChild(toast);

    // Trigger the show animation
    requestAnimationFrame(() => { // Ensures element is in DOM before adding class
        toast.classList.add('show');
    });

    // Auto remove after duration
    const timeoutId = setTimeout(() => {
        toast.classList.remove('show');
        // Remove the element after the fade out transition completes
        toast.addEventListener('transitionend', () => toast.remove(), { once: true }); // Ensure removal
    }, duration);

    // Allow manual close
    toast.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeoutId); // Prevent auto-remove if manually closed
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    });
}

// --- Generic Pagination Update ---
// (Basic version - updates info text, doesn't handle page slicing)
function updatePaginationForTable(tableElement, visibleRowCount = -1) {
    if (!tableElement) return;
    const paginationContainer = tableElement.nextElementSibling; // Assumes pagination follows table

    if (!paginationContainer || !paginationContainer.classList.contains('table-pagination')) {
       // console.warn("Pagination container not found or incorrect for table:", tableElement);
        return;
    }

    const paginationInfo = paginationContainer.querySelector('.pagination-info');
    if (!paginationInfo) return;

    let count;
    if (visibleRowCount !== -1) {
        count = visibleRowCount;
    } else {
        // Recalculate if count not provided
         count = Array.from(tableElement.querySelectorAll('tbody tr'))
                      .filter(row => row.style.display !== 'none').length;
    }

    // In a real app, you'd calculate total pages, current page etc.
    paginationInfo.textContent = `Showing ${count} of ${count} entries (filtered)`;

    // Disable/Enable Prev/Next buttons (basic example)
     const prevBtn = paginationContainer.querySelector('.pagination-button.prev');
     const nextBtn = paginationContainer.querySelector('.pagination-button.next');
     if(prevBtn) prevBtn.disabled = true; // Always disabled in this basic example
     if(nextBtn) nextBtn.disabled = true; // Always disabled
     // TODO: Implement full pagination logic if dealing with many rows.
}


// --- END ---