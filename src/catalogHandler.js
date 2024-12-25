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
                params = {
                    sort_by: 'popularity.desc',
                    'vote_count.gte': 100
                };
                break;
            case 'tamil.toprated':
                endpoint = '/discover/movie';
                params = {
                    sort_by: 'vote_average.desc',
                    'vote_count.gte': 100
                };
                break;
            case 'tamil.recent':
                endpoint = '/discover/movie';
                params = {
                    sort_by: 'release_date.desc',
                    'primary_release_date.lte': new Date().toISOString().split('T')[0]
                };
            
            case 'english.newott':
                endpoint = '/movie/upcoming';
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
                poster: poster || 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
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
