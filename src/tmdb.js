const fetch = require('node-fetch');
const config = require('./config');

async function fetchTMDBMovies(endpoint, page = 1, params = {}) {
    try {
        const queryParams = new URLSearchParams({
            api_key: config.tmdb.apiKey,
            with_original_language: 'ta',
            page: page.toString(),
            region: 'IN',
            ...params
        });

        const url = `${config.tmdb.baseUrl}${endpoint}?${queryParams}`;
        console.log('Fetching from TMDB:', endpoint, 'with params:', params);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.results?.length || 0} movies`);
        return data;
    } catch (error) {
        console.error('TMDB API Error:', error.message);
        return { results: [] };
    }
}

function getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${config.tmdb.imageBaseUrl}/${size}${path}`;
}

module.exports = {
    fetchTMDBMovies,
    getImageUrl
};