from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# В Docker переопределяется через env: DB_PATH=/data/botwork.db
# Локально по умолчанию кладётся рядом со скриптом
_default_db = os.path.join(os.path.dirname(__file__), '..', 'db', 'botwork.db')
DB_PATH = os.environ.get('DB_PATH', _default_db)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact TEXT NOT NULL,
                bot_type TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact TEXT NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')


@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Нет данных'}), 400

    name = data.get('name', '').strip()
    contact = data.get('contact', '').strip()
    bot_type = data.get('bot_type', '').strip()
    description = data.get('description', '').strip()

    if not name or not contact:
        return jsonify({'error': 'Имя и контакт обязательны'}), 400

    with get_db() as conn:
        conn.execute(
            'INSERT INTO orders (name, contact, bot_type, description) VALUES (?, ?, ?, ?)',
            (name, contact, bot_type, description)
        )

    return jsonify({'success': True, 'message': 'Заявка принята! Свяжемся с вами в течение часа.'}), 201


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Нет данных'}), 400

    name = data.get('name', '').strip()
    contact = data.get('contact', '').strip()
    message = data.get('message', '').strip()

    if not name or not contact:
        return jsonify({'error': 'Имя и контакт обязательны'}), 400

    with get_db() as conn:
        conn.execute(
            'INSERT INTO registrations (name, contact, message) VALUES (?, ?, ?)',
            (name, contact, message)
        )

    return jsonify({'success': True, 'message': 'Сообщение отправлено! Ответим вам скоро.'}), 201


ADMIN_TEMPLATE = '''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>BotWork Admin</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f3f4f6; color: #0f172a; }
  .header { background: #0f172a; color: #e5e7eb; padding: 16px 32px; font-size: 18px; font-weight: 600; }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
  h2 { font-size: 18px; margin: 24px 0 12px; }
  .badge { display: inline-block; background: #22c55e; color: #052e16; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; margin-left: 8px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
  th { background: #1e293b; color: #e5e7eb; text-align: left; padding: 10px 14px; font-size: 13px; }
  td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f9fafb; }
  .empty { padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; }
</style>
</head>
<body>
<div class="header">🤖 BotWork — Панель администратора</div>
<div class="container">
  <h2>Заявки на разработку <span class="badge">{{ orders|length }}</span></h2>
  <table>
    <thead>
      <tr><th>#</th><th>Имя</th><th>Контакт</th><th>Тип бота</th><th>Описание</th><th>Дата</th></tr>
    </thead>
    <tbody>
      {% for o in orders %}
      <tr>
        <td>{{ o.id }}</td>
        <td>{{ o.name }}</td>
        <td>{{ o.contact }}</td>
        <td>{{ o.bot_type or '—' }}</td>
        <td>{{ o.description or '—' }}</td>
        <td>{{ o.created_at }}</td>
      </tr>
      {% else %}
      <tr><td colspan="6" class="empty">Заявок пока нет</td></tr>
      {% endfor %}
    </tbody>
  </table>

  <h2>Регистрации / Обращения <span class="badge">{{ registrations|length }}</span></h2>
  <table>
    <thead>
      <tr><th>#</th><th>Имя</th><th>Контакт</th><th>Сообщение</th><th>Дата</th></tr>
    </thead>
    <tbody>
      {% for r in registrations %}
      <tr>
        <td>{{ r.id }}</td>
        <td>{{ r.name }}</td>
        <td>{{ r.contact }}</td>
        <td>{{ r.message or '—' }}</td>
        <td>{{ r.created_at }}</td>
      </tr>
      {% else %}
      <tr><td colspan="5" class="empty">Обращений пока нет</td></tr>
      {% endfor %}
    </tbody>
  </table>
</div>
</body>
</html>'''


@app.route('/admin')
def admin():
    with get_db() as conn:
        orders = conn.execute('SELECT * FROM orders ORDER BY created_at DESC').fetchall()
        registrations = conn.execute('SELECT * FROM registrations ORDER BY created_at DESC').fetchall()
    return render_template_string(ADMIN_TEMPLATE, orders=orders, registrations=registrations)


if __name__ == '__main__':
    init_db()
    print("BotWork backend запущен на http://localhost:5000")
    print("Админка: http://localhost:5000/admin")
    app.run(debug=True, port=5000)
