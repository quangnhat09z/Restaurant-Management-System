const WebSocket = require('ws');

class OrderWebSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        console.log('✅ OrderWebSocketServer class instantiated');
    }

    initialize(server) {
        console.log('🔧 initialize() method called');

        if (!server) {
            throw new Error('Server object is required for WebSocket initialization');
        }

        this.wss = new WebSocket.Server({
            server,
            path: '/ws'
        });

        this.wss.on('connection', (ws, req) => {
            const clientId = req.headers['sec-websocket-key'];
            console.log(`✅ Kitchen client connected: ${clientId}`);

            this.clients.add(ws);

            ws.send(JSON.stringify({
                type: 'CONNECTED',
                message: 'Connected to Order Service WebSocket',
                timestamp: new Date().toISOString()
            }));

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);

                    if (data.type === 'PING') {
                        ws.send(JSON.stringify({ type: 'PONG' }));
                        // Bỏ comment dòng dưới để ẩn log PING
                        // console.log('📩 Received PING from client');
                        return; // Không log PING
                    }

                    console.log('📩 Received:', data);
                } catch (error) {
                    console.error('Error parsing:', error);
                }
            });

            ws.on('close', () => {
                console.log(`❌ Kitchen client disconnected: ${clientId}`);
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });

        console.log('🔌 WebSocket server initialized on /ws');
    }

    broadcast(event, data) {
        const message = JSON.stringify({
            type: event,
            data,
            timestamp: new Date().toISOString()
        });

        let successCount = 0;
        let failCount = 0;

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                    successCount++;
                } catch (error) {
                    console.error('Error sending:', error);
                    failCount++;
                }
            } else {
                this.clients.delete(client);
                failCount++;
            }
        });

        console.log(`📡 Broadcast ${event}: ${successCount} sent, ${failCount} failed`);
    }

    notifyNewOrder(order) {
        console.log(`🔔 NEW_ORDER: #${order.OrderID}`);
        this.broadcast('NEW_ORDER', order);
    }

    notifyOrderStatusChanged(orderId, oldStatus, newStatus) {
        console.log(`🔔 ORDER_STATUS: #${orderId} ${oldStatus} → ${newStatus}`);
        this.broadcast('ORDER_STATUS_CHANGED', { orderId, oldStatus, newStatus });
    }

    notifyOrderCancelled(orderId) {
        console.log(`🔔 ORDER_CANCELLED: #${orderId}`);
        this.broadcast('ORDER_CANCELLED', { orderId });
    }

    getStats() {
        return {
            totalConnections: this.clients.size,
            activeConnections: Array.from(this.clients).filter(
                client => client.readyState === WebSocket.OPEN
            ).length
        };
    }
}

// Create and export instance
const wsServer = new OrderWebSocketServer();

console.log('✅ OrderWebSocket.js loaded');
console.log('   Instance created:', typeof wsServer);
console.log('   Initialize method:', typeof wsServer.initialize);

module.exports = wsServer;
