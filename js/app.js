document.addEventListener("DOMContentLoaded", () => {
  const journeyForm = document.getElementById("journeyForm");
  if (journeyForm) {
    journeyForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = {
        travelId: crypto.randomUUID(),
        vehicleNumber: document.getElementById("vehicleNumber").value,
        vehicleName: document.getElementById("vehicleName").value,
        startPoint: document.getElementById("startPoint").value,
        startKm: document.getElementById("startKm").value,
        startTime: document.getElementById("startTime").value,
        passengerCount: document.getElementById("passengerCount").value,
        passengerName: document.getElementById("passengerName").value,
        passengerPhone: document.getElementById("passengerPhone").value,
        date: new Date().toLocaleDateString(),
      };

      fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.text())
      .then(data => {
        alert("Journey Started!");
        journeyForm.reset();
      })
      .catch(error => console.error("Error!", error));
    });
  }
});
