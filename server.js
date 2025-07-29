const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'data', 'db.json');

// API to get all events
app.get('/api/events', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// API to add an event
app.post('/api/events', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database');
      return;
    }
    const db = JSON.parse(data);
    const newEvent = req.body;
    newEvent.id = Date.now();
    db.events.push(newEvent);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error writing to database');
        return;
      }
      res.status(201).json(newEvent);
    });
  });
});

// API to update an event
app.put('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database');
      return;
    }
    const db = JSON.parse(data);
    const eventIndex = db.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      res.status(404).send('Event not found');
      return;
    }
    db.events[eventIndex] = { ...db.events[eventIndex], ...req.body };
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error writing to database');
        return;
      }
      res.json(db.events[eventIndex]);
    });
  });
});

// API to delete an event
app.delete('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading database');
      return;
    }
    const db = JSON.parse(data);
    const newEvents = db.events.filter(e => e.id !== eventId);
    if (newEvents.length === db.events.length) {
        res.status(404).send('Event not found');
        return;
    }
    db.events = newEvents;
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error writing to database');
        return;
      }
      res.status(204).send();
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
