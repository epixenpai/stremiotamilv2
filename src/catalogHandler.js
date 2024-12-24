const { fetchTMDBMovies, getImageUrl } = require('./tmdb');
const { getOTTAvailability } = require('./ott');

async function catalogHandler({ type, id, extra }) {
    console.log('Catalog request:', { type, id, extra });

    const page = extra.skip ? Math.floor(extra.skip / 20) + 1 : 1;
    let movies = [];

    if (type === 'movie') {
        let endpoint = '';
        let params = {};

        switch (id) {
            case 'tamil.trending':
                endpoint = '/discover/movie';
                params = { sort_by: 'popularity.desc', 'vote_count.gte': 100, with_original_language: 'ta' };
                break;
            case 'tamil.toprated':
                endpoint = '/discover/movie';
                params = { sort_by: 'vote_average.desc', 'vote_count.gte': 100, with_original_language: 'ta' };
                break;
            case 'tamil.recent':
                endpoint = '/discover/movie';
                params = { sort_by: 'release_date.desc', 'primary_release_date.lte': new Date().toISOString().split('T')[0], with_original_language: 'ta' };
                break;
            case 'tamil.scifi':
                endpoint = '/discover/movie';
                params = { with_genres: '878', with_original_language: 'ta' }; // Sci-fi
                break;
            case 'english.mustwatch':
                endpoint = '/discover/movie';
                params = { sort_by: 'popularity.desc', 'vote_count.gte': 100, with_original_language: 'en' };
                break;
            case 'english.highgrossing':
                endpoint = '/discover/movie';
                params = { sort_by: 'revenue.desc', with_original_language: 'en' };
                break;
            case 'english.ott':
                endpoint = '/discover/movie';
                params = { 'with_watch_providers': '8|119|337', watch_region: 'US', with_original_language: 'en' }; // Adjust for OTT
                break;
            case 'english.intheatre':
                endpoint = '/discover/movie';
                params = { 'with_release_type': '3|4', 'primary_release_date.gte': new Date().toISOString().split('T')[0], with_original_language: 'en' };
                break;
            case 'english.scifi':
                endpoint = '/discover/movie';
                params = { with_genres: '878', with_original_language: 'en' }; // Sci-fi
                break;
            default:
                console.error('Invalid catalog:', id);
                return { metas: [] };
        }

        const data = await fetchTMDBMovies(endpoint, page, params);
        if (!data.results || data.results.length === 0) {
            console.log('No movies found');
            return { metas: [] };
        }

        movies = await Promise.all(data.results.map(async movie => {
            const ottAvailability = await getOTTAvailability(movie.id);
            const poster = getImageUrl(movie.poster_path);
            const background = getImageUrl(movie.backdrop_path, 'original');

            return {
                id: 'tmdb:' + movie.id,
                type: 'movie',
                name: movie.title,
                poster: poster || 'https://example.com/placeholder.png',
                background: background || poster,
                description: movie.overview,
                releaseInfo: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
                imdbRating: movie.vote_average,
                genres: movie.genre_ids,
                ottPlatforms: Object.entries(ottAvailability)
                    .filter(([_, available]) => available)
                    .map(([platform]) => platform)
                    .join(', ')
            };
        }));
    }

    console.log(`Returning ${movies.length} movies`);
    return { metas: movies };
}

module.exports = catalogHandler;
