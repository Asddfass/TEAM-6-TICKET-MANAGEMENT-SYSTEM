// Initialize when document loads
document.addEventListener('DOMContentLoaded', function() {
  showSection('dashboard');
  initializeCharts();
  initializeEventListeners();
  initializePagination();
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

  // Reports Charts
  if(document.getElementById('reportChart')) {
      const reportCtx = document.getElementById('reportChart').getContext('2d');
      new Chart(reportCtx, {
          type: 'pie',
          data: {
              labels: ['Open', 'Closed', 'Pending'],
              datasets: [{
                  data: [65, 102, 30],
                  backgroundColor: [
                      'rgba(33, 150, 243, 0.8)',
                      'rgba(76, 175, 80, 0.8)',
                      'rgba(255, 152, 0, 0.8)'
                  ]
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: 'Ticket Status Distribution'
                  }
              }
          }
      });

      const trendCtx = document.getElementById('trendChart').getContext('2d');
      new Chart(trendCtx, {
          type: 'line',
          data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                  label: 'Ticket Trends',
                  data: [30, 45, 35, 50, 40, 60],
                  borderColor: 'crimson',
                  tension: 0.1
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: 'Monthly Ticket Trends'
                  }
              }
          }
      });
  }
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
      }, 800);
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
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
          row.remove();
          modal.style.display = 'none';
          showNotification('Success', `Ticket ${ticketId} has been deleted`, 'success');
      }, 300);
  }, 800);
}
// User Management Functions
function viewUser(button) {
  const row = button.closest('tr');
  const userData = {
      name: row.cells[0].textContent,
      email: row.cells[1].textContent,
      role: row.cells[2].textContent,
      status: row.cells[3].querySelector('.status-badge').textContent
  };

  const modal = document.getElementById('viewUserModal');
  modal.querySelector('.modal-content').innerHTML = `
      <span class="close">&times;</span>
      <h2>User Details</h2>
      <div class="user-info">
          <p><strong>Name:</strong> ${userData.name}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Role:</strong> ${userData.role}</p>
          <p><strong>Status:</strong> <span class="status-badge ${userData.status.toLowerCase()}">${userData.status}</span></p>
      </div>
  `;

  modal.style.display = 'block';
  initializeModalClose(modal);
}

function editUser(button) {
  const row = button.closest('tr');
  const userData = {
      name: row.cells[0].textContent,
      email: row.cells[1].textContent,
      role: row.cells[2].textContent,
      status: row.cells[3].querySelector('.status-badge').textContent
  };

  const modal = document.getElementById('editUserModal');
  modal.querySelector('.modal-content').innerHTML = `
      <span class="close">&times;</span>
      <h2>Edit User</h2>
      <form id="editUserForm">
          <div class="form-group">
              <label>Name:</label>
              <input type="text" id="editUserName" value="${userData.name}" required>
          </div>
          <div class="form-group">
              <label>Email:</label>
              <input type="email" id="editUserEmail" value="${userData.email}" required>
          </div>
          <div class="form-group">
              <label>Role:</label>
              <select id="editUserRole">
                  <option value="Admin" ${userData.role === 'Admin' ? 'selected' : ''}>Admin</option>
                  <option value="Support Agent" ${userData.role === 'Support Agent' ? 'selected' : ''}>Support Agent</option>
                  <option value="User" ${userData.role === 'User' ? 'selected' : ''}>User</option>
              </select>
          </div>
          <div class="modal-buttons">
              <button type="submit" class="save-btn">Save Changes</button>
              <button type="button" class="cancel-btn" onclick="closeModal(this)">Cancel</button>
          </div>
      </form>
  `;

  modal.style.display = 'block';

  // Handle form submission
  document.getElementById('editUserForm').onsubmit = function(e) {
      e.preventDefault();
      
      // Show loading spinner
      const saveBtn = this.querySelector('.save-btn');
      saveBtn.innerHTML = '<span class="loading-spinner"></span>Saving...';
      saveBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
          // Update table row
          row.cells[0].textContent = document.getElementById('editUserName').value;
          row.cells[1].textContent = document.getElementById('editUserEmail').value;
          row.cells[2].textContent = document.getElementById('editUserRole').value;

          // Close modal and show notification
          modal.style.display = 'none';
          showNotification('Success', 'User updated successfully!', 'success');
      }, 800);
  };

  initializeModalClose(modal);
}

function deleteUser(button) {
  const row = button.closest('tr');
  const userName = row.cells[0].textContent;

  const modal = document.getElementById('deleteUserModal');
  modal.querySelector('.modal-content').innerHTML = `
      <div class="delete-confirmation">
          <div class="delete-icon"></div>
          <h2>Delete User</h2>
          <p>Are you sure you want to delete this user?</p>
          <div class="delete-details">
              <p><strong>Name:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${row.cells[1].textContent}</p>
              <p><strong>Role:</strong> ${row.cells[2].textContent}</p>
          </div>
          <div class="modal-buttons">
              <button class="delete-btn" onclick="confirmDeleteUser(this)">Delete</button>
              <button class="cancel-btn" onclick="closeModal(this)">Cancel</button>
          </div>
      </div>
  `;

  modal.style.display = 'block';
  initializeModalClose(modal);
}

function confirmDeleteUser(button) {
  const modal = button.closest('.modal');
  const userName = button.closest('.delete-confirmation')
      .querySelector('.delete-details p:first-child strong')
      .nextSibling.textContent.trim();
  const row = Array.from(document.querySelectorAll('tr'))
      .find(row => row.cells[0].textContent.trim() === userName);

  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span>Deleting...';
  button.disabled = true;

  // Simulate API call
  setTimeout(() => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
          row.remove();
          modal.style.display = 'none';
          showNotification('Success', `User ${userName} has been deleted`, 'success');
      }, 300);
  }, 800);
}

function approveUser(button) {
  const row = button.closest('tr');
  const userName = row.cells[0].textContent;

  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span>Approving...';
  button.disabled = true;

  // Simulate API call
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

  // Simulate API call
  setTimeout(() => {
      row.cells[3].innerHTML = '<span class="status-badge inactive">Rejected</span>';
      row.cells[4].innerHTML = `
          <button class="approve-btn" onclick="approveUser(this)">Approve</button>
      `;
      showNotification('Warning', `User ${userName} has been rejected`, 'error');
  }, 800);
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
