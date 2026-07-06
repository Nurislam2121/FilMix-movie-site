const express = require('express');
const router = express.Router();
const pool = require('../../db'); 
const bcrypt = require('bcryptjs');

router.get('/registration', (req, res) => res.render('registration'));
router.get('/login', (req, res) => res.render('login'));

router.post('/registration', async (req, res) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        if (password !== passwordConfirm) {
            req.flash('error', 'Пароли не совпадают');
            return res.redirect('/auth/registration');
        }

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            req.flash('error', 'Пользователь с такой почтой уже существует');
            return res.redirect('/auth/registration');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        req.flash('success', 'Регистрация прошла успешно! Теперь вы можете войти.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Произошла ошибка при регистрации');
        res.redirect('/auth/registration');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            req.flash('error', 'Пользователь с такой почтой не найден');
            return res.redirect('/auth/login');
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            req.flash('error', 'Неверный пароль');
            return res.redirect('/auth/login');
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            isAdmin: user.is_admin 
        };

        res.redirect('/'); 
    } catch (err) {
        console.error(err);
        req.flash('error', 'Ошибка сервера. Попробуйте позже.');
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return console.log(err);
        res.redirect('/'); 
    });
});

module.exports = router;