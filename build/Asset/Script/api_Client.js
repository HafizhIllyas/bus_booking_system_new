var API_BASE_URL = 'https://bus-booking-system-0hap.onrender.com';

function registerUser(username) {
    return fetch(API_BASE_URL + '/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) { 
        if (data.error) throw new Error(data.error); 
        return data; 
    });
}

function getAllRoutes() {
    return fetch(API_BASE_URL + '/api/routes')
        .then(function(res) { return res.json(); });
}

function createRoute(routeData) {
    return fetch(API_BASE_URL + '/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) { 
        if (data.error) throw new Error(data.error); 
        return data; 
    });
}

function deleteRoute(routeId) {
    return fetch(API_BASE_URL + '/api/routes/' + routeId, { 
        method: 'DELETE' 
    })
    .then(function(res) { return res.json(); });
}

function createBooking(username, routeId) {
    return fetch(API_BASE_URL + '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, routeId: routeId })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) { 
        if (data.error) throw new Error(data.error); 
        return data; 
    });
}

function getUserBookings(username) {
    return fetch(API_BASE_URL + '/api/bookings/user/' + username)
        .then(function(res) { return res.json(); });
}

function getStatistics() {
    return fetch(API_BASE_URL + '/api/reports/statistics')
        .then(function(res) { return res.json(); });
}