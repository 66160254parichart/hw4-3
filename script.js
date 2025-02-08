const appointmentTemplate = {
    id: "",
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "confirmed",
};


function createAppointment(appointmentData) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    
    const isConflict = appointments.some(app =>
        app.status === "confirmed" &&
        app.date === appointmentData.date &&
        ((appointmentData.startTime >= app.startTime && appointmentData.startTime < app.endTime) ||
            (appointmentData.endTime > app.startTime && appointmentData.endTime <= app.endTime))
    );

   
    appointmentData.isConflict = isConflict;

    
    appointments.push(appointmentData);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    
    displayAppointments();
}


function cancelAppointment(appointmentId) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    
    appointments = appointments.map(app => {
        if (app.id === appointmentId) {
            return { ...app, status: "cancelled" };
        }
        return app;
    });

    
    localStorage.setItem("appointments", JSON.stringify(appointments));

    
    displayAppointments();
}


function displayAppointments() {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    const appointmentsList = document.getElementById("appointmentsList");
    appointmentsList.innerHTML = ""; 

    
    const today = new Date().toISOString().split("T")[0];

    
    appointments = appointments.filter(app => app.date >= today);

    
    appointments.sort((a, b) => {
        if (a.status === "cancelled" && b.status !== "cancelled") {
            return 1; 
        }
        if (a.status !== "cancelled" && b.status === "cancelled") {
            return -1; 
        }
        return b.id - a.id; 
    });

    appointments.forEach(app => {
        const appointmentDiv = document.createElement("div");
        appointmentDiv.classList.add("appointment");

        
        if (app.isConflict) {
            appointmentDiv.classList.add("conflict");
        }
        if (app.status === "cancelled") {
            appointmentDiv.classList.add("cancelled");
        }

       
        appointmentDiv.innerHTML = `
            <strong>${app.title}</strong><br>
            วันที่: ${app.date}<br>
            เวลา: ${app.startTime} - ${app.endTime}<br>
            สถานะ: ${app.status} ${app.isConflict ? "⚠️" : ""}<br>
            ${
                app.status === "confirmed"
                    ? `<button onclick="cancelAppointment('${app.id}')">ยกเลิก</button>`
                    : ""
            }
        `;
        appointmentsList.appendChild(appointmentDiv);
    });
}


document.getElementById("appointmentForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    const newAppointment = {
        id: Date.now().toString(),
        title,
        date,
        startTime,
        endTime,
        status: "confirmed",
    };

    createAppointment(newAppointment);

    
    this.reset();
});


displayAppointments();
