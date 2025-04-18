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
