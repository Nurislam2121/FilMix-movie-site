const express = require("express");
const router = express.Router();
const pool = require("../../db");
const axios = require("axios");

const TMDB_API_KEY = "1d0dee91abab8cce8694734e91607fd4";

router.get("/", async (req, res) => {
  try {
    const popularRes = await pool.query(
      "SELECT * FROM movies WHERE is_popular = true"
    );
    const collectionsRes = await pool.query("SELECT * FROM collections");
    const collections = collectionsRes.rows;

    for (let col of collections) {
      const moviesInCol = await pool.query(
        `SELECT m.* FROM movies m 
                 JOIN collection_movies cm ON m.id = cm.movie_id 
                 WHERE cm.collection_id = $1`,
        [col.id]
      );
      col.movies = moviesInCol.rows;
    }
    res.render("main", {
      popularFilms: popularRes.rows,
      collections: collections,
    });
  } catch (err) {
    console.error(err);
    res.render("main", { popularFilms: [], collections: [] });
  }
});

router.get("/movie", async (req, res) => {
  try {
    let { search, genre, year, sort } = req.query;
    let queryText = "SELECT * FROM movies WHERE 1=1";
    let queryParams = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND title ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    if (genre) {
      queryText += ` AND genres ILIKE $${paramCount}`;
      queryParams.push(`%${genre}%`);
      paramCount++;
    }
    if (year) {
      queryText += ` AND CAST(release_date AS TEXT) LIKE $${paramCount}`;
      queryParams.push(`%${year}%`);
      paramCount++;
    }

    if (sort === "rating-desc") queryText += " ORDER BY vote_average DESC";
    else if (sort === "title-asc") queryText += " ORDER BY title ASC";
    else if (sort === "year-desc") queryText += " ORDER BY release_date DESC";
    else queryText += " ORDER BY id DESC";

    const result = await pool.query(queryText, queryParams);
    res.render("movie", { allMovies: result.rows, filters: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка");
  }
});

router.get("/movie/:id", async (req, res) => {
  try {
    const movieID = req.params.id;
    const currentUserID = req.session.user ? req.session.user.id : null;

    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [movieID]);
    if (result.rows.length === 0) return res.status(404).send("Фильм не найден");

    const film = result.rows[0];

    const tmdbUrl = `https://api.themoviedb.org/3/movie/${film.tmdb_id}?api_key=${TMDB_API_KEY}&language=ru-RU&append_to_response=credits,videos`;
    
    const tmdbResponse = await axios.get(tmdbUrl);
    const extra = tmdbResponse.data;

    const trailer = extra.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'ru') 
             || extra.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
             || extra.videos.results.find(v => v.site === 'YouTube');
    const trailerKey = trailer ? trailer.key : null;

    const director = extra.credits.crew.find((person) => person.job === "Director");

    let isFavorite = false;
    if (currentUserID) {
      const favCheck = await pool.query(
        "SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2",
        [currentUserID, movieID]
      );
      isFavorite = favCheck.rows.length > 0;
    }

    const reviewsRes = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.movie_id = $1 
       ORDER BY r.created_at DESC`,
      [movieID]
    );

    res.render("movie-details", {
      film: film,
      extra: extra,
      director: director ? director.name : "Неизвестен",
      cast: extra.credits.cast.slice(0, 12),
      isFavorite: isFavorite,
      reviews: reviewsRes.rows,
      trailerKey: trailerKey 
    });
  } catch (err) {
    console.error("Ошибка при загрузке деталей фильма:", err);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/movie/:id/review", async (req, res) => {
  try {
    if (!req.session.user) {
        return res.status(401).send("Чтобы оставить рецензию, нужно войти в аккаунт");
    }

    const movieID = req.params.id;
    const { review_text } = req.body;
    const userID = req.session.user.id;

    if (review_text && review_text.trim() !== "") {
      await pool.query(
        "INSERT INTO reviews (movie_id, user_id, content) VALUES ($1, $2, $3)",
        [movieID, userID, review_text]
      );
    }

    res.redirect(`/movie/${movieID}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка при отправке");
  }
});

router.post("/review/delete/:id", async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.session.user ? req.session.user.id : null;
        const movieId = req.body.movieId;

        if (!userId) return res.status(401).send("Войдите в аккаунт");

        await pool.query(
            "DELETE FROM reviews WHERE id = $1 AND user_id = $2",
            [reviewId, userId]
        );

        if (movieId) {
            res.redirect(`/movie/${movieId}`);
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get("/favourites", async (req, res) => {
  try {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const userID = req.session.user.id;
    const { search, genre, year, country, sort } = req.query;

    let sql = `
            SELECT m.* FROM movies m 
            JOIN favorites f ON m.id = f.movie_id 
            WHERE f.user_id = $1
        `;
    let params = [userID];
    let paramIndex = 2;

    if (search) {
      sql += ` AND m.title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (genre) {
      sql += ` AND m.genres ILIKE $${paramIndex}`;
      params.push(`%${genre}%`);
      paramIndex++;
    }
    if (year) {
      sql += ` AND m.release_date::text LIKE $${paramIndex}`;
      params.push(`${year}%`);
      paramIndex++;
    }
    if (country) {
      sql += ` AND m.country ILIKE $${paramIndex}`;
      params.push(`%${country}%`);
      paramIndex++;
    }

    switch (sort) {
      case "title-asc": sql += ` ORDER BY m.title ASC`; break;
      case "rating-desc": sql += ` ORDER BY m.vote_average DESC`; break;
      case "year-desc": sql += ` ORDER BY m.release_date DESC`; break;
      default: sql += ` ORDER BY f.id DESC`;
    }

    const result = await pool.query(sql, params);

    res.render("favourites", {
      favMovies: result.rows,
      filters: req.query,
    });
  } catch (err) {
    console.error(err);
    res.render("favourites", { favMovies: [], filters: {} });
  }
});

router.post("/movie/:id/favorite", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Авторизуйтесь" });
    }

    const movieId = req.params.id;
    const userId = req.session.user.id;

    const checkFav = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2",
      [userId, movieId]
    );

    if (checkFav.rows.length > 0) {
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2",
        [userId, movieId]
      );
      return res.json({ status: "removed" });
    } else {
      await pool.query(
        "INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2)",
        [userId, movieId]
      );
      return res.json({ status: "added" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;