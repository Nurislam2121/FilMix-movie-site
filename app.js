const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

app.use(session({
    secret: 'filmix-skey', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.currentPath = req.path;
    res.locals.error = req.flash('error'); 
    res.locals.success = req.flash('success');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(express.static(path.join(__dirname, 'static')));

const isAdmin = (req, res, next) => {
    console.log("ДАННЫЕ ИЗ СЕССИИ:", req.session.user);
    if (req.session.user && req.session.user.isAdmin === true) {
        return next();
    }
    req.flash('error', 'У вас нет прав доступа к админ-панели');
    res.redirect('/');
};


const authRouter = require('./app/routes/auth');
const indexRoutes = require('./app/routes/index');
const adminRoutes = require('./app/routes/admin');

app.use('/auth', authRouter);
app.use('/', indexRoutes);

app.use('/admin', isAdmin, adminRoutes); 

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер Filmix: http://localhost:${PORT}`);
});