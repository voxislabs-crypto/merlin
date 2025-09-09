// scripts/checkOllamaPort.ts
import net from 'net';
import dns from 'dns';

const HOST = 'localhost';
const PORT = 11434;
const TIMEOUT = 5000; // 5 seconds

async function checkPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isAvailable = false;

    socket.setTimeout(TIMEOUT);
    
    socket.on('connect', () => {
      isAvailable = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function checkDns(host: string): Promise<boolean> {
  return new Promise((resolve) => {
    dns.lookup(host, (err) => {
      resolve(!err);
    });
  });
}

async function main() {
  console.log(`🔍 Checking Ollama connection at ${HOST}:${PORT}...`);

  try {
    // Check if host is resolvable
    const isHostResolvable = await checkDns(HOST);
    if (!isHostResolvable) {
      console.error(`❌ Cannot resolve host: ${HOST}`);
      console.log('\nPossible solutions:');
      console.log('1. Make sure Ollama is installed and running');
      console.log('2. Check if the hostname is correct');
      return;
    }

    console.log(`✅ Host ${HOST} is resolvable`);

    // Check if port is open
    const isPortOpen = await checkPort(HOST, PORT);
    
    if (isPortOpen) {
      console.log(`✅ Port ${PORT} is open and accepting connections`);
      console.log('\nOllama appears to be running correctly! 🚀');
      console.log('You can proceed with running the fusion script.');
    } else {
      console.error(`❌ Port ${PORT} is not responding`);
      console.log('\nTroubleshooting steps:');
      console.log('1. Make sure Ollama is running (try: `ollama serve` in a new terminal)');
      console.log('2. Check if another service is using port 11434');
      console.log('3. Verify your firewall settings');
      console.log('4. Try accessing http://localhost:11434 in your browser');
    }
  } catch (error) {
    console.error('Error checking port:', error);
  }
}

main().catch(console.error);