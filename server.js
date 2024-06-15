const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', async (msg) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: msg,
        max_tokens: 150,
        stop: ['\n']
      }, {
        headers: {
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        }
      });
      io.emit('chat message', response.data.choices[0].text.trim());
    } catch (error) {
      console.error(error);
      io.emit('chat message', 'Error: Unable to fetch response from ChatGPT.');
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});