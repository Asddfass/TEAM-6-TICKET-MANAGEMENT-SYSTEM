/* SIDEPANEL SWITCH */

const links = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.content-section');

links.forEach(link => 
{
    link.addEventListener('click', e => 
    {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);

        links.forEach(l => l.classList.remove('active'));

        link.classList.add('active');

        sections.forEach(section => 
        {
            section.classList.add('d-none');
            if (section.id === target) 
            {
                section.classList.remove('d-none');
            }
        });
    });
});

/* VIEW TICKET MODAL */

const modal = document.getElementById('ticketModal');

modal.addEventListener('show.bs.modal', function (event) 
{
    const button = event.relatedTarget;
    const ticketId = button.getAttribute('data-id');
    const ticketTitle = button.getAttribute('data-title');
    const ticketPriority = button.getAttribute('data-priority');
    const ticketStatus = button.getAttribute('data-status');
    const ticketDescription = button.getAttribute('data-description');
    const submittedBy = button.getAttribute('data-submitted-by');
    const submittedOn = button.getAttribute('data-submitted-on');

    document.getElementById('ticketModalLabel').textContent = `Ticket #${ticketId} - ${ticketTitle}`;
    document.getElementById('modalPriority').textContent = ticketPriority;
    document.getElementById('modalStatus').textContent = ticketStatus;
    document.getElementById('modalDescription').textContent = ticketDescription;
    document.getElementById('modalSubmittedBy').textContent = submittedBy;
    document.getElementById('modalSubmittedOn').textContent = submittedOn;

    const statusBadge = document.getElementById('modalStatus');
    if (ticketStatus === 'Pending') 
    {
        statusBadge.classList.add('bg-warning');
        statusBadge.classList.remove('bg-success', 'bg-danger');
    } 
    else if (ticketStatus === 'In Progress') 
    {
        statusBadge.classList.add('bg-success');
        statusBadge.classList.remove('bg-warning', 'bg-danger');
    } 
    else if (ticketStatus === 'Escalated') 
    {
        statusBadge.classList.add('bg-danger');
        statusBadge.classList.remove('bg-warning', 'bg-success');
    }
});

/* CONFIRM LOGOUT */
document.getElementById('confirmLogout').addEventListener('click', function () 
{
    window.location.href = '../LOGIN/';
});

/* BURGER BUTTON */
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');

sidebarToggle.addEventListener('click', () => 
{
    sidebar.classList.toggle('active');
});