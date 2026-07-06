const express = require('express');
const router = express.Router();
const pool = require('../../db');
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    req.flash('error', 'У вас нет прав доступа к панели администратора');
    res.redirect('/');
};

router.use(isAdmin);

router.get('/', async (req, res) => {
    try {
        const collections = await pool.query('SELECT * FROM collections');
        
        const movieSearch = req.query.movieSearch || '';
        const movies = await pool.query(
            "SELECT * FROM movies WHERE title ILIKE $1 ORDER BY id DESC LIMIT 20",
            [`%${movieSearch}%`]
        );

        const users = await pool.query("SELECT id, username, email, is_admin FROM users ORDER BY id DESC");

        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM movies) as total_movies,
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM reviews) as total_reviews,
                (SELECT COUNT(*) FROM collections) as total_collections
        `);

        res.render('admin', { 
            results: null, 
            collections: collections.rows, 
            allMovies: movies.rows,
            users: users.rows,
            stats: stats.rows[0],
            movieSearch: movieSearch
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Ошибка загрузки админки");
    }
});

router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURI(query)}&language=ru-RU`);
        
        const collections = await pool.query('SELECT * FROM collections');
        const users = await pool.query("SELECT id, username, email, is_admin FROM users ORDER BY id DESC");
        const movies = await pool.query("SELECT * FROM movies ORDER BY id DESC LIMIT 20");
        
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM movies) as total_movies,
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM reviews) as total_reviews
        `);

        res.render('admin', { 
            results: response.data.results, 
            collections: collections.rows,
            allMovies: movies.rows,   
            users: users.rows,        
            stats: stats.rows[0],    
            movieSearch: '' 
        });
    } catch (err) { 
        console.error("Ошибка поиска:", err);
        req.flash('error', 'Ошибка поиска в TMDB');
        res.redirect('/admin');
    }
});

router.post('/add', async (req, res) => {
    const { tmdb_id, collection_id, is_popular } = req.body;
    try {
        const movieData = await axios.get(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=ru-RU`);
        const m = movieData.data;
        const genresList = m.genres.map(g => g.name).join(', ');

        const result = await pool.query(
            `INSERT INTO movies (tmdb_id, title, poster_path, release_date, genres, vote_average, overview, is_popular) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             ON CONFLICT (tmdb_id) DO UPDATE SET is_popular = EXCLUDED.is_popular RETURNING id`,
            [m.id, m.title, m.poster_path, m.release_date || null, genresList, m.vote_average, m.overview, is_popular === 'true']
        );

        if (collection_id) {
            await pool.query('INSERT INTO collection_movies (collection_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [collection_id, result.rows[0].id]);
        }
        
        req.flash('success', `Фильм "${m.title}" добавлен!`);
        res.redirect('/admin');
    } catch (err) { 
        console.error(err);
        req.flash('error', 'Ошибка при добавлении фильма');
        res.redirect('/admin');
    }
});

router.post('/movie/delete', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM collection_movies WHERE movie_id = $1', [id]);
        await pool.query('DELETE FROM favorites WHERE movie_id = $1', [id]);
        await pool.query('DELETE FROM reviews WHERE movie_id = $1', [id]);
        await pool.query('DELETE FROM movies WHERE id = $1', [id]);
        req.flash('success', 'Фильм полностью удален');
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Ошибка при удалении фильма");
    }
});

router.post('/user/toggle-admin/:id', async (req, res) => {
    try {
        await pool.query("UPDATE users SET is_admin = NOT is_admin WHERE id = $1", [req.params.id]);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Ошибка изменения прав");
    }
});

router.post('/user/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await pool.query("DELETE FROM reviews WHERE user_id = $1", [id]);
        await pool.query("DELETE FROM favorites WHERE user_id = $1", [id]);
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Ошибка при удалении пользователя");
    }
});

router.post('/collection', async (req, res) => {
    await pool.query('INSERT INTO collections (name) VALUES ($1)', [req.body.name]);
    res.redirect('/admin');
});

router.post('/collection/delete', async (req, res) => {
    const { id } = req.body;
    await pool.query('DELETE FROM collection_movies WHERE collection_id = $1', [id]);
    await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    res.redirect('/admin');
});

router.get('/reviews', async (req, res) => {
    try {
        const reviews = await pool.query(`
            SELECT reviews.*, users.username, movies.title as movie_title 
            FROM reviews 
            JOIN users ON reviews.user_id = users.id 
            JOIN movies ON reviews.movie_id = movies.id 
            ORDER BY reviews.created_at DESC
        `);
        res.render('admin_reviews', { reviews: reviews.rows });
    } catch (err) {
        res.status(500).send("Ошибка загрузки рецензий");
    }
});

router.post('/reviews/delete/:id', async (req, res) => {
    await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
    res.redirect('/admin/reviews');
});

module.exports = router;