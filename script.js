
// MOBILE NAVIGATION
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
});

document.querySelectorAll("#navLinks a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("show");
    });
});

// RESERVATION SYSTEM
const seats = ["A1", "A2", "A3", "A4",
               "B1", "B2", "B3", "B4"];

const seatContainer = document.getElementById("seatContainer");
const seatNumber = document.getElementById("seatNumber");
const reservationDate = document.getElementById("reservationDate");
const reservationTime = document.getElementById("reservationTime");
const reservationForm = document.getElementById("reservationForm");
const confirmation = document.getElementById("confirmation");
const reservationList = document.getElementById("reservationList");
const seatMessage = document.getElementById("seatMessage");

let selectedSeat = "";

// LOCAL STORAGE
function getReservations() {
    return JSON.parse(localStorage.getItem("coffeeReservations")) || [];
}

function saveReservations(data) {
    localStorage.setItem("coffeeReservations", JSON.stringify(data));
}

// SET MINIMUM DATE TO TODAY
const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

reservationDate.min = localToday;

// CHECK SEAT AVAILABILITY
function isSeatReserved(seat) {
    if (!reservationDate.value || !reservationTime.value) {
        return false;
    }

    return getReservations().some(item =>
        item.seat === seat &&
        item.date === reservationDate.value &&
        item.time === reservationTime.value
    );
}

// DISPLAY SEATS
function displaySeats() {
    seatContainer.innerHTML = "";

    seats.forEach(seat => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "seat";
        button.textContent = seat;

        const reserved = isSeatReserved(seat);

        if (reserved) {
            button.disabled = true;
        }

        if (selectedSeat === seat) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            selectedSeat = seat;
            seatNumber.value = seat;
            seatMessage.textContent = `Seat ${seat} selected.`;
            displaySeats();
        });

        seatContainer.appendChild(button);
    });

    if (selectedSeat && isSeatReserved(selectedSeat)) {
        selectedSeat = "";
        seatNumber.value = "";
        seatMessage.textContent = "Your selected seat is no longer available.";
    }
}

// UPDATE SEATS WHEN DATE OR TIME CHANGES
reservationDate.addEventListener("change", () => {
    selectedSeat = "";
    seatNumber.value = "";
    displaySeats();
});

reservationTime.addEventListener("change", () => {
    selectedSeat = "";
    seatNumber.value = "";
    displaySeats();
});

// SUBMIT RESERVATION
reservationForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const date = reservationDate.value;
    const time = reservationTime.value;

    if (!selectedSeat || !date || !time || !name || !email) {
        alert("Please complete all fields and select a seat.");
        return;
    }

    if (date < localToday) {
        alert("Please choose today or a future date.");
        return;
    }

    if (isSeatReserved(selectedSeat)) {
        alert("This seat is already reserved. Please select another.");
        selectedSeat = "";
        seatNumber.value = "";
        displaySeats();
        return;
    }

    // BACKEND PROCESS SIMULATION
    const reservation = {
        id: Date.now(),
        name: name,
        email: email,
        seat: selectedSeat,
        date: date,
        time: time
    };

    const reservations = getReservations();
    reservations.push(reservation);
    saveReservations(reservations);

    // CONFIRMATION
    confirmation.hidden = false;
    confirmation.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "✓ Reservation Confirmed!";

    const details = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Seat: ${selectedSeat}`,
        `Date: ${date}`,
        `Time: ${time}`
    ];

    confirmation.appendChild(heading);

    details.forEach(detail => {
        const p = document.createElement("p");
        p.textContent = detail;
        confirmation.appendChild(p);
    });

    reservationForm.reset();
    selectedSeat = "";
    seatNumber.value = "";

    displaySeats();
    displayReservations();

    seatMessage.textContent = "Please select an available seat.";
});

// DISPLAY SAVED RESERVATIONS
function displayReservations() {
    reservationList.innerHTML = "";

    const reservations = getReservations();

    if (reservations.length === 0) {
        reservationList.textContent = "No reservations yet.";
        return;
    }

    reservations.forEach(item => {
        const card = document.createElement("div");
        card.className = "reservation-item";

        const heading = document.createElement("h3");
        heading.textContent = `Reservation - ${item.seat}`;

        const details = [
            `Customer: ${item.name}`,
            `Email: ${item.email}`,
            `Date: ${item.date}`,
            `Time: ${item.time}`
        ];

        card.appendChild(heading);

        details.forEach(detail => {
            const p = document.createElement("p");
            p.textContent = detail;
            card.appendChild(p);
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "cancel-btn";
        cancelBtn.textContent = "Cancel Reservation";

        cancelBtn.addEventListener("click", () => {
            if (!confirm("Are you sure you want to cancel this reservation?")) {
                return;
            }

            const updated = getReservations().filter(
                reservation => reservation.id !== item.id
            );

            saveReservations(updated);
            displayReservations();
            displaySeats();

            seatMessage.textContent = "Reservation cancelled successfully.";
        });

        card.appendChild(cancelBtn);
        reservationList.appendChild(card);
    });
}

// INITIAL DISPLAY
displaySeats();
displayReservations();
