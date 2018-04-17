// Update with your config settings.

module.exports = {

  development: {
    client: 'mariasql',
    connection: {
      host: '127.0.0.1',
      db: 'smashup',
      user:     'root',
      password: '',
      charset : 'utf8mb4'
    },
  },
  production: {
    client: 'mariasql',
    connection: {
      host: '127.0.0.1',
      db: 'smashup',
      user:     'root',
      password: '',
      charset : 'utf8mb4'
    },
  }

};

