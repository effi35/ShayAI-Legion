function generateReport(agentResult) {
    const reportHtml = `
    <html>
    <head>
        <title>דו"ח סוכן ${agentResult.agentId}</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #4CAF50; }
            p { margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>דו"ח סוכן - ${agentResult.agentId}</h1>
        <p><strong>סטטוס:</strong> ${agentResult.status}</p>
        <p><strong>תוצאה:</strong> ${agentResult.output || agentResult.error}</p>
        <p><strong>תאריך:</strong> ${new Date(agentResult.timestamp).toLocaleString()}</p>
    </body>
    </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${agentResult.agentId}_${Date.now()}.html`;
    a.click();

    URL.revokeObjectURL(url);
}
