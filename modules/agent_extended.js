// modules/agent_extended.js

// פונקציה לשלוח מייל עם התוצאה
async function sendEmail(subject, body) {
    const emailData = {
        smtp_server: "smtp.gmail.com",
        smtp_port: 587,
        sender_email: "aifi.trader.bot@gmail.com",
        sender_password: "vfdj yedl gmnn zexj",
        recipient_email: "effi35@gmail.com",
        subject: subject,
        body: body
    };

    try {
        const response = await fetch('/send_email_api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        if (!response.ok) throw new Error('Failed to send email');
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

// פונקציה לשמירת תוצאה לקובץ JSON
function saveAgentResult(resultData) {
    fetch('/save_result_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
    }).then(response => {
        if (!response.ok) throw new Error('Saving result failed');
        console.log('Result saved successfully');
    }).catch(error => {
        console.error('Saving result failed:', error);
    });
}

// הפעלת הסוכן
async function launchAgent(agentSettings) {
    try {
        // הדמיית בדיקה אם הסוכן זז (פינג כל 10 שניות)
        const pingInterval = setInterval(() => {
            console.log('Pinging agent...');
        }, 10000);

        // שלב 1: יצירת קונפיגורציה
        console.log('Creating agent with settings:', agentSettings);

        // שלב 2: קריאה אמיתית לשרת/API חיצוני
        const response = await fetch('/create_agent_api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentSettings)
        });

        if (!response.ok) throw new Error('Agent creation failed');
        
        const result = await response.json();
        clearInterval(pingInterval);

        // שלב 3: שמירת תוצאה
        saveAgentResult(result);

        // שלב 4: שליחת מייל
        await sendEmail('Agent Created Successfully', JSON.stringify(result));

        alert('סוכן נוצר בהצלחה ונשלח מייל!');

    } catch (error) {
        console.error('Agent launching failed:', error);
        alert('שגיאה בהפעלת הסוכן: ' + error.message);
    }
}

const fs = require('fs');
const path = require('path');

// פונקציה להפעיל סוכן לפי הגדרות
function runAgent(agentSettings) {
  console.log('Running Agent with settings:', agentSettings);

  // סימולציה - פה תוכל להחליף בשאילתות אמיתיות, קריאות API וכו'
  const result = {
    tasks: [],
    success: true,
    startedAt: new Date(),
    finishedAt: new Date()
  };

  agentSettings.tasks.forEach(task => {
    result.tasks.push({
      task: task.name,
      status: 'completed',
      description: `Task "${task.name}" executed successfully!`
    });
  });

  return result;
}

// פונקציה לשמור תוצאה לקובץ
function saveResult(agentId, result) {
  const resultsFolder = path.join(__dirname, '..', 'agents', 'results');
  
  // אם אין תיקיית תוצאות - תיצור
  if (!fs.existsSync(resultsFolder)) {
    fs.mkdirSync(resultsFolder, { recursive: true });
  }

  const filePath = path.join(resultsFolder, `${agentId}_result.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
}

module.exports = {
  runAgent,
  saveResult
};
