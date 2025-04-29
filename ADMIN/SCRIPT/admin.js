// Initialize when document loads
document.addEventListener('DOMContentLoaded', function() {
  showSection('dashboard');
  initializeCharts();
  initializeEventListeners();
});

// Section Navigation
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Initialize Charts
function initializeCharts() {
  // Ticket Statistics Chart
  const ticketCtx = document.getElementById('ticketChart').getContext('2d');
  new Chart(ticketCtx, {
      type: 'bar',
      data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
              label: 'Monthly Tickets',
              data: [65, 59, 80, 81, 56, 55],
              backgroundColor: 'rgba(220, 20, 60, 0.7)',
              borderColor: 'crimson',
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
                  grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                  }
              },
              x: {
                  grid: {
                      display: false
                  }
              }
          }
      }
  });

  // Initialize other charts if needed
}

// Notification System
function showNotification(title, message, type = 'success') {
  const notificationContainer = document.querySelector('.notification-container') || createNotificationContainer();
  
  const toast = document.createElement('div');
  toast.className = `notification-toast ${type}`;
  toast.innerHTML = `
      <div class="notification-icon">
          ${type === 'success' ? '✓' : '!'}
      </div>
      <div class="notification-content">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
      </div>
      <div class="notification-close" onclick="this.parentElement.remove()">×</div>
  `;

  notificationContainer.appendChild(toast);
  
  // Show animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.className = 'notification-container';
  document.body.appendChild(container);
  return container;
}

// Ticket Management Functions
function viewTicket(button) {
  const row = button.closest('tr');
  const ticketData = {
      id: row.cells[0].textContent,
      subject: row.cells[1].textContent,
      status: row.cells[2].querySelector('.status-badge').textContent,
      priority: row.cells[3].querySelector('.priority-badge').textContent,
      assigned: row.cells[4].textContent
  };

  const modal = document.getElementById('viewTicketModal');
  modal.querySelector('.modal-content').innerHTML = `
      <span class="close">&times;</span>
      <h2>Ticket Details</h2>
      <div class="ticket-info">
          <p><strong>Ticket ID:</strong> ${ticketData.id}</p>
          <p><strong>Subject:</strong> ${ticketData.subject}</p>
          <p><strong>Status:</strong> <span class="status-badge ${ticketData.status.toLowerCase()}">${ticketData.status}</span></p>
          <p><strong>Priority:</strong> <span class="priority-badge ${ticketData.priority.toLowerCase()}">${ticketData.priority}</span></p>
          <p><strong>Assigned To:</strong> ${ticketData.assigned}</p>
          <div class="ticket-description">
              <h3>Description</h3>
              <p>Detailed description of the ticket issue...</p>
          </div>
      </div>
  `;

  modal.style.display = 'block';
  initializeModalClose(modal);
}

function editTicket(button) {
  const row = button.closest('tr');
  const ticketData = {
      id: row.cells[0].textContent,
      subject: row.cells[1].textContent,
      status: row.cells[2].querySelector('.status-badge').textContent,
      priority: row.cells[3].querySelector('.priority-badge').textContent,
      assigned: row.cells[4].textContent
  };

  const modal = document.getElementById('editTicketModal');
  modal.style.display = 'block';

  // Populate form fields
  document.getElementById('editSubject').value = ticketData.subject;
  document.getElementById('editStatus').value = ticketData.status;
  document.getElementById('editPriority').value = ticketData.priority;
  document.getElementById('editAssigned').value = ticketData.assigned;

  // Handle form submission
  document.getElementById('editTicketForm').onsubmit = function(e) {
      e.preventDefault();
      
      // Show loading spinner
      const saveBtn = this.querySelector('.save-btn');
      saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
      saveBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
          // Update table row
          row.cells[1].textContent = document.getElementById('editSubject').value;
          row.cells[2].innerHTML = `<span class="status-badge ${document.getElementById('editStatus').value.toLowerCase()}">${document.getElementById('editStatus').value}</span>`;
          row.cells[3].innerHTML = `<span class="priority-badge ${document.getElementById('editPriority').value.toLowerCase()}">${document.getElementById('editPriority').value}</span>`;
          row.cells[4].textContent = document.getElementById('editAssigned').value;

          // Close modal and show notification
          modal.style.display = 'none';
          showNotification('Success', 'Ticket updated successfully!', 'success');
      }, 1000);
  };

  initializeModalClose(modal);
}

function deleteTicket(button) {
  const row = button.closest('tr');
  const ticketId = row.cells[0].textContent;
  
  const modal = document.getElementById('deleteTicketModal');
  modal.querySelector('.modal-content').innerHTML = `
      <div class="delete-confirmation">
          <div class="delete-icon"></div>
          <h2>Delete Ticket</h2>
          <p>Are you sure you want to delete ticket ${ticketId}?</p>
          <div class="delete-details">
              <p><strong>Subject:</strong> ${row.cells[1].textContent}</p>
              <p><strong>Status:</strong> ${row.cells[2].textContent}</p>
          </div>
          <div class="modal-buttons">
              <button class="delete-btn" onclick="confirmDelete(this, '${ticketId}')">Delete</button>
              <button class="cancel-btn" onclick="closeModal(this)">Cancel</button>
          </div>
      </div>
  `;

  modal.style.display = 'block';
  initializeModalClose(modal);
}

function confirmDelete(button, ticketId) {
  const modal = button.closest('.modal');
  const row = document.querySelector(`tr:has(td:first-child:contains('${ticketId}'))`);
  
  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span>Deleting...';
  button.disabled = true;

  // Simulate API call
  setTimeout(() => {
      row.classList.add('deleting');
      setTimeout(() => {
          row.remove();
          modal.style.display = 'none';
          showNotification('Success', `Ticket ${ticketId} has been deleted`, 'success');
      }, 300);
  }, 1000);
}

// Modal Utilities
function initializeModalClose(modal) {
  const closeBtn = modal.querySelector('.close');
  if (closeBtn) {
      closeBtn.onclick = () => closeModal(modal);
  }
  
  window.onclick = (event) => {
      if (event.target === modal) {
          closeModal(modal);
      }
  };
}

function closeModal(element) {
  const modal = element.closest('.modal');
  modal.style.display = 'none';
}

// Initialize Event Listeners
function initializeEventListeners() {
  // Search functionality
  document.querySelectorAll('.search-box input').forEach(input => {
      input.addEventListener('keyup', function() {
          const searchText = this.value.toLowerCase();
          const table = this.closest('.section').querySelector('table');
          const rows = table.getElementsByTagName('tr');

          for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              const text = row.textContent.toLowerCase();
              row.style.display = text.includes(searchText) ? '' : 'none';
          }
      });
  });

  // Filter functionality
  document.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', function() {
          const filterValue = this.value.toLowerCase();
          const table = this.closest('.section').querySelector('table');
          const rows = table.getElementsByTagName('tr');

          for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              const statusElement = row.querySelector('.status-badge');
              if (statusElement) {
                  const status = statusElement.textContent.toLowerCase();
                  row.style.display = (!filterValue || status === filterValue) ? '' : 'none';
              }
          }
      });
  });
}

// Add notification container to the body
document.body.insertAdjacentHTML('beforeend', '<div class="notification-container"></div>');
// Updated Delete Function
function deleteTicket(button) {
  const row = button.closest('tr');
  const ticketId = row.cells[0].textContent;
  const subject = row.cells[1].textContent;

  const modal = document.getElementById('deleteTicketModal');
  modal.style.display = 'block';

  const confirmDelete = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');

  // Handle delete confirmation
  confirmDelete.onclick = function() {
      // Show loading state
      this.innerHTML = '<span class="loading-spinner"></span>Deleting...';
      this.disabled = true;

      // Simulate delete action
      setTimeout(() => {
          row.style.opacity = '0';
          row.style.transform = 'translateX(-20px)';
          row.style.transition = 'all 0.3s ease';
          
          setTimeout(() => {
              row.remove();
              modal.style.display = 'none';
              showNotification('Success', `Ticket ${ticketId} has been deleted`, 'success');
          }, 300);
      }, 800);
  };

  // Handle cancel
  cancelDelete.onclick = function() {
      modal.style.display = 'none';
  };
}

// Updated Approve/Reject Functions
function approveUser(button) {
  const row = button.closest('tr');
  const userName = row.cells[0].textContent;

  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span>Approving...';
  button.disabled = true;

  // Simulate approve action
  setTimeout(() => {
      row.cells[3].innerHTML = '<span class="status-badge active">Active</span>';
      row.cells[4].innerHTML = `
          <button class="viewBtn" onclick="viewUser(this)">View</button>
          <button class="editBtn" onclick="editUser(this)">Edit</button>
          <button class="deleteBtn" onclick="deleteUser(this)">Delete</button>
      `;
      showNotification('Success', `User ${userName} has been approved`, 'success');
  }, 800);
}

function rejectUser(button) {
  const row = button.closest('tr');
  const userName = row.cells[0].textContent;

  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span>Rejecting...';
  button.disabled = true;

  // Simulate reject action
  setTimeout(() => {
      row.cells[3].innerHTML = '<span class="status-badge inactive">Rejected</span>';
      row.cells[4].innerHTML = `
          <button class="approve-btn" onclick="approveUser(this)">Approve</button>
      `;
      showNotification('Warning', `User ${userName} has been rejected`, 'error');
  }, 800);
}

// Pagination Functions
function initializePagination() {
  const itemsPerPage = 5; // Number of items per page
  const tables = document.querySelectorAll('.data-table');

  tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      const totalPages = Math.ceil(rows.length / itemsPerPage);
      let currentPage = 1;

      const paginationContainer = table.parentElement.querySelector('.table-pagination');
      if (!paginationContainer) return;

      const paginationControls = paginationContainer.querySelector('.pagination-controls');
      const paginationInfo = paginationContainer.querySelector('.pagination-info');

      // Update pagination buttons
      function updatePaginationButtons() {
          paginationControls.innerHTML = `
              <button class="pagination-button prev" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
              ${generatePageButtons()}
              <button class="pagination-button next" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
          `;

          // Update info text
          const startItem = (currentPage - 1) * itemsPerPage + 1;
          const endItem = Math.min(currentPage * itemsPerPage, rows.length);
          paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${rows.length} entries`;

          // Add event listeners to new buttons
          addPaginationEventListeners();
      }

      // Generate page number buttons
      function generatePageButtons() {
          let buttons = '';
          for (let i = 1; i <= totalPages; i++) {
              buttons += `<button class="pagination-button ${i === currentPage ? 'active' : ''}">${i}</button>`;
          }
          return buttons;
      }

      // Show appropriate rows for current page
      function showPage(page) {
          const start = (page - 1) * itemsPerPage;
          const end = start + itemsPerPage;

          rows.forEach((row, index) => {
              row.style.display = (index >= start && index < end) ? '' : 'none';
          });
      }

      // Add event listeners to pagination buttons
      function addPaginationEventListeners() {
          const buttons = paginationControls.querySelectorAll('.pagination-button');
          buttons.forEach(button => {
              button.addEventListener('click', () => {
                  if (button.classList.contains('prev') && currentPage > 1) {
                      currentPage--;
                  } else if (button.classList.contains('next') && currentPage < totalPages) {
                      currentPage++;
                  } else if (!button.classList.contains('prev') && !button.classList.contains('next')) {
                      currentPage = parseInt(button.textContent);
                  }
                  showPage(currentPage);
                  updatePaginationButtons();
              });
          });
      }

      // Initialize pagination
      showPage(1);
      updatePaginationButtons();
  });
}

// Add this to your existing initializeEventListeners function
function initializeEventListeners() {
  // ... your existing event listeners ...

  // Initialize pagination
  initializePagination();
}
