$("#okayvro").click(function(){
    $("#info").slideToggle();
});

let currentUser = sessionStorage.getItem("currentUser");

function RegisterUser() {
    const Username = document.getElementById("username");  // THIS WAS MISSING
    const UsernameValue = Username.value.trim();

    if (UsernameValue === "") {
        alert("Please enter your username.");
        return;
    }

    registerUser(UsernameValue)
        .then(function(result) {
            sessionStorage.setItem("currentUser", UsernameValue);
            currentUser = UsernameValue;
            alert(result.message + " Welcome, " + UsernameValue);
            window.location.href = "userBook.html";
        })
        .catch(function(error) {
            alert("Registration failed: " + error.message);
        });
}


function loadRoute() {
    const routeList = document.getElementById("routeList");
    if (!routeList) return;

    getAllRoutes()
        .then(function(routes) {
            routeList.innerHTML = "";
            if (routes.length === 0) {
                routeList.innerHTML = "<option>No routes available</option>";
                return;
            }
            routes.forEach(function(route) {
                const option = document.createElement("option");
                option.value = route.id;
                option.textContent = route.title + " - " + route.time + " (" + route.availableSeats + " seats left)";
                routeList.appendChild(option);
            });
        })
        .catch(function(error) {
            console.error("Failed to load routes:", error);
            routeList.innerHTML = "<option>Error loading routes</option>";
        });
}

function bookTicket() {
    currentUser = sessionStorage.getItem("currentUser");

    if (!currentUser) {
        alert("Please Register before booking");
        window.location.href = "userRegistration.html";
        return;
    }

    const routeList = document.getElementById("routeList");
    const selectedRouteId = parseInt(routeList.value);

    if (!selectedRouteId || isNaN(selectedRouteId)) {
        alert("Please select a route");
        return;
    }

    createBooking(currentUser, selectedRouteId)
        .then(function(result) {
            alert("Booking successful! " + result.message);
            loadRoute();
        })
        .catch(function(error) {
            alert("Booking failed: " + error.message);
        });
}

function loaduserSummary() {
    const data = document.getElementById("userSummary");
    currentUser = sessionStorage.getItem("currentUser");

    if (!data) return;

    if (!currentUser) {
        data.innerHTML = "<p>Please register first to view your bookings.</p>";
        return;
    }

    data.innerHTML = "<p>Loading your bookings...</p>";

    getUserBookings(currentUser)
        .then(function(bookings) {
            data.innerHTML = "";
            if (bookings.length === 0) {
                data.innerHTML = "<p>You have no bookings yet.</p>";
                return;
            }
            bookings.forEach(function(booking) {
                data.innerHTML += "<p><b>Booked Route:</b> " + booking.routeTitle + "<br><b>Time:</b> " + booking.routeTime + "<br><b>Booked on:</b> " + new Date(booking.bookedAt).toLocaleString() + "</p><hr>";
            });
        })
        .catch(function(error) {
            console.error("Failed to load bookings:", error);
            data.innerHTML = "<p>Error loading your bookings. Please try again.</p>";
        });
}