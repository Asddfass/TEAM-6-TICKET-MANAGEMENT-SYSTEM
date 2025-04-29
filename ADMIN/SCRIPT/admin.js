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

// Chart Initialization
function initializeCharts() {
  // Dashboard Ticket Chart
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
          },
          plugins: {
              title: {
                  display: true,
                  text: 'Monthly Ticket Statistics',
                  font: { size: 16 }
              }
          }
      }
  });

  // Reports Charts
  if(document.getElementById('reportChart')) {
      // Pie Chart for Status Distribution
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
                      text: 'Ticket Status Distribution',
                      font: { size: 16 }
                  }
              }
          }
      });

      // Line Chart for Trends
      const trendCtx = document.getElementById('trendChart').getContext('2d');
      new Chart(trendCtx, {
          type: 'line',
          data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                  label: 'Ticket Trends',
                  data: [30, 45, 35, 50, 40, 60],
                  borderColor: 'crimson',
                  tension: 0.1,
                  fill: false
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: 'Ticket Trends Over Time',
                      font: { size: 16 }
                  }
              },
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
  }
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

  document.getElementById('ticketDetails').innerHTML = `
      <div class="ticket-info">
          <p><strong>Ticket ID:</strong> ${ticketData.id}</p>
          <p><strong>Subject:</strong> ${ticketData.subject}</p>
          <p><strong>Status:</strong> <span class="status-badge ${ticketData.status.toLowerCase()}">${ticketData.status}</span></p>
          <p><strong>Priority:</strong> <span class="priority-badge ${ticketData.priority.toLowerCase()}">${ticketData.priority}</span></p>
          <p><strong>Assigned To:</strong> ${ticketData.assigned}</p>
          <p><strong>Created Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          <div class="ticket-description">
              <h3>Description</h3>
              <p>Detailed description of the ticket issue goes here...</p>
          </div>
      </div>
  `;

  document.getElementById('viewTicketModal').style.display = 'block';
}

function editTicket(button) {
  const row = button.closest('tr');
  const modal = document.getElementById('editTicketModal');
  
  document.getElementById('editSubject').value = row.cells[1].textContent;
  document.getElementById('editStatus').value = row.cells[2].querySelector('.status-badge').textContent;
  document.getElementById('editPriority').value = row.cells[3].querySelector('.priority-badge').textContent;
  document.getElementById('editAssigned').value = row.cells[4].textContent;
  
  modal.style.display = 'block';

  document.getElementById('editTicketForm').onsubmit = function(e) {
      e.preventDefault();
      const status = document.getElementById('editStatus').value;
      const priority = document.getElementById('editPriority').value;
      
      row.cells[1].textContent = document.getElementById('editSubject').value;
      row.cells[2].innerHTML = `<span class="status-badge ${status.toLowerCase()}">${status}</span>`;
      row.cells[3].innerHTML = `<span class="priority-badge ${priority.toLowerCase()}">${priority}</span>`;
      row.cells[4].textContent = document.getElementById('editAssigned').value;
      
      modal.style.display = 'none';
  };
}

function deleteTicket(button) {
  const row = button.closest('tr');
  const modal = document.getElementById('deleteTicketModal');
  modal.style.display = 'block';

  document.getElementById('confirmDelete').onclick = function() {
      row.remove();
      modal.style.display = 'none';
  };

  document.getElementById('cancelDelete').onclick = function() {
      modal.style.display = 'none';
  };
}

// User Management Functions
function approveUser(button) {
  const row = button.closest('tr');
  row.cells[3].innerHTML = '<span class="status-badge active">Active</span>';
  button.parentElement.innerHTML = `
      <button class="viewBtn" onclick="viewUser(this)">View</button>
      <button class="editBtn" onclick="editUser(this)">Edit</button>
      <button class="deleteBtn" onclick="deleteUser(this)">Delete</button>
  `;
}

function rejectUser(button) {
  const row = button.closest('tr');
  row.cells[3].innerHTML = '<span class="status-badge inactive">Rejected</span>';
  button.parentElement.innerHTML = `
      <button class="approve-btn" onclick="approveUser(this)">Approve</button>
  `;
}

// Search and Filter Functions
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

  // Modal close buttons
  document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.onclick = function() {
          this.closest('.modal').style.display = 'none';
      };
  });

  // Close modal when clicking outside
  window.onclick = function(event) {
      if (event.target.classList.contains('modal')) {
          event.target.style.display = 'none';
      }
  };

  // Pagination buttons
  document.querySelectorAll('.pagination-button').forEach(button => {
      button.addEventListener('click', function() {
          document.querySelectorAll('.pagination-button').forEach(btn => {
              btn.classList.remove('active');
          });
          this.classList.add('active');
          // Add pagination logic here
      });
  });
}

// Settings Functions
function saveSettings() {
  const notifications = document.getElementById('notifications').value;
  showNotification('Settings saved successfully!');
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
      notification.classList.add('show');
      setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
              notification.remove();
          }, 300);
      }, 2000);
  }, 100);
}

// Logout Function
function handleLogout() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
          <h2>Confirm Logout</h2>
          <p>Are you sure you want to logout?</p>
          <div class="modal-buttons">
              <button onclick="confirmLogout()" class="logout-btn">Logout</button>
              <button onclick="this.closest('.modal').remove()" class="cancel-btn">Cancel</button>
          </div>
      </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'block';
}

function confirmLogout() {
  window.location.href = '../LOGIN/';
}

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
      showSection,
      viewTicket,
      editTicket,
      deleteTicket,
      approveUser,
      rejectUser,
      handleLogout
  };
}
