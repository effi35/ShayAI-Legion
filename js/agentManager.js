// משתנים גלובליים
let agentConfig = {};
let agentRunning = false;

// האזנה ללחיצות
document.getElementById('startAgentBtn').addEventListener('click', startAgent);
document.getElementById('testAgentBtn').addEventListener('click', testAgent);

// פונקציה להתחלת הסוכן
function startAgent() {
  const isAdvanced = document.getElementById('advancedModeCheckbox').checked;

  agentConfig = {
    type: isAdvanced ? "advanced" : "basic",
    createdAt: new Date().toISOString(),
    settings: generateAgentSettings(isAdvanced),
  };

  agentRunning = true;
  updateStatus("Agent started successfully.");

  saveAgentConfig(agentConfig);
  sendResultByEmail(agentConfig);

  pingAgent();
}

// פונקציה לבדוק שהסוכן באמת רץ
function testAgent() {
  if (agentRunning) {
    updateStatus("Agent is running correctly!");
  } else {
    updateStatus("Agent is not running.");
  }
}

// מחולל הגדרות אוטומטי
function generateAgentSettings(isAdvanced) {
  if (isAdvanced) {
    return {
      autoRetry: true,
      errorCorrection: true,
      smartScheduling: true,
      backupAgent: true,
      maxTasks: 500,
      pingInterval: 30000, // 30 שניות
    };
  } else {
    return {
      autoRetry: false,
      errorCorrection: false,
      smartScheduling: false,
      backupAgent: false,
      maxTasks: 50,
      pingInterval: 60000, // דקה
    };
  }
}

// עדכון סטטוס במסך
function updateStatus(message) {
  document.getElementById('statusArea').innerText = message;
}

// שמירת ההגדרות לקובץ JSON
function saveAgentConfig(config) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "agent_config.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// שליחת תוצאה למייל
function sendResultByEmail(config) {
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: 'default_service',
      template_id: 'template_default',
      user_id: 'user_default',
      template_params: {
        smtp_server: "smtp.gmail.com",
        smtp_port: 587,
        sender_email: "aifi.trader.bot@gmail.com",
        sender_password: "vfdj yedl gmnn zexj",
        recipient_email: "effi35@gmail.com",
        subject: "New Agent Configuration",
        message: JSON.stringify(config, null, 2)
      }
    })
  })
  .then(response => updateStatus("Agent configuration sent by email."))
  .catch(error => updateStatus("Failed to send email: " + error));
}

// פינגים לבדוק שהסוכן חי
function pingAgent() {
  if (!agentRunning) return;

  setInterval(() => {
    fetch('https://your-server.com/ping', {  // כאן שים כתובת אמיתית שלך
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: "agent123",
        timestamp: new Date().toISOString()
      })
    })
    .then(response => {
      if (response.ok) {
        console.log("Ping successful.");
      } else {
        console.error("Ping failed.");
      }
    })
    .catch(error => console.error("Ping error:", error));
  }, agentConfig.settings.pingInterval);
}

let agentRunning = false;
let agentConfig = {
  type: 'simple',
  settings: {
    pingInterval: 5000 // כל 5 שניות
  }
};

document.getElementById('advancedModeCheckbox').addEventListener('change', function() {
  agentConfig.type = this.checked ? 'advanced' : 'simple';
});

document.getElementById('startAgentBtn').addEventListener('click', function() {
  agentRunning = true;
  document.getElementById('statusArea').textContent = "Agent is running.";
  sendStatusEmail("Agent started successfully.");
  pingAgent();
});

document.getElementById('testAgentBtn').addEventListener('click', function() {
  if (agentRunning) {
    document.getElementById('statusArea').textContent = "Agent test successful.";
    sendStatusEmail("Agent tested successfully.");
  } else {
    document.getElementById('statusArea').textContent = "Agent is not running.";
    sendStatusEmail("Agent test failed - agent not running.");
  }
});

function pingAgent() {
  setInterval(() => {
    if (!agentRunning) return;

    fetch('https://webhook.site/your-temp-api-url', {  // זמני - תחליף אחר כך
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: "agent123",
        timestamp: new Date().toISOString()
      })
    })
    .then(response => {
      if (response.ok) {
        console.log("Ping successful.");
      } else {
        console.error("Ping failed.");
        agentRunning = false;
        document.getElementById('statusArea').textContent = "Agent stopped (Ping failed).";
        sendStatusEmail("Agent stopped due to failed ping.");
      }
    })
    .catch(error => {
      console.error("Ping error:", error);
      agentRunning = false;
      document.getElementById('statusArea').textContent = "Agent stopped (Ping error).";
      sendStatusEmail("Agent stopped due to ping error.");
    });
  }, agentConfig.settings.pingInterval);
}

function sendStatusEmail(message) {
  fetch('/send-email', {  // חשוב - ניצור גם API צד שרת קטן לטפל בזה
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: "Agent Status Update",
      body: message
    })
  })
  .then(response => response.json())
  .then(data => console.log('Email sent successfully:', data))
  .catch(error => console.error('Error sending email:', error));
}
