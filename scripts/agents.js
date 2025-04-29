function runAgentNow(agentId) {
  fetch(`/run-agent-now/${agentId}`, {
      method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
      alert(`סוכן הופעל: ${data.message}`);
      location.reload(); // מרענן לראות סטטוס חדש
  })
  .catch(error => {
      console.error('Error:', error);
      alert('שגיאה בהפעלת הסוכן');
  });
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function logToConsole(message) {
    const consoleDiv = document.getElementById("consoleLogs");
    const logEntry = document.createElement("div");
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    consoleDiv.appendChild(logEntry);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}
