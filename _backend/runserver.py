import os
import mimetypes

from api_server._modules.utils import str2bool
from api_server import app

# to use text/javascript mime type on file requests 
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/json', '.json')

server = os.getenv('FLASK_SERVER')
port = int(os.getenv('FLASK_PORT'))
debug = str2bool(os.getenv('FLASK_IS_DEBUG'))

use_reloader = True

if __name__ == '__main__':

    app.run(server, port, debug = debug, threaded = True, use_reloader = use_reloader)
     