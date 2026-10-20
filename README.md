# Портфолио

Статичный сайт-визитка: `index.html`, `style.css`, `script.js`, `projects.json`, `assets/`.

- **Проекты** — в `projects.json` (поля: `title`, `description`, `stack`, `category`, `image`, `links.demo|repo|bot`, `featured`).
- **Личные данные** — объект `CONFIG` в начале `script.js` + мета-теги в `<head>` файла `index.html`.
- **Локальный просмотр** — `python -m http.server` в папке сайта, затем http://localhost:8000
  (при открытии `index.html` двойным кликом браузер блокирует чтение `projects.json`).
