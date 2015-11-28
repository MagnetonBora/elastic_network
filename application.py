
from flask import render_template, url_for, Flask

app = Flask(__name__)


@app.route('/')
def home():
	return render_template("index.html")


@app.route('/contacts')
def contacts():
	return {}


if __name__ == '__main__':
	app.run()
