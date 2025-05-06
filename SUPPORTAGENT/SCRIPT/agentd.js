/* SIDEPANEL SWITCH */
const links = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.content-section');

links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(section => {
            section.classList.add('d-none');
            if (section.id === target) {
                section.classList.remove('d-none');
            }
        });
    });
});

/* VIEW TICKET MODAL */
const modal = document.getElementById('ticketModal');
let currentTicketData = null;

modal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    currentTicketData = {
        id: button.getAttribute('data-id'),
        title: button.getAttribute('data-title'),
        priority: button.getAttribute('data-priority'),
        status: button.getAttribute('data-status'),
        description: button.getAttribute('data-description'),
        submittedBy: button.getAttribute('data-submitted-by'),
        submittedOn: button.getAttribute('data-submitted-on')
    };

    document.getElementById('ticketModalLabel').textContent = `Ticket #${currentTicketData.id} - ${currentTicketData.title}`;
    document.getElementById('modalPriority').textContent = currentTicketData.priority;
    document.getElementById('modalStatus').textContent = currentTicketData.status;
    document.getElementById('modalDescription').textContent = currentTicketData.description;
    document.getElementById('modalSubmittedBy').textContent = currentTicketData.submittedBy;
    document.getElementById('modalSubmittedOn').textContent = currentTicketData.submittedOn;

    const statusBadge = document.getElementById('modalStatus');
    statusBadge.className = 'badge'; // Reset classes
    if (currentTicketData.status === 'Pending') {
        statusBadge.classList.add('bg-warning');
    } else if (currentTicketData.status === 'In Progress') {
        statusBadge.classList.add('bg-success');
    } else if (currentTicketData.status === 'Escalated') {
        statusBadge.classList.add('bg-danger');
    }
});

/* HANDLE TICKET SUBMISSION */
const submitResponseBtn = document.getElementById('submitResponse');

submitResponseBtn.addEventListener('click', function() {
    const response = document.getElementById('agentResponse').value;
    
    if (!response.trim()) {
        alert('Please enter a response before submitting.');
        return;
    }

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Remove the ticket from Assigned Tickets with animation
    const assignedTicketsTable = document.querySelector('#assigned table tbody');
    const ticketRows = assignedTicketsTable.getElementsByTagName('tr');
    let rowToRemove = null;
    
    for (let row of ticketRows) {
        if (row.cells[0].textContent === `#${currentTicketData.id}`) {
            rowToRemove = row;
            break;
        }
    }

    if (rowToRemove) {
        // Add fade-out animation
        rowToRemove.classList.add('fade-out');
        
        // Create and add new row to Resolved Tickets
        const resolvedTicketsTable = document.querySelector('#resolved table tbody');
        const newRow = document.createElement('tr');
        newRow.classList.add('fade-in', 'new-row');
        
        // Include all ticket information in the new row
        newRow.innerHTML = `
            <td>#${currentTicketData.id}</td>
            <td>${currentTicketData.title}</td>
            <td>${currentTicketData.submittedBy}</td>
            <td>${currentTicketData.submittedOn}</td>
            <td>${currentDate}</td>
            <td>${response}</td>
        `;
        
        // Close the ticket modal
        const ticketModal = bootstrap.Modal.getInstance(modal);
        ticketModal.hide();

        // Wait for fade-out animation to complete before removing
        setTimeout(() => {
            rowToRemove.remove();
            
            // Add the new row to resolved tickets
            resolvedTicketsTable.insertBefore(newRow, resolvedTicketsTable.firstChild);
            
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                newRow.classList.remove('new-row');
            }, 2000);
        }, 500); // Match this with the animation duration (0.5s = 500ms)
    }

    // Clear the response textarea
    document.getElementById('agentResponse').value = '';
});

/* AUTO-DISMISS SUCCESS MODAL */
document.getElementById('successModal').addEventListener('shown.bs.modal', function() {
    setTimeout(() => {
        const successModal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
        successModal.hide();
    }, 3000);
});

/* CONFIRM LOGOUT */
document.getElementById('confirmLogout').addEventListener('click', function() {
    window.location.href = '../LOGIN/';
});

/* BURGER BUTTON */
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

/* PERFORMANCE CHART */
const ctx = document.getElementById('agentChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['New Tickets', 'Resolved', 'Pending', 'Escalated'],
        datasets: [{
            label: 'Tickets',
            data: [23, 89, 14, 5],
            backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
            borderRadius: 10
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: context => `${context.dataset.label}: ${context.parsed.y}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    }
});

/* DARK MODE TOGGLE */
const darkModeToggle = document.getElementById('darkModeToggle');

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Handle dark mode toggle
darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', null);
    }
});
