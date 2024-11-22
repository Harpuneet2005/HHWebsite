require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Airtable configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Web-push configuration
webpush.setVapidDetails('mailto:harpuneet20@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Route to submit a habit
app.post('/set-habit', (req, res) => {
  const { habit, time } = req.body;

  // Create a new record in the "Habits" table
  base('Habits').create([
    {
      fields: {
        Habit: habit,
        Time: time,
      },
    },
  ], (err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving habit');
    }
    res.send('Habit reminder set!');
  });
});

// Route to submit feedback
app.post('/feedback', (req, res) => {
  const { habitId, feedback } = req.body;

  // Update the record in Airtable with the feedback
  base('Habits').update([
    {
      id: habitId,
      fields: {
        Feedback: feedback,
      },
    },
  ], (err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving feedback');
    }
    res.send('Feedback saved successfully!');
  });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // Store the subscription in Airtable for later use
  base('Subscribers').create([
    {
      fields: {
        Subscription: JSON.stringify(subscription),
      },
    },
  ], (err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving subscription');
    }
    res.status(201).json({ message: 'Subscription saved!' });
  });
});

app.post('/send-notification', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Habit Reminder',
    body: 'Don’t forget to follow your habit today!',
  });

  // Retrieve subscriptions from Airtable
  base('Subscribers').select().all((err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving subscriptions');
    }

    // Send notifications to all subscribers
    records.forEach(record => {
      const subscription = JSON.parse(record.fields.Subscription);
      webpush.sendNotification(subscription, payload).catch(error => {
        console.error('Notification error:', error);
      });
    });

    res.status(200).send('Notifications sent!');
  });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
