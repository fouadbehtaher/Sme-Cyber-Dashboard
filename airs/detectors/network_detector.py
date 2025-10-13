import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List

class NetworkDetector:
    def __init__(self, config: Dict):
        self.config = config
        self.suspicious_activities = []
        self.logger = logging.getLogger(__name__)
        
        # Thresholds for detection
        self.brute_force_threshold = config.get('brute_force_threshold', 5)
        self.port_scan_threshold = config.get('port_scan_threshold', 10)
        
    async def analyze_network_traffic(self, traffic_data: List[Dict]) -> List[Dict]:
        """Analyze network traffic for suspicious patterns"""
        incidents = []
        
        # Detect brute force attacks
        brute_force_incidents = await self.detect_brute_force(traffic_data)
        incidents.extend(brute_force_incidents)
        
        # Detect port scanning
        port_scan_incidents = await self.detect_port_scanning(traffic_data)
        incidents.extend(port_scan_incidents)
        
        # Detect DDoS attacks
        ddos_incidents = await self.detect_ddos(traffic_data)
        incidents.extend(ddos_incidents)
        
        return incidents
    
    async def detect_brute_force(self, traffic_data: List[Dict]) -> List[Dict]:
        """Detect brute force attack patterns"""
        incidents = []
        recent_traffic = self._get_recent_traffic(traffic_data, minutes=5)
        
        # Group by source IP and destination port
        ip_port_attempts = {}
        
        for packet in recent_traffic:
            if packet.get('protocol') in ['SSH', 'RDP', 'FTP', 'TELNET']:
                key = (packet['source_ip'], packet['destination_port'])
                ip_port_attempts[key] = ip_port_attempts.get(key, 0) + 1
                
                # Check if threshold exceeded
                if ip_port_attempts[key] >= self.brute_force_threshold:
                    incident = {
                        'id': f"brute_force_{packet['source_ip']}_{datetime.now().timestamp()}",
                        'type': 'brute_force_attack',
                        'source_ip': packet['source_ip'],
                        'destination_ip': packet['destination_ip'],
                        'destination_port': packet['destination_port'],
                        'protocol': packet['protocol'],
                        'attempt_count': ip_port_attempts[key],
                        'timestamp': datetime.now().isoformat(),
                        'confidence': 'high'
                    }
                    incidents.append(incident)
        
        return incidents
    
    async def detect_port_scanning(self, traffic_data: List[Dict]) -> List[Dict]:
        """Detect port scanning activity"""
        incidents = []
        recent_traffic = self._get_recent_traffic(traffic_data, minutes=2)
        
        # Group by source IP
        ip_scan_ports = {}
        
        for packet in recent_traffic:
            if packet.get('flags') in ['SYN', 'ACK']:
                source_ip = packet['source_ip']
                if source_ip not in ip_scan_ports:
                    ip_scan_ports[source_ip] = set()
                ip_scan_ports[source_ip].add(packet['destination_port'])
                
                # Check if threshold exceeded
                if len(ip_scan_ports[source_ip]) >= self.port_scan_threshold:
                    incident = {
                        'id': f"port_scan_{source_ip}_{datetime.now().timestamp()}",
                        'type': 'port_scanning',
                        'source_ip': source_ip,
                        'scanned_ports_count': len(ip_scan_ports[source_ip]),
                        'timestamp': datetime.now().isoformat(),
                        'confidence': 'medium'
                    }
                    incidents.append(incident)
        
        return incidents
    
    async def detect_ddos(self, traffic_data: List[Dict]) -> List[Dict]:
        """Detect DDoS attack patterns"""
        incidents = []
        recent_traffic = self._get_recent_traffic(traffic_data, minutes=1)
        
        # Calculate requests per second per target
        target_requests = {}
        
        for packet in recent_traffic:
            target_ip = packet['destination_ip']
            target_requests[target_ip] = target_requests.get(target_ip, 0) + 1
        
        # Check for unusually high traffic
        baseline_rps = 100  # This should be learned from normal traffic
        for target_ip, request_count in target_requests.items():
            if request_count > baseline_rps * 5:  # 5x normal traffic
                incident = {
                    'id': f"ddos_{target_ip}_{datetime.now().timestamp()}",
                    'type': 'ddos_attack',
                    'target_ip': target_ip,
                    'requests_per_second': request_count,
                    'timestamp': datetime.now().isoformat(),
                    'confidence': 'high'
                }
                incidents.append(incident)
        
        return incidents
    
    def _get_recent_traffic(self, traffic_data: List[Dict], minutes: int) -> List[Dict]:
        """Filter traffic data to recent timeframe"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        return [
            packet for packet in traffic_data 
            if datetime.fromisoformat(packet['timestamp']) > cutoff_time
        ]
    
    async def run_detection(self, traffic_source):
        """Main detection loop"""
        self.logger.info("Starting network detection")
        
        while True:
            try:
                # Get recent traffic data (this would come from your network monitoring)
                traffic_data = await traffic_source.get_recent_traffic()
                
                # Analyze for incidents
                incidents = await self.analyze_network_traffic(traffic_data)
                
                # Return detected incidents
                for incident in incidents:
                    yield incident
                
                await asyncio.sleep(self.config.get('scan_interval', 10))
                
            except Exception as e:
                self.logger.error(f"Network detection error: {e}")
                await asyncio.sleep(30)  # Wait longer on error
