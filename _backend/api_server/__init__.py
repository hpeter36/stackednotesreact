import os
from flask import Flask
from flask_bcrypt import Bcrypt
from flask import Flask, _app_ctx_stack
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import scoped_session
from dotenv import load_dotenv

from api_server.config import Config

load_dotenv(f"{os.path.dirname(__file__)}\.env.local")

bcrypt = Bcrypt()   # encoding, decoding user pws

# db
db_fsa = SQLAlchemy()
db_engine = create_engine(f"mariadb+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PW')}@{os.getenv('DB_SERVER')}/{os.getenv('DB_DB_NAME')}?charset=utf8mb4", pool_size=10000) # !!! poolclass=NullPool) # pool_size=5, max_overflow=10, pool_recycle=60 , isolation_level="READ COMMITTED" !!!
db_session =  scoped_session(sessionmaker(autocommit = False, autoflush= True, bind = db_engine), scopefunc = _app_ctx_stack.__ident_func__) # db_session.remove()
from api_server._modules.database_sql import DataBaseSql
db_my_sql = DataBaseSql()
#db_my_sql.db_engine = db_sql
#db_file = DataBaseFile()

def create_app(config_class = Config):

    # create flask instance
    app = Flask(__name__)

    # read config
    app.config.from_object(config_class)

    with app.app_context():
        #db_file.init_pathes(app.root_path)
        db_fsa.init_app(app)
        bcrypt.init_app(app)

        from api_server.api.routes import api

        app.register_blueprint(api)

    return app

# create flask app obj
app = create_app()