const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const AgentMonitor = require('./modules/agent_monitor');
const activeMonitors = {};

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Load agent config
const agentConfigPath = path.join(__dirname, 'config', 'agent_config.json');
let agentConfig = require(agentConfigPath);

function startMonitorsForAgents() {
  const agentsDataPath = path.join(__dirname, 'config', 'agent_config.json');
  const agents = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

  agents.forEach(agent => {
      if (!activeMonitors[agent.id]) {
          const monitor = new AgentMonitor(agent.id);
          monitor.startMonitoring();
          activeMonitors[agent.id] = monitor;
          console.log(`Started monitor for agent ${agent.name}`);
      }
  });
}

// להריץ כשהשרת עולה
startMonitorsForAgents();

// API לשליחת מייל
app.post('/send-email', async (req, res) => {
  const { subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aifi.trader.bot@gmail.com',
        pass: 'vfdj yedl gmnn zexj'
      }
    });

    await transporter.sendMail({
      from: '"AI Agent" <aifi.trader.bot@gmail.com>',
      to: 'effi35@gmail.com',
      subject: subject,
      text: text
    });

    res.json({ status: 'Email sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ status: 'Failed to send email', error: error.message });
  }
});

// API ליצירת סוכן
app.post('/create-agent', (req, res) => {
  const { mode } = req.body;
  let agentSettings = {};

  if (mode === 'simple') {
    agentSettings = agentConfig.default_agent;
  } else if (mode === 'extended') {
    agentSettings = agentConfig.advanced_agent;
  } else {
    return res.status(400).json({ status: 'Invalid agent mode!' });
  }

  const agentResult = {
    agent_id: `agent_${Date.now()}`,
    config: agentSettings,
    status: 'created',
    created_at: new Date()
  };

  // Save agent file
  const savePath = path.join(__dirname, 'agents', `${agentResult.agent_id}.json`);
  fs.writeFileSync(savePath, JSON.stringify(agentResult, null, 2));

  res.json({ status: 'Agent created', agent: agentResult });
});

// API לבדוק פינג
app.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// קריאת כל הסוכנים
app.get('/api/agents', (req, res) => {
  try {
      const agentsData = fs.readFileSync(path.join(__dirname, 'config', 'agent_config.json'), 'utf8');
      const agents = JSON.parse(agentsData);
      res.json(agents);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error reading agents' });
  }
});

// מחיקת סוכן לפי ID
app.delete('/api/agents/:id', (req, res) => {
  try {
      const agentId = req.params.id;
      const agentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'agent_config.json'), 'utf8'));
      const updatedAgents = agentsData.filter(agent => agent.id !== agentId);

      fs.writeFileSync(path.join(__dirname, 'config', 'agent_config.json'), JSON.stringify(updatedAgents, null, 2));
      res.status(200).send('Agent deleted.');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting agent.');
  }
});

// שליחת תוצאה במייל לפי ID
app.post('/api/agents/:id/send', (req, res) => {
  try {
      const agentId = req.params.id;
      const agentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'agent_config.json'), 'utf8'));
      const agent = agentsData.find(a => a.id === agentId);

      if (!agent) {
          return res.status(404).send('Agent not found');
      }

      // קריאת תוצאת הסוכן מהתיקייה
      const resultPath = path.join(__dirname, 'agents', 'results', `${agentId}.json`);
      if (!fs.existsSync(resultPath)) {
          return res.status(404).send('Result not found');
      }

      const resultContent = fs.readFileSync(resultPath, 'utf8');

      // שליחת מייל
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
              user: 'aifi.trader.bot@gmail.com',
              pass: 'vfdj yedl gmnn zexj'
          }
      });

      const mailOptions = {
          from: 'aifi.trader.bot@gmail.com',
          to: 'effi35@gmail.com',
          subject: `Agent ${agent.name} Result`,
          text: resultContent
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error(error);
              return res.status(500).send('Failed to send email.');
          }
          console.log('Email sent: ' + info.response);
          res.status(200).send('Email sent successfully.');
      });

  } catch (error) {
      console.error(error);
      res.status(500).send('Error sending result.');
  }
});

app.post('/run-agent-now/:id', (req, res) => {
  const agentId = req.params.id;
  const agentPath = path.join(__dirname, 'config', 'agent_config.json');
  const agents = JSON.parse(fs.readFileSync(agentPath, 'utf8'));

  const agent = agents.find(a => a.id === agentId);

  if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
  }

  // מעדכן סטטוס לריצה
  agent.status = 'Running';
  fs.writeFileSync(agentPath, JSON.stringify(agents, null, 2));

  // סימולציה של ריצה
  setTimeout(() => {
      const success = Math.random() > 0.2; // 80% הצלחה דמה
      agent.status = success ? 'Success' : 'Failed';

      const resultPath = path.join(__dirname, 'agents', 'results', `${agent.id}.json`);
      const resultData = {
          agentId: agent.id,
          status: agent.status,
          data: success ? "המשימה בוצעה בהצלחה!" : "המשימה נכשלה.",
          timestamp: new Date().toISOString()
      };
      fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));

      fs.writeFileSync(agentPath, JSON.stringify(agents, null, 2));
  }, 5000); // סימולציה: אחרי 5 שניות

  res.json({ message: 'הסוכן הופעל' });
});

// ף ניהול תוצאות + קונסולת לוגים חיה
app.get('/get-all-results', (req, res) => {
  const resultsFolder = path.join(__dirname, 'agents', 'results');
  const resultFiles = fs.readdirSync(resultsFolder);

  const allResults = resultFiles.map(file => {
      const content = fs.readFileSync(path.join(resultsFolder, file), 'utf8');
      return JSON.parse(content);
  });

  res.json(allResults);
});

