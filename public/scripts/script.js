// Handle the habit form submission
document.getElementById('habit-form').onsubmit = async function (e) {
    e.preventDefault();
    const habit = document.getElementById('habit').value;
    const time = document.getElementById('time').value;
  
    const response = await fetch('/set-habit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit, time }),
    });
    const message = await response.text();
    alert(message);
  };
  
  // Handle feedback form submission
  document.getElementById('feedback-form').onsubmit = async function (e) {
    e.preventDefault();
    const habitId = document.getElementById('habitId').value;
    const feedback = document.getElementById('feedback').value;
  
    const response = await fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, feedback }),
    });
    const message = await response.text();
    alert(message);
  };

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;

if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/sw.js').then(registration => {
    // Subscribe to push notifications
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
  }).then(subscription => {
    // Send the subscription to the server
    return fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }).then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Push subscription error: ', error));
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
