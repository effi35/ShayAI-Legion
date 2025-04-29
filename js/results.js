document.addEventListener("DOMContentLoaded", function() {
    fetch('/get-all-results')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('resultsTable').querySelector('tbody');

        data.forEach(result => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${result.agentId}</td>
                <td>${result.status}</td>
                <td>${result.output || result.error}</td>
                <td>${new Date(result.timestamp).toLocaleString()}</td>
            `;

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading results:', error);
    });
});
