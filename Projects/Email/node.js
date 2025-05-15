document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    
    fetch(this.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        alert("Message sent successfully!");
        this.reset();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to send message.");
    });
});