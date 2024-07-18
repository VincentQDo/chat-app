import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filePath);

const tablesInit = path.resolve(__dirname, 'chatlist.sql')
const dbPath = path.resolve(__dirname, 'chatlist.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error openning database:', err);
  } else {
    console.log('Database connected.');

    // Initialize chats table
    fs.readFile(tablesInit, 'utf8', (err, sqlScript) => {
      if (err) {
        console.error('Error reading SQL file: ', err);
        return;
      }

      db.exec(sqlScript, (err) => {
        if (err) {
          console.error('Error executing SQL file: ', err);
        } else {
          console.log(`SQL file ${tablesInit} executed succesfully.`);
          console.log('Executed Script: ', sqlScript);
        }
      })
    })
  }
});

export default db;
