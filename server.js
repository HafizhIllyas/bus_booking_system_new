const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port for Render

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
	
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());
app.use(express.json());

// Only use static serving if you deploy frontend with backend
// const publicPath = path.join(__dirname, 'public');
// app.use(express.static(publicPath));

const DATA_DIR = path.join(__dirname, 'data');
const ROUTES_FILE = path.join(DATA_DIR, 'routes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Initialize JSON files if missing
function initializeDataFiles() {
    if (!fs.existsSync(ROUTES_FILE)) {
        const defaultRoutes = [
            { id: 1, title: "Route 1", description: "Ipoh to KL", time: "10:30", maxSeats: 40, createdAt: new Date().toISOString() },
            { id: 2, title: "Route 2", description: "Ipoh to Penang", time: "12:30", maxSeats: 40, createdAt: new Date().toISOString() },
            { id: 3, title: "Route 3", description: "Ipoh to JB", time: "16:30", maxSeats: 40, createdAt: new Date().toISOString() }
        ];
        fs.writeFileSync(ROUTES_FILE, JSON.stringify(defaultRoutes, null, 2));
    }
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}

// Helper functions
function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        return [];
    }
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Routes
app.post('/api/users/register', (req, res) => {
    const { username } = req.body;
    if (!username || username.trim() === '') return res.status(400).json({ error: 'Username is required' });

    const users = readJSON(USERS_FILE);
    const existingUser = users.find(u => u.username === username.trim());
    if (existingUser) return res.json({ success: true, message: 'User already exists', user: existingUser });

    const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username: username.trim(),
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    res.json({ success: true, message: 'Registration successful', user: newUser });
});

app.get('/api/routes', (req, res) => {
    const routes = readJSON(ROUTES_FILE);
    const bookings = readJSON(BOOKINGS_FILE);
    const routesWithBookings = routes.map(route => {
        const routeBookings = bookings.filter(b => b.routeId === route.id);
        return {
            ...route,
            bookingsCount: routeBookings.length,
            bookedUsers: routeBookings.map(b => b.username),
            availableSeats: route.maxSeats - routeBookings.length
        };
    });
    res.json(routesWithBookings);
});

app.post('/api/routes', (req, res) => {
    const { title, description, time, maxSeats } = req.body;
    if (!title || !time || !maxSeats) return res.status(400).json({ error: 'All fields are required' });

    const routes = readJSON(ROUTES_FILE);
    const newRoute = {
        id: routes.length ? Math.max(...routes.map(r => r.id)) + 1 : 1,
        title: title.trim(),
        description: description ? description.trim() : '',
        time: time,
        maxSeats: parseInt(maxSeats),
        createdAt: new Date().toISOString()
    };
    routes.push(newRoute);
    writeJSON(ROUTES_FILE, routes);
    res.status(201).json({ success: true, message: 'Route created successfully', route: newRoute });
});

app.delete('/api/routes/:id', (req, res) => {
    const routes = readJSON(ROUTES_FILE);
    const routeId = parseInt(req.params.id);
    const routeIndex = routes.findIndex(r => r.id === routeId);
    if (routeIndex === -1) return res.status(404).json({ error: 'Route not found' });

    let bookings = readJSON(BOOKINGS_FILE);
    bookings = bookings.filter(b => b.routeId !== routeId);
    writeJSON(BOOKINGS_FILE, bookings);

    routes.splice(routeIndex, 1);
    writeJSON(ROUTES_FILE, routes);
    res.json({ success: true, message: 'Route deleted successfully' });
});

app.post('/api/bookings', (req, res) => {
    const { username, routeId } = req.body;
    if (!username || !routeId) return res.status(400).json({ error: 'Username and route ID are required' });

    const routes = readJSON(ROUTES_FILE);
    const route = routes.find(r => r.id === parseInt(routeId));
    if (!route) return res.status(404).json({ error: 'Route not found' });

    const bookings = readJSON(BOOKINGS_FILE);
    const existingBooking = bookings.find(b => b.username === username.trim() && b.routeId === parseInt(routeId));
    if (existingBooking) return res.status(400).json({ error: 'You have already booked this route' });

    const routeBookings = bookings.filter(b => b.routeId === parseInt(routeId));
    if (routeBookings.length >= route.maxSeats) return res.status(400).json({ error: 'This route is fully booked' });

    const newBooking = {
        id: bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
        username: username.trim(),
        routeId: parseInt(routeId),
        routeTitle: route.title,
        routeTime: route.time,
        bookedAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    writeJSON(BOOKINGS_FILE, bookings);
    res.status(201).json({ success: true, message: 'Booking successful', booking: newBooking });
});

app.get('/api/bookings/user/:username', (req, res) => {
    const bookings = readJSON(BOOKINGS_FILE);
    const userBookings = bookings.filter(b => b.username === req.params.username);
    res.json(userBookings);
});

app.get('/api/reports/statistics', (req, res) => {
    const routes = readJSON(ROUTES_FILE);
    const bookings = readJSON(BOOKINGS_FILE);
    const statistics = routes.map(route => {
        const routeBookings = bookings.filter(b => b.routeId === route.id);
        return {
            routeId: route.id,
            routeTitle: route.title,
            routeTime: route.time,
            maxSeats: route.maxSeats,
            totalBookings: routeBookings.length,
            availableSeats: route.maxSeats - routeBookings.length,
            bookedUsers: routeBookings.map(b => b.username)
        };
    });
    const maxBookings = Math.max(...statistics.map(s => s.totalBookings), 0);
    const mostPopular = statistics.filter(s => s.totalBookings === maxBookings && maxBookings > 0);
    res.json({ statistics, mostPopularRoutes: mostPopular, totalRoutes: routes.length, totalBookings: bookings.length });
});

// Initialize files and start server
initializeDataFiles();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
