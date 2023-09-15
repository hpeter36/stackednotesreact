import os
from pytz import timezone

class Config:

    # app
    SECRET_KEY = os.getenv("APP_SECRET_KEY")  # used for pw change token
    TEMPLATES_AUTO_RELOAD = True

    # db
    SQLALCHEMY_DATABASE_URI = f"mariadb+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PW')}@{os.getenv('DB_SERVER')}/{os.getenv('DB_DB_NAME')}?charset=utf8mb4"
    SQLALCHEMY_TRACK_MODIFICATIONS = False