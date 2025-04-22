// Function to show the selected section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
  }

  // Initialize bar chart for monthly ticket data
  const ctx = document.getElementById('ticketChart').getContext('2d');
  const ticketChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Tickets Availed',
        data: [50, 75, 60, 90, 100],
        backgroundColor: ['#007bff', '#ffc107', '#28a745', '#6c757d', '#17a2b8'] // blue, yellow, green, gray, cyan
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Monthly Ticket Data'
        }
      }
    }
  });

  // Initialize pie chart for ticket status distribution in reports section
  const reportCtx = document.getElementById('reportChart').getContext('2d');
  const reportChart = new Chart(reportCtx, {
    type: 'pie',
    data: {
      labels: ['Open', 'Pending', 'Closed'],
      datasets: [{
        label: 'Ticket Status Distribution',
        data: [10, 5, 15],
        backgroundColor: ['#007bff', '#ffc107', '#28a745'] // blue, yellow, green
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Ticket Status Distribution'
        }
      }
    }
  });



  document.addEventListener('DOMContentLoaded', () => {
    // Get references to tickets table body, edit modal, modal overlay, and edit form
    const ticketsTable = document.getElementById('ticketsTable').getElementsByTagName('tbody')[0];
    const editModal = document.getElementById('editModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const editForm = document.getElementById('editForm');
    let currentEditRow = null; // Track the row currently being edited

    // Show the edit modal and overlay
    function showModal() {
      editModal.style.display = 'block';
      modalOverlay.style.display = 'block';
    }

    // Hide the edit modal and overlay, reset form and current edit row
    function hideModal() {
      editModal.style.display = 'none';
      modalOverlay.style.display = 'none';
      currentEditRow = null;
      editForm.reset();
    }

    // Event listener for clicks on the tickets table (for edit, delete, view buttons)
    ticketsTable.addEventListener('click', (e) => {
      if (e.target.classList.contains('editBtn')) {
        // Edit button clicked: populate form with current row data and show modal
        currentEditRow = e.target.closest('tr');
        const cells = currentEditRow.getElementsByTagName('td');
        document.getElementById('editSubject').value = cells[1].textContent;
        document.getElementById('editStatus').value = cells[2].textContent;
        document.getElementById('editPriority').value = cells[3].textContent;
        document.getElementById('editAssignedTo').value = cells[4].textContent;
        showModal();
      } else if (e.target.classList.contains('deleteBtn')) {
        // Delete button clicked: confirm and remove the row
        const row = e.target.closest('tr');
        if (confirm('Are you sure you want to delete this ticket?')) {
          row.remove();
        }
      } else if (e.target.classList.contains('viewBtn')) {
        // View button clicked: show alert with ticket details
        const row = e.target.closest('tr');
        alert(`Viewing ticket details:\nID: ${row.cells[0].textContent}\nSubject: ${row.cells[1].textContent}\nStatus: ${row.cells[2].textContent}\nPriority: ${row.cells[3].textContent}\nAssigned To: ${row.cells[4].textContent}`);
      }
    });

    // Handle submission of the edit form to update the ticket row
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (currentEditRow) {
        const cells = currentEditRow.getElementsByTagName('td');
        cells[1].textContent = document.getElementById('editSubject').value;
        cells[2].textContent = document.getElementById('editStatus').value;
        cells[3].textContent = document.getElementById('editPriority').value;
        cells[4].textContent = document.getElementById('editAssignedTo').value;
        hideModal();
      }
    });

    // Cancel button hides the edit modal without saving changes
    document.getElementById('cancelEdit').addEventListener('click', () => {
      hideModal();
    });

    // Event listener for adding a new ticket row (button with id 'addTicketBtn' expected)
    document.getElementById('addTicketBtn').addEventListener('click', () => {
      // Insert a new row with input fields for new ticket details
      const newRow = ticketsTable.insertRow();
      const newId = `#${(ticketsTable.rows.length).toString().padStart(3, '0')}`;
      newRow.innerHTML = `
        <td style="padding: 10px; border: 1px solid #ddd;">${newId}</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><input type="text" placeholder="Subject" style="width: 100%;" /></td>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <select style="width: 100%;">
            <option value="Open">Open</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <select style="width: 100%;">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;"><input type="text" placeholder="Assigned To" style="width: 100%;" /></td>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <button class="saveNewBtn">Save</button>
          <button class="cancelNewBtn">Cancel</button>
        </td>
      `;

      // Disable the add ticket button while adding a new ticket
      document.getElementById('addTicketBtn').disabled = true;

      // Save button event: validate inputs and convert inputs to text cells
      newRow.querySelector('.saveNewBtn').addEventListener('click', () => {
        const inputs = newRow.querySelectorAll('input, select');
        if (!inputs[0].value.trim() || !inputs[2].value.trim()) {
          alert('Please fill in all required fields.');
          return;
        }
        newRow.innerHTML = `
          <td style="padding: 10px; border: 1px solid #ddd;">${newId}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inputs[0].value}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inputs[1].value}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inputs[2].value}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inputs[3].value}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">
            <button class="viewBtn">View</button>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
          </td>
        `;
        // Re-enable the add ticket button after saving
        document.getElementById('addTicketBtn').disabled = false;
      });

      // Cancel button event: remove the new row and re-enable add ticket button
      newRow.querySelector('.cancelNewBtn').addEventListener('click', () => {
        newRow.remove();
        document.getElementById('addTicketBtn').disabled = false;
      });
    });
  });


  // Bar chart for tickets by priority
  const priorityCtx = document.getElementById('priorityChart').getContext('2d');
  const priorityChart = new Chart(priorityCtx, {
    type: 'bar',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        label: 'Tickets by Priority',
        data: [70, 80, 47],
        backgroundColor: ['#e63946', '#f4a261', '#2a9d8f']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Tickets by Priority'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      }
    }
  });

  // Line chart for ticket trends over time
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  const trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Tickets Created',
          data: [20, 30, 25, 40, 35, 50, 45],
          borderColor: '#264653',
          backgroundColor: 'rgba(38, 70, 83, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Tickets Closed',
          data: [10, 15, 20, 25, 30, 35, 40],
          borderColor: '#2a9d8f',
          backgroundColor: 'rgba(42, 157, 143, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Ticket Trends Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      }
    }
  });