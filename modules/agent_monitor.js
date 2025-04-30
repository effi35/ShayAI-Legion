const fs = require('fs');
const path = require('path');

class AgentMonitor {
    constructor(agentId, pingInterval = 30000) { // 30 שניות ברירת מחדל
        this.agentId = agentId;
        this.pingInterval = pingInterval;
        this.timer = null;
        this.lastPingSuccess = true;
    }

    startMonitoring() {
        this.timer = setInterval(() => {
            this.pingAgent();
        }, this.pingInterval);
    }

    stopMonitoring() {
        clearInterval(this.timer);
    }

    pingAgent() {
        const resultPath = path.join(__dirname, '..', 'agents', 'results', `${this.agentId}.json`);
        if (!fs.existsSync(resultPath)) {
            console.warn(`Agent ${this.agentId} result file missing!`);
            this.updateAgentStatus('Failed');
            return;
        }

        const resultContent = fs.readFileSync(resultPath, 'utf8');
        if (!resultContent || resultContent.trim() === '') {
            console.warn(`Agent ${this.agentId} empty result.`);
            this.updateAgentStatus('Failed');
            return;
        }

        try {
            const resultData = JSON.parse(resultContent);
            if (resultData && resultData.status === 'success') {
                console.log(`Ping to agent ${this.agentId}: OK`);
                this.updateAgentStatus('Success');
            } else {
                console.warn(`Ping to agent ${this.agentId}: FAIL`);
                this.updateAgentStatus('Failed');
            }
        } catch (error) {
            console.error(`Ping error for agent ${this.agentId}:`, error);
            this.updateAgentStatus('Failed');
        }
    }

    updateAgentStatus(status) {
        try {
            const agentsDataPath = path.join(__dirname, '..', 'config', 'agent_config.json');
            const agentsData = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

            const agentIndex = agentsData.findIndex(a => a.id === this.agentId);
            if (agentIndex !== -1) {
                agentsData[agentIndex].status = status;
                fs.writeFileSync(agentsDataPath, JSON.stringify(agentsData, null, 2));
            }
        } catch (error) {
            console.error('Failed to update agent status:', error);
        }
    }
}

module.exports = AgentMonitor;
