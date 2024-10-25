// This script will handle all loading activity in the content page based on what button is pressed in the navigation bar.

// Function to load content into ContentPage div with an error handler.
function loadContent(fileName) {
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('ContentPage').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading the page: ', error);
            document.getElementById('ContentPage').innerHTML = `<p>Error loading content. Please try again later.</p>`;
        });
}

// Simplifying event listener setup.
document.addEventListener('DOMContentLoaded', () => {
    const buttons = {
        'HomeButton': '../Pages/Home.html',
        'AidButton': '../Pages/Aid.html',
        'NGOButton': '../Pages/NGOs.html',
        'AboutButton': '../Pages/About.html',
        'ContactButton': '../Pages/ContactUs.html'
    };

    // Load Home.html as standard.
    loadContent(buttons.HomeButton);

    // Setup event listeners for each button.
    Object.keys(buttons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', () => {
            loadContent(buttons[buttonId]);
        });
    });
});
