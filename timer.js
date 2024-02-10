const fs = require('fs');
const path = require('path');
const { setInterval } = require('timers');

const logFilePath = path.join(__dirname, '/log.txt');

// Функция для записи даты в файл
function writeDateToLog() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();

  fs.appendFile(logFilePath, `${formattedDate}\n`, (err) => {
    if (err) {
      console.error('Ошибка при записи в файл:', err);
    } else {
      console.log('Дата успешно записана в файл.');
    }
  });
}

// Записываем текущую дату в файл при запуске
writeDateToLog();