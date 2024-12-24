// Configuration settings
const config = {
    tmdb: {
        apiKey: process.env.TMDB_API_KEY,
        baseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p'
    },
    port: process.env.PORT || 3000
};

module.exports = config;