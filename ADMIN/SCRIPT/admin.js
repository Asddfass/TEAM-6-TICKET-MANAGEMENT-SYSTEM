// Function to show different sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
  });
  // Show the selected section
  document.getElementById(sectionId).style.display = 'block';
}

// Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
  // Monthly Tickets Bar Chart
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

  // Reports Page Charts
  if(document.getElementById('reportChart')) {
      const reportCtx = document.getElementById('reportChart').getContext('2d');
      new Chart(reportCtx, {
          type: 'pie',
          data: {
              labels: ['Open', 'Closed', 'Pending'],
              datasets: [{
                  data: [65, 102, 30],
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(255, 206, 86, 0.8)'
                  ]
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: 'Ticket Status Distribution',
                      font: {
                          size: 16
                      }
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
                      font: {
                          size: 16
                      }
                  }
              }
          }
      });
  }
});

// User Approval Functions
function approveUser(button) {
  showConfirmationModal('Are you sure you want to approve this user?', () => {
      const row = button.closest('tr');
      row.querySelector('td:nth-child(4)').textContent = 'Active';
      button.parentElement.innerHTML = '<button class="reject-btn" onclick="rejectUser(this)">Deactivate</button>';
  });
}

function rejectUser(button) {
  showConfirmationModal('Are you sure you want to reject this user?', () => {
      const row = button.closest('tr');
      row.querySelector('td:nth-child(4)').textContent = 'Rejected';
      button.parentElement.innerHTML = '<button class="approve-btn" onclick="approveUser(this)">Approve</button>';
  });
}

function showConfirmationModal(message, onConfirm) {
  const modal = document.getElementById('confirmationModal');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  modalMessage.textContent = message;
  modal.style.display = 'block';

  confirmBtn.onclick = () => {
      onConfirm();
      modal.style.display = 'none';
  };

  cancelBtn.onclick = () => {
      modal.style.display = 'none';
  };

  window.onclick = (event) => {
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  };
}

// Settings functions
function saveSettings() {
  const notifications = document.getElementById('notifications').value;
  showConfirmationModal('Settings saved successfully!', () => {
      // Additional settings save logic can go here
  });
}

// Logout function
function handleLogout() {
  showConfirmationModal('Are you sure you want to logout?', () => {
      window.location.href = '../LOGIN/';
  });
}

// Initialize dashboard as default view
document.addEventListener('DOMContentLoaded', function() {
  showSection('dashboard');
});
