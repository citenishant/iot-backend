const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
require('dotenv').config();

const Device = require('./models/device');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// MQTT connection
const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('message', async (topic, message) => {
    const deviceId = topic.split('/')[1];
    const device = await Device.findById(deviceId);
    if (device) {
        device.data = JSON.parse(message.toString());
        await device.save();
    }
});

// API Endpoints
app.post('/devices', async (req, res) => {
    const { name } = req.body;
    const device = new Device({ name });
    await device.save();
    res.status(201).send(device);
});

app.get('/devices', async (req, res) => {
    const devices = await Device.find();
    res.send(devices);
});

app.post('/devices/:id/control', async (req, res) => {
    const { id } = req.params;
    const { command } = req.body;
    mqttClient.publish(`device/${id}/control`, JSON.stringify(command));
    res.send({ message: 'Command sent' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));