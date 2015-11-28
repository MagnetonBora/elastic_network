import sys
import logging

from flask import render_template, url_for, Flask

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)
app = Flask(__name__)


@app.route('/')
def home():
	return render_template("index.html")


@app.route('/contacts')
def contacts():
	logger.info("Generating contacts list")
	return ''


if __name__ == '__main__':
	app.run()
