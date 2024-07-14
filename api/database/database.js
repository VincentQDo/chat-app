import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const db = new sqlite3.Database(path.resolve(__dirname, 'chatlist.db'), (err) => {
  if (err) {
    console.error('Error openning database:', err);
  } else {
    console.log('Database connected.');
    fs.readFile(sqlFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading SQL file: ', err);
        return;
      }

      db.exec(data, (err) => {
        if (err) {
          console.error('Error executing SQL file: ', err);
        } else {
          console.log('SQL file executed succesfully.');
        }
        console.log('DB data after execution: ', data);
      })
    })
  }
});

export default db;
