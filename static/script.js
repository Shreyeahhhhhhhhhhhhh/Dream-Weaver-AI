document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const loader = document.getElementById('loader');
    const storyContainer = document.getElementById('story-container');
    const storybook = document.getElementById('storybook');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageIndicator = document.getElementById('page-indicator');

    let storyPages = [];
    let currentPageIndex = 0;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a story idea!');
            return;
        }

        // Show loader and hide previous story
        loader.classList.remove('hidden');
        storyContainer.classList.add('hidden');
        storybook.innerHTML = '';

        try {
            const response = await fetch('/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate story. Please try again.');
            }

            const data = await response.json();
            storyPages = data.pages;
            currentPageIndex = 0;
            displayStory();

        } catch (error) {
            alert(error.message);
        } finally {
            loader.classList.add('hidden');
        }
    });

    function displayStory() {
        if (storyPages.length === 0) return;

        storyContainer.classList.remove('hidden');
        storybook.innerHTML = ''; // Clear previous content

        storyPages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.classList.add('story-page');
            if (index === currentPageIndex) {
                pageElement.classList.add('active');
            }

            pageElement.innerHTML = `
                <img src="${page.image_url}" alt="Story illustration">
                <p>${page.text}</p>
                <audio controls>
                    <source src="${page.audio_url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
            storybook.appendChild(pageElement);
        });

        updateNavigation();
    }

    function updateNavigation() {
        const totalPages = storyPages.length;

        // Update page indicator
        pageIndicator.textContent = `${currentPageIndex + 1} / ${totalPages}`;

        // Show/hide nav buttons
        prevBtn.classList.toggle('hidden', currentPageIndex === 0);
        nextBtn.classList.toggle('hidden', currentPageIndex === totalPages - 1);
        
        // Show navigation controls if there is more than one page
        document.querySelector('.navigation').style.display = totalPages > 1 ? 'flex' : 'none';
    }

    prevBtn.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updateActivePage();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPageIndex < storyPages.length - 1) {
            currentPageIndex++;
            updateActivePage();
        }
    });
    
    function updateActivePage() {
        const pages = document.querySelectorAll('.story-page');
        pages.forEach((page, index) => {
            page.classList.toggle('active', index === currentPageIndex);
        });
        updateNavigation();
    }
});