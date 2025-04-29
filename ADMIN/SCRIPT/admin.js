// Show/Hide sections
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

// Initialize dashboard charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard as default view
  showSection('dashboard');
  
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
          },
          plugins: {
              title: {
                  display: true,
                  text: 'Monthly Ticket Statistics',
                  font: {
                      size: 16
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
                      text: 'Ticket Status Distribution',
                      font: { size: 16 }
                  }
              }
          }
      });
  }

  if(document.getElementById('trendChart')) {
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
                      text: 'Ticket Trends Over Time',
                      font: { size: 16 }
                  }
              }
          }
      });
  }

  // Add event listeners to all buttons
  initializeButtons();
});

// Initialize all button click handlers
function initializeButtons() {
  // View ticket buttons
  document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', function() {
          const row = this.closest('tr');
          viewTicket(row);
      });
  });

  // Edit ticket buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', function() {
          const row = this.closest('tr');
          editTicket(row);
      });
  });

  // Delete ticket buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
          const row = this.closest('tr');
          deleteTicket(row);
      });
  });
}

// Ticket Management Functions
function viewTicket(row) {
  const ticketData = {
      id: row.cells[0].textContent,
      subject: row.cells[1].textContent,
      status: row.cells[2].textContent,
      priority: row.cells[3].textContent,
      assigned: row.cells[4].textContent
  };

  showModal('View Ticket', `
      <div class="ticket-details">
          <p><strong>Ticket ID:</strong> ${ticketData.id}</p>
          <p><strong>Subject:</strong> ${ticketData.subject}</p>
          <p><strong>Status:</strong> ${ticketData.status}</p>
          <p><strong>Priority:</strong> ${ticketData.priority}</p>
          <p><strong>Assigned To:</strong> ${ticketData.assigned}</p>
      </div>
  `);
}

function editTicket(row) {
  const ticketData = {
      id: row.cells[0].textContent,
      subject: row.cells[1].textContent,
      status: row.cells[2].textContent,
      priority: row.cells[3].textContent,
      assigned: row.cells[4].textContent
  };

  showModal('Edit Ticket', `
      <form id="editTicketForm">
          <div class="form-group">
              <label>Subject:</label>
              <input type="text" id="editSubject" value="${ticketData.subject}" required>
          </div>
          <div class="form-group">
              <label>Status:</label>
              <select id="editStatus">
                  <option value="Open" ${ticketData.status === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="Pending" ${ticketData.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Closed" ${ticketData.status === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
          </div>
          <div class="form-group">
              <label>Priority:</label>
              <select id="editPriority">
                  <option value="High" ${ticketData.priority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${ticketData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${ticketData.priority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
          </div>
          <div class="form-group">
              <label>Assigned To:</label>
              <input type="text" id="editAssigned" value="${ticketData.assigned}" required>
          </div>
          <button type="submit" class="save-btn">Save Changes</button>
      </form>
  `, function(modal) {
      const form = modal.querySelector('#editTicketForm');
      form.onsubmit = function(e) {
          e.preventDefault();
          row.cells[1].textContent = document.getElementById('editSubject').value;
          row.cells[2].textContent = document.getElementById('editStatus').value;
          row.cells[3].textContent = document.getElementById('editPriority').value;
          row.cells[4].textContent = document.getElementById('editAssigned').value;
          modal.style.display = 'none';
      };
  });
}

function deleteTicket(row) {
  showConfirmModal('Are you sure you want to delete this ticket?', function() {
      row.remove();
  });
}

// User Management Functions
function approveUser(button) {
  showConfirmModal('Are you sure you want to approve this user?', function() {
      const row = button.closest('tr');
      row.cells[3].textContent = 'Active';
      button.parentElement.innerHTML = '<button class="reject-btn" onclick="rejectUser(this)">Deactivate</button>';
  });
}

function rejectUser(button) {
  showConfirmModal('Are you sure you want to reject this user?', function() {
      const row = button.closest('tr');
      row.cells[3].textContent = 'Rejected';
      button.parentElement.innerHTML = '<button class="approve-btn" onclick="approveUser(this)">Approve</button>';
  });
}

// Modal Functions
function showModal(title, content, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
          <h2>${title}</h2>
          ${content}
          <button class="close-btn" onclick="this.closest('.modal').remove()">Close</button>
      </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'block';
  if (callback) callback(modal);
}

function showConfirmModal(message, onConfirm) {
  showModal('Confirm Action', `
      <p>${message}</p>
      <div class="modal-buttons">
          <button class="save-btn" onclick="handleConfirm(this)">Confirm</button>
          <button class="delete-btn" onclick="this.closest('.modal').remove()">Cancel</button>
      </div>
  `);

  window.handleConfirm = function(button) {
      onConfirm();
      button.closest('.modal').remove();
  };
}

// Settings Functions
function saveSettings() {
  const notifications = document.getElementById('notifications').value;
  showModal('Success', '<p>Settings saved successfully!</p>');
}

// Logout Function
function handleLogout() {
  showConfirmModal('Are you sure you want to logout?', function() {
      window.location.href = '../LOGIN/';
  });
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.className === 'modal') {
      event.target.remove();
  }
};
