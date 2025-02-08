// ฟังก์ชัน JavaScript ที่เกี่ยวข้อง
const appointmentTemplate = {
    id: "",
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "confirmed",
};

// สร้างนัดหมายใหม่
function createAppointment(appointmentData) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    // ตรวจสอบความซ้ำซ้อนของเวลา
    const isConflict = appointments.some(app =>
        app.status === "confirmed" &&
        app.date === appointmentData.date &&
        ((appointmentData.startTime >= app.startTime && appointmentData.startTime < app.endTime) ||
            (appointmentData.endTime > app.startTime && appointmentData.endTime <= app.endTime))
    );

    // ถ้าซ้ำ ให้เพิ่ม property `isConflict: true`
    appointmentData.isConflict = isConflict;

    // บันทึกลง Local Storage
    appointments.push(appointmentData);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    // อัปเดตการแสดงผล
    displayAppointments();
}

// ฟังก์ชันยกเลิกนัดหมาย
function cancelAppointment(appointmentId) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    // ค้นหาและอัปเดตสถานะของนัดหมาย
    appointments = appointments.map(app => {
        if (app.id === appointmentId) {
            return { ...app, status: "cancelled" };
        }
        return app;
    });

    // บันทึกลง Local Storage
    localStorage.setItem("appointments", JSON.stringify(appointments));

    // อัปเดตการแสดงผล
    displayAppointments();
}

// ดึงและแสดงผลนัดหมาย
function displayAppointments() {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    const appointmentsList = document.getElementById("appointmentsList");
    appointmentsList.innerHTML = ""; // ล้างเนื้อหาเดิม

    // เรียงนัดหมายจากใหม่ไปเก่าตาม ID และยกเลิกให้ไปอยู่ล่างสุด
    appointments.sort((a, b) => {
        if (a.status === "cancelled" && b.status !== "cancelled") {
            return 1; // ให้ยกเลิกอยู่ข้างล่างสุด
        }
        if (a.status !== "cancelled" && b.status === "cancelled") {
            return -1; // ให้สถานะอื่นๆ อยู่ข้างบน
        }
        return b.id - a.id; // ให้ไอดีล่าสุดอยู่ข้างบนสุด
    });

    appointments.forEach(app => {
        const appointmentDiv = document.createElement("div");
        appointmentDiv.classList.add("appointment");

        // ถ้าซ้ำซ้อน ให้เพิ่มคลาสหรือสีพิเศษ
        if (app.isConflict) {
            appointmentDiv.classList.add("conflict");
        }
        if (app.status === "cancelled") {
            appointmentDiv.classList.add("cancelled");
        }

        // แสดงผลรายการนัดหมาย
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

// จัดการการส่งฟอร์ม
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

    // ล้างฟอร์มหลังจากเพิ่ม
    this.reset();
});

// แสดงผลนัดหมายตอนโหลดหน้า
displayAppointments();
