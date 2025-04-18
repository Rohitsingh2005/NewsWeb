# NewsWeb - Real-Time News Website

A responsive news website that displays real-time news from various categories using the NewsAPI.

## Features

- Real-time news updates
- Dedicated category pages (General, Business, Sports, Technology, Entertainment)
- Detailed article pages with full content
- Search functionality
- Responsive design for all devices
- Infinite scroll loading

## Getting Started

### Prerequisites

- A web browser
- Internet connection
- NewsAPI key (free tier available at [newsapi.org](https://newsapi.org/))

### Setup

1. Clone or download this repository
2. Open `script.js` and replace `YOUR_API_KEY` with your actual NewsAPI key:
   ```javascript
   const apiKey = 'YOUR_API_KEY'; // Replace with your actual key
   ```
3. Open `index.html` in your web browser

### Note About API Key

- The free tier of NewsAPI only allows requests from localhost (during development)
- For production deployment, you'll need a paid subscription or use an alternative news API

## Using the Website

1. **Browse News**: When you first load the page, you'll see the latest general news
2. **Navigate Categories**: Use the navigation menu to switch between different news categories
3. **Read Articles**: Click on any news card or the "Read More" button to view the full article
4. **Search**: Use the search box to find news about specific topics
5. **Return to Categories**: From an article page, use the "Back to Category" button to return to the category listing
6. **Infinite Scroll**: As you scroll down in any category, more news will automatically load

## Website Structure

- `index.html` - General news homepage
- `business.html` - Business news page
- `sports.html` - Sports news page
- `technology.html` - Technology news page
- `entertainment.html` - Entertainment news page
- `article.html` - Individual article page (content loaded dynamically)
- `styles.css` - All website styles
- `script.js` - JavaScript functionality

## Development Mode

If you don't have an API key, the application will use sample data for demonstration purposes.

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No frameworks or libraries required
- Uses the Fetch API for making HTTP requests
- Implements localStorage for article state management

## License

This project is open source and available under the MIT License. 