from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging
from pymongo import MongoClient
from bson.json_util import dumps


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


load_dotenv()


app = Flask(__name__, static_folder='static', static_url_path='')


CORS(app, resources={r"/api/*": {"origins": "*"}})


app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
jwt = JWTManager(app)


try:
    
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb+srv://dogukanturkmen1:D1s2k3t4@cluster0.d6xbgwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    client = MongoClient(mongo_uri)
    db = client.get_database('gamestorev2')  
    logger.info("MongoDB bağlantısı başarılı")
except Exception as e:
    logger.error(f"MongoDB bağlantı hatası: {e}")
    
    USE_MOCK_DATA = True
else:
    USE_MOCK_DATA = False


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api')
def api_home():
    return jsonify({
        'message': 'Welcome to Game Distribution Service API',
        'status': 'running'
    })

MOCK_GAMES = [
    {"name": "Minecraft", "genres": ["Sandbox", "Survival"], "image": "https://cdn.cloudflare.steamstatic.com/steam/apps/2086680/header.jpg", "developer": "Mojang Studios", "releaseDate": "2011-11-18", "description": "Yaratıcılığın sınır tanımadığı dünya.", "price": 26.95, "rating": 4.6},
    {"name": "The Witcher 3", "genres": ["RPG", "Open World"], "image": "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", "developer": "CD PROJEKT RED", "releaseDate": "2015-05-19", "description": "RPG klasiklerinden biri.", "price": 29.99, "rating": 4.8},
    {"name": "Red Dead Redemption 2", "genres": ["Action-Adventure", "Open World"], "image": "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg", "developer": "Rockstar Games", "releaseDate": "2018-10-26", "description": "Vahşi Batı'da geçen epik bir hikaye.", "price": 59.99, "rating": 4.9}
]

MOCK_USERS = [
    {"name": "Test User", "email": "test@example.com"},
    {"name": "Demo User", "email": "demo@example.com"}
]


@app.route('/api/games')
def get_games():
    if USE_MOCK_DATA:
        return jsonify(MOCK_GAMES)
    else:
        try:
            games = list(db.games.find())
            return dumps(games)
        except Exception as e:
            logger.error(f"Oyun verilerini getirirken hata: {e}")
            return jsonify(MOCK_GAMES) 


@app.route('/api/users')
def get_users():
    if USE_MOCK_DATA:
        return jsonify(MOCK_USERS)
    else:
        try:
            users = list(db.users.find())
            return dumps(users)
        except Exception as e:
            logger.error(f"Kullanıcı verilerini getirirken hata: {e}")
            return jsonify(MOCK_USERS)  

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True) 