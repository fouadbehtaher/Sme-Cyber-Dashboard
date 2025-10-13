const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class NmapScanner {
  constructor() {
    this.defaultOptions = '-sV -O --script vuln';
  }

  async scanNetwork(target) {
    try {
      const command = `nmap ${this.defaultOptions} ${target}`;
      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.error('Nmap stderr:', stderr);
      }

      return this.parseNmapOutput(stdout);
    } catch (error) {
      console.error('Nmap scan failed:', error);
      throw new Error(`Scan failed: ${error.message}`);
    }
  }

  parseNmapOutput(output) {
    const lines = output.split('\n');
    const results = {
      hosts: [],
      summary: {}
    };

    let currentHost = null;

    for (const line of lines) {
      // Detect host
      const hostMatch = line.match(/Nmap scan report for (.+)/);
      if (hostMatch) {
        currentHost = {
          host: hostMatch[1],
          ports: [],
          os: null,
          vulnerabilities: []
        };
        results.hosts.push(currentHost);
        continue;
      }

      // Detect port
      const portMatch = line.match(/(\d+)\/(tcp|udp)\s+(\w+)\s+(\w+)\s+(.+)/);
      if (portMatch && currentHost) {
        const port = {
          port: parseInt(portMatch[1]),
          protocol: portMatch[2],
          state: portMatch[3],
          service: portMatch[4],
          version: portMatch[5]
        };
        currentHost.ports.push(port);
        continue;
      }

      // Detect OS
      const osMatch = line.match(/OS: (.+)/);
      if (osMatch && currentHost) {
        currentHost.os = osMatch[1];
        continue;
      }

      // Detect vulnerabilities (from script output)
      if (line.includes('VULNERABLE:') && currentHost) {
        currentHost.vulnerabilities.push(line.replace('VULNERABLE:', '').trim());
      }
    }

    results.summary = {
      totalHosts: results.hosts.length,
      totalVulnerabilities: results.hosts.reduce((acc, host) => acc + host.vulnerabilities.length, 0),
      scanTimestamp: new Date().toISOString()
    };

    return results;
  }

  async quickScan(target) {
    try {
      const command = `nmap -F ${target}`;
      const { stdout } = await execPromise(command);
      return this.parseNmapOutput(stdout);
    } catch (error) {
      throw new Error(`Quick scan failed: ${error.message}`);
    }
  }
}

module.exports = new NmapScanner();
