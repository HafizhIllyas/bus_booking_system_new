var API_BASE_URL = 'https://bus-booking-system-0hap.onrender.com';

function createRoute() {
    const title = document.getElementById("routeTitle").value.trim();
    const description = document.getElementById("routeDescription").value.trim();
    const time = document.getElementById("routeTime").value;
    const maxSeats = parseInt(document.getElementById("maxSeats").value);

    if (title === "" || description === "" || time === "" || isNaN(maxSeats) || maxSeats <= 0) {
        alert("Please fill in all fields correctly.");
        return;
    }

    fetch(API_BASE_URL + '/api/routes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            description: description,
            time: time,
            maxSeats: maxSeats
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            alert("Route created successfully!");
            document.getElementById("routeTitle").value = "";
            document.getElementById("routeDescription").value = "";
            document.getElementById("routeTime").value = "";
            document.getElementById("maxSeats").value = "40";
            displayExistingRoutes();
        } else {
            alert("Failed to create route: " + data.error);
        }
    })
    .catch(function(error) {
        alert("Failed to create route: " + error.message);
    });
}

function displayExistingRoutes() {
    const container = document.getElementById("existingRoutes");
    if (!container) return;

    container.innerHTML = "<p>Loading routes...</p>";

    fetch(API_BASE_URL + '/api/routes')
        .then(function(response) {
            return response.json();
        })
        .then(function(routes) {
            if (routes.length === 0) {
                container.innerHTML = "<p>No routes created yet.</p>";
                return;
            }

            let html = "<table style='margin: 0 auto; border-collapse: collapse; width: 80%;'>";
            html += "<tr style='background-color: #f0f0f0;'>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Route Title</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Description</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Time</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Max Seats</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Booked</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Available</th>";
            html += "<th style='border: 1px solid black; padding: 10px;'>Action</th>";
            html += "</tr>";

            routes.forEach(function(route) {
                html += "<tr>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + route.title + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + (route.description || 'N/A') + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + route.time + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + (route.maxSeats || 'N/A') + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + route.bookingsCount + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'>" + route.availableSeats + "</td>";
                html += "<td style='border: 1px solid black; padding: 8px;'><button onclick='deleteRoute(" + route.id + ")' style='width: auto; padding: 5px 10px;'>Delete</button></td>";
                html += "</tr>";
            });

            html += "</table>";
            container.innerHTML = html;
        })
        .catch(function(error) {
            console.error("Failed to load routes:", error);
            container.innerHTML = "<p>Error loading routes.</p>";
        });
}

function deleteRoute(routeId) {
    if (!confirm("Are you sure you want to delete this route?")) {
        return;
    }

    fetch(API_BASE_URL + '/api/routes/' + routeId, {
        method: 'DELETE'
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        alert("Route deleted successfully!");
        displayExistingRoutes();
    })
    .catch(function(error) {
        alert("Failed to delete route: " + error.message);
    });
}

function loadReports() {
    getStatistics()
        .then(function(stats) {
            generateBookingChart(stats.statistics);
            displayMostPopularRoute(stats.mostPopularRoutes);
            displayDetailedInfo(stats.statistics);
        })
        .catch(function(error) {
            console.error("Failed to load reports:", error);
        });
}

function generateBookingChart(statistics) {
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;

    const labels = statistics.map(function(stat) { return stat.routeTitle; });
    const data = statistics.map(function(stat) { return stat.totalBookings; });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Bookings',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function displayMostPopularRoute(popularRoutes) {
    const container = document.getElementById("popularRoute");
    if (!container) return;

    if (popularRoutes.length === 0) {
        container.innerHTML = "<p style='color: gray;'>No bookings yet.</p>";
        return;
    }

    if (popularRoutes.length === 1) {
        const route = popularRoutes[0];
        container.innerHTML = "<div style='background-color: #ffffcc; padding: 20px; border-radius: 10px; border: 3px solid #ffd700;'>" +
            "<p style='font-size: 24px; margin: 0;'><b>🏆 " + route.routeTitle + "</b></p>" +
            "<p style='margin: 5px 0;'>Time: " + route.routeTime + "</p>" +
            "<p style='margin: 5px 0; color: green; font-weight: bold;'>" + route.totalBookings + " bookings</p>" +
            "</div>";
    }
}

function displayDetailedInfo(statistics) {
    const container = document.getElementById("detailedInfo");
    if (!container) return;

    let html = "";
    statistics.forEach(function(stat) {
        html += "<div style='background-color: white; padding: 20px; margin: 20px; border-radius: 10px; border-left: 5px solid blue;'>";
        html += "<h3 style='color: blue; margin-top: 0;'>" + stat.routeTitle + "</h3>";
        html += "<p><b>Time:</b> " + stat.routeTime + "</p>";
        html += "<p><b>Maximum Seats:</b> " + stat.maxSeats + "</p>";
        html += "<p><b>Total Bookings:</b> " + stat.totalBookings + "</p>";
        html += "<p><b>Available Seats:</b> " + stat.availableSeats + "</p>";

        if (stat.bookedUsers.length > 0) {
            html += "<p><b>Booked by:</b></p><ul style='text-align: left; max-width: 400px; margin: 0 auto;'>";
            stat.bookedUsers.forEach(function(user) {
                html += "<li>" + user + "</li>";
            });
            html += "</ul>";
        } else {
            html += "<p style='color: gray;'><i>No bookings yet</i></p>";
        }
        html += "</div>";
    });
    container.innerHTML = html;
}

if (document.getElementById("existingRoutes")) {
    displayExistingRoutes();
}