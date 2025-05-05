document.addEventListener('DOMContentLoaded', function () {

    // Show only dashboard by default

    showSection('dashboard');


    // Handle chart rendering

    const ctx = document.getElementById('ticketChart').getContext('2d');

    const ticketChart = new Chart(ctx, {

        type: 'bar',

        data: {

            labels: ['Availed', 'Pending', 'Online', 'Total'],

            datasets: [{

                label: 'Tickets Overview',

                data: [124, 58, 23, 320],

                backgroundColor: ['#2ecc71', '#f39c12', '#3498db', '#9b59b6'],

                borderRadius: 8

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

                    text: 'Ticket Summary'

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

});


// Function to handle section visibility

function showSection(sectionId) {

    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {

        section.style.display = (section.id === sectionId) ? 'block' : 'none';

    });


    // Handle active link styling

    const navLinks = document.querySelectorAll('.nav-links li');

    navLinks.forEach(link => {

        link.classList.remove('active');

    });


    document.getElementById(sectionId + "Link").classList.add('active');

}
