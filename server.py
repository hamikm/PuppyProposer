import os
import time

from flask import Flask
from flask_uwsgi_websocket import GeventWebSocket

PROPOSER_STMTS_FILE = 'text_goes_here.txt'
POLLING_INTERVAL_SECS = 0.5

app = Flask(__name__)
websocket = GeventWebSocket(app)

@app.route('/')
def health():
    return 'ok'

@websocket.route('/prop')
def session(ws):
    last_spoken = None
    i = 1

    # Use hacky but platform-independent polling to check file for changes
    while True:
        with open(PROPOSER_STMTS_FILE) as f:
            last_line = None
            for line in f:
                if len(line) > 0:
                    last_line = line
            if last_line != last_spoken:
                ws.send(last_line)
                last_spoken = last_line
        print('Waiting for changes to file...', i)
        i += 1
        time.sleep(POLLING_INTERVAL_SECS)
    ws.close()


if __name__ == '__main__':
    # This is used when running locally.
    app.run(host='0.0.0.0', port=8080, debug=True)
