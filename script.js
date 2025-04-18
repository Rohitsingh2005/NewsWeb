// DOM Elements
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const categoryBtns = document.querySelectorAll('.category-btn');

// API Key - Register on newsapi.org to get your own API key
const apiKey = '90b18687f8a948fcbe3d4dfba1b2b119'; // Replace with your NewsAPI key
const apiUrl = 'https://newsapi.org/v2/';

// Default parameters
let currentCategory = getPageCategory();
let currentPage = 1;
let totalResults = 0;
let searchQuery = '';

// Get current page category
function getPageCategory() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'business.html') return 'business';
    if (page === 'sports.html') return 'sports';
    if (page === 'technology.html') return 'technology';
    if (page === 'entertainment.html') return 'entertainment';
    if (page === 'article.html') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || 'general';
    }
    
    return 'general';
}

// Initialize the news app
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the article detail page
    if (window.location.pathname.includes('article.html')) {
        displayArticleDetail();
    } else {
        highlightCurrentCategory();
        updatePageTitle();
        fetchNews();
        setupEventListeners();
    }
});

// Highlight current category in navigation
function highlightCurrentCategory() {
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === currentCategory) {
            btn.classList.add('active');
        }
    });
}

// Update page title based on category
function updatePageTitle() {
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = `Latest ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} News`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search button
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            searchQuery = searchInput.value.trim();
            newsContainer.innerHTML = '';
            currentPage = 1;
            fetchNews();
        }
    });

    // Search on Enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Infinite scroll
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 5 && 
            newsContainer.children.length < totalResults) {
            currentPage++;
            fetchNews(false);
        }
    });
}

// Fetch news from the API
function fetchNews(showLoader = true) {
    if (showLoader) toggleLoader(true);
    
    let url;
    let cacheKey;
    
    if (searchQuery) {
        url = `${apiUrl}everything?q=${searchQuery}&apiKey=${apiKey}&page=${currentPage}&pageSize=12&language=en`;
        cacheKey = `search_${searchQuery}_page${currentPage}`;
    } else {
        url = `${apiUrl}top-headlines?country=us&category=${currentCategory}&apiKey=${apiKey}&page=${currentPage}&pageSize=12`;
        cacheKey = `${currentCategory}_page${currentPage}`;
    }
    
    // Check cache first to reduce API calls
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
        console.log('Using cached data for:', cacheKey);
        const data = JSON.parse(cachedData);
        totalResults = data.totalResults;
        displayNews(data.articles);
        toggleLoader(false);
        return;
    }

    // For development/demo purposes without an API key, use this sample data instead:
    if (apiKey === '90b18687f8a948fcbe3d4dfba1b2b119') {
        console.log('Using sample data. Please replace with your actual API key from newsapi.org');
        displaySampleNews();
        toggleLoader(false);
        return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            totalResults = data.totalResults;
            
            // Cache the results (for 15 minutes)
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            setTimeout(() => {
                sessionStorage.removeItem(cacheKey);
            }, 15 * 60 * 1000);
            
            displayNews(data.articles);
            toggleLoader(false);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsContainer.innerHTML = `<div class="error-message">Failed to load news. ${error.message}</div>`;
            toggleLoader(false);
            
            // Fallback to sample data if API fails
            if (error.message.includes('apiKey')) {
                setTimeout(() => {
                    console.log('API key error, falling back to sample data');
                    displaySampleNews();
                }, 2000);
            }
        });
}

// Save article for detail view
function saveArticleDetail(article) {
    localStorage.setItem('currentArticle', JSON.stringify(article));
}

// Display news in the container
function displayNews(articles) {
    if (articles.length === 0) {
        newsContainer.innerHTML = '<div class="error-message">No news found. Try a different search or category.</div>';
        return;
    }

    articles.forEach(article => {
        if (!article.title || article.title === '[Removed]') return;
        
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card');
        
        const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date';
        
        // Handle cases where image might fail to load
        const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop';
        
        newsCard.innerHTML = `
            <img src="${article.urlToImage || fallbackImage}" alt="${article.title}" class="news-img" onerror="this.onerror=null;this.src='${fallbackImage}';">
            <div class="news-content">
                <div class="news-source">
                    <span class="source-name">${article.source.name || 'Unknown Source'}</span>
                    <span class="news-date">${date}</span>
                </div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available'}</p>
                <a href="article.html?id=${encodeURIComponent(article.title)}&category=${currentCategory}" class="read-more">Read More</a>
            </div>
        `;
        
        // Add click event to save article and navigate
        newsCard.querySelector('.read-more').addEventListener('click', (e) => {
            e.preventDefault();
            saveArticleDetail(article);
            window.location.href = `article.html?id=${encodeURIComponent(article.title)}&category=${currentCategory}`;
        });
        
        // Add click event to the entire card
        newsCard.addEventListener('click', (e) => {
            // Don't trigger if they clicked on the Read More link (that has its own handler)
            if (!e.target.classList.contains('read-more')) {
                saveArticleDetail(article);
                window.location.href = `article.html?id=${encodeURIComponent(article.title)}&category=${currentCategory}`;
            }
        });
        
        newsContainer.appendChild(newsCard);
    });
}

// Display article detail page
function displayArticleDetail() {
    const article = JSON.parse(localStorage.getItem('currentArticle'));
    
    if (!article) {
        // If no article in storage, try to get data from API based on URL params
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const category = urlParams.get('category') || 'general';
        
        if (articleId) {
            fetchArticleById(articleId, category);
            return;
        }
        
        if (apiKey === 'YOUR_API_KEY') {
            const allSampleArticles = [...sampleArticles, ...moreSampleArticles];
            const foundArticle = allSampleArticles.find(a => a.title === articleId);
            
            if (foundArticle) {
                renderArticleDetail(foundArticle);
                return;
            }
        }
        
        document.body.innerHTML = `
            <div class="error-message">
                <h2>Article not found</h2>
                <p>Sorry, we couldn't find the article you're looking for.</p>
                <a href="index.html" class="back-to-home">Back to Home</a>
            </div>
        `;
        return;
    }
    
    // If we have article with just basic data, try to get full content
    if (article && (!article.content || article.content.length < 200) && article.url) {
        fetchFullArticle(article);
    } else {
        renderArticleDetail(article);
    }
}

// Fetch article by title
function fetchArticleById(articleId, category) {
    toggleLoader(true);
    
    // For sample data
    if (apiKey === 'YOUR_API_KEY') {
        const allSampleArticles = [...sampleArticles, ...moreSampleArticles];
        const foundArticle = allSampleArticles.find(a => a.title === decodeURIComponent(articleId));
        
        if (foundArticle) {
            setTimeout(() => {
                toggleLoader(false);
                renderArticleDetail(foundArticle);
            }, 500);
            return;
        }
        
        toggleLoader(false);
        displayArticleNotFound();
        return;
    }
    
    // Search for the article using the API
    const url = `${apiUrl}everything?q=${encodeURIComponent(articleId)}&apiKey=${apiKey}&pageSize=1&language=en`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            toggleLoader(false);
            if (data.articles && data.articles.length > 0) {
                const article = data.articles[0];
                saveArticleDetail(article);
                renderArticleDetail(article);
            } else {
                displayArticleNotFound();
            }
        })
        .catch(error => {
            console.error('Error fetching article:', error);
            toggleLoader(false);
            displayArticleNotFound();
        });
}

// Try to fetch full article content (where possible)
function fetchFullArticle(article) {
    // First, render the basic article
    renderArticleDetail(article);
    
    // For API with key, we could use a service that extracts content from URLs
    // This is a placeholder for such functionality
    if (apiKey !== 'YOUR_API_KEY' && article.url) {
        // This would be where you call a content extraction API
        // For now, we'll just add a loading indicator to the content
        document.querySelector('.article-content').innerHTML += `
            <p><em>Loading additional content...</em></p>
        `;
        
        // Simulate fetching additional content (in a real app, use an article extraction API)
        setTimeout(() => {
            document.querySelector('.article-content').innerHTML = `
                <p>${article.description || 'No description available'}</p>
                ${article.content ? `<p>${article.content.replace(/\[\+\d+ chars\]/, '')}</p>` : ''}
                <p>This is where full article content would appear if we used a content extraction API. NewsAPI's free tier only provides snippets of articles.</p>
                <p>In a production environment, you could use services like:</p>
                <ul>
                    <li>News API's paid plan</li>
                    <li>Diffbot</li>
                    <li>Article Extractor API</li>
                    <li>Mercury Web Parser</li>
                </ul>
                <p>These services would extract the full text from the source website.</p>
            `;
        }, 1500);
    }
}

// Display article not found message
function displayArticleNotFound() {
    document.querySelector('main').innerHTML = `
        <div class="error-message">
            <h2>Article not found</h2>
            <p>Sorry, we couldn't find the article you're looking for.</p>
            <a href="index.html" class="back-to-home">Back to Home</a>
        </div>
    `;
}

// Render article detail content
function renderArticleDetail(article) {
    const main = document.querySelector('main');
    const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date';
    
    // Fallback image if the article image fails
    const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop';
    
    main.innerHTML = `
        <article class="article-detail">
            <div class="article-header">
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">
                    <span class="article-source">${article.source.name || 'Unknown Source'}</span>
                    <span class="article-date">${date}</span>
                </div>
            </div>
            
            <img src="${article.urlToImage || fallbackImage}" 
                alt="${article.title}" class="article-image" onerror="this.onerror=null;this.src='${fallbackImage}';">
                
            <div class="article-content">
                <p>${article.description || 'No description available'}</p>
                ${article.content ? `<p>${article.content.replace(/\[\+\d+ chars\]/, '')}</p>` : ''}
                <p>${article.author ? `By ${article.author}` : ''}</p>
                
                ${apiKey === 'YOUR_API_KEY' ? `
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl eget aliquet aliquam, nisl sapien aliquam nisl, eget aliquet nisl sapien eget nisl. Sed euismod, nisl eget aliquet aliquam, nisl sapien aliquam nisl, eget aliquet nisl sapien eget nisl.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                ` : ''}
            </div>
            
            <a href="${article.url}" target="_blank" class="read-more">Read Original Article</a>
            <a href="${currentCategory === 'general' ? 'index.html' : currentCategory + '.html'}" class="back-to-home">Back to ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} News</a>
        </article>
    `;
    
    // Update page title with article title
    document.title = `${article.title} - NewsWeb`;
}

// Sample articles data
const sampleArticles = [
    {
        source: { name: 'Tech News' },
        author: 'John Doe',
        title: 'New AI Breakthrough Changes Everything',
        description: 'Scientists have developed a new AI model that can understand and generate human-like text better than ever before.',
        url: 'https://example.com/ai-news',
        urlToImage: 'https://images.unsplash.com/photo-1677442135132-174c26574bdf?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-15T09:45:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum porttitor lobortis feugiat. Phasellus ut sem nulla. Nulla eget est quis neque pulvinar sollicitudin. Morbi euismod, magna nec malesuada eleifend, ex arcu facilisis magna, in fermentum tellus nisi sed nisi. [+2000 chars]'
    },
    {
        source: { name: 'Business Insider' },
        author: 'Jane Smith',
        title: 'Stock Market Reaches Record High',
        description: 'The stock market has reached unprecedented levels following positive economic indicators.',
        url: 'https://example.com/market-news',
        urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-14T14:30:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum porttitor lobortis feugiat. Phasellus ut sem nulla. Nulla eget est quis neque pulvinar sollicitudin. [+1800 chars]'
    },
    {
        source: { name: 'Sports Center' },
        author: 'Mike Johnson',
        title: 'Team USA Wins Gold in Olympics',
        description: 'Team USA has secured multiple gold medals in various events at the Olympic Games.',
        url: 'https://example.com/sports-news',
        urlToImage: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-13T18:15:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum porttitor lobortis feugiat. [+1500 chars]'
    },
    {
        source: { name: 'Entertainment Tonight' },
        author: 'Sarah Williams',
        title: 'New Blockbuster Movie Breaks Box Office Records',
        description: 'The latest superhero movie has shattered previous box office records in its opening weekend.',
        url: 'https://example.com/movie-news',
        urlToImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-12T21:00:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1200 chars]'
    },
    {
        source: { name: 'Health Magazine' },
        author: 'Dr. Robert Brown',
        title: 'New Study Reveals Benefits of Meditation',
        description: 'Research shows that regular meditation can significantly reduce stress and improve overall health.',
        url: 'https://example.com/health-news',
        urlToImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-11T11:20:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1600 chars]'
    },
    {
        source: { name: 'Science Daily' },
        author: 'Emily Clark',
        title: 'Mars Rover Discovers Signs of Ancient Life',
        description: 'NASA\'s rover has found evidence suggesting that Mars may have once supported microbial life.',
        url: 'https://example.com/science-news',
        urlToImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-10T08:45:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1700 chars]'
    }
];

// More sample articles
const moreSampleArticles = [
    {
        source: { name: 'Travel Magazine' },
        author: 'Alex Turner',
        title: 'Top 10 Vacation Destinations for 2023',
        description: 'Discover the most beautiful and affordable travel destinations to visit this year.',
        url: 'https://example.com/travel-news',
        urlToImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-09T16:30:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1400 chars]'
    },
    {
        source: { name: 'Food Network' },
        author: 'Chef Maria Lopez',
        title: 'Simple Recipes for Busy Professionals',
        description: 'Learn how to prepare delicious meals in under 30 minutes with minimal ingredients.',
        url: 'https://example.com/food-news',
        urlToImage: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-08T12:15:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1300 chars]'
    },
    {
        source: { name: 'Education Times' },
        author: 'Professor David Wilson',
        title: 'Remote Learning Trends in Higher Education',
        description: 'Universities are adapting to new remote learning technologies and methodologies.',
        url: 'https://example.com/education-news',
        urlToImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop',
        publishedAt: '2023-09-07T09:50:00Z',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. [+1900 chars]'
    }
];

// Display sample news for development/demo
function displaySampleNews() {
    // Filter articles based on current category
    let filteredArticles = sampleArticles;
    
    if (currentCategory === 'business') {
        filteredArticles = sampleArticles.filter(article => 
            article.source.name === 'Business Insider' || 
            article.title.toLowerCase().includes('market') ||
            article.description.toLowerCase().includes('economic')
        );
    } else if (currentCategory === 'sports') {
        filteredArticles = sampleArticles.filter(article => 
            article.source.name === 'Sports Center' || 
            article.title.toLowerCase().includes('olympics') ||
            article.description.toLowerCase().includes('team')
        );
    } else if (currentCategory === 'technology') {
        filteredArticles = sampleArticles.filter(article => 
            article.source.name === 'Tech News' || 
            article.title.toLowerCase().includes('ai') ||
            article.description.toLowerCase().includes('technology')
        );
    } else if (currentCategory === 'entertainment') {
        filteredArticles = sampleArticles.filter(article => 
            article.source.name === 'Entertainment Tonight' || 
            article.title.toLowerCase().includes('movie') ||
            article.description.toLowerCase().includes('box office')
        );
    }
    
    // If no articles match the category, show a couple random ones
    if (filteredArticles.length === 0) {
        filteredArticles = sampleArticles.slice(0, 3);
    }
    
    displayNews(filteredArticles);
    
    // Add more sample articles for simulating infinite scroll
    setTimeout(() => {
        if (currentPage > 1) {
            displayNews(moreSampleArticles);
        }
    }, 500);
}

// Toggle loader visibility
function toggleLoader(show) {
    loader.style.display = show ? 'flex' : 'none';
} 