import sys
import flask
import logging

from utils import ContactsManager
from flask import render_template, url_for, Flask

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)
app = Flask(__name__)


def dump_contacts(contacts):
	dumped_items = [c.to_dict() for c in contacts]
	return dict(contacts=dumped_items)


@app.route('/')
def home():
	return render_template("index.html")


@app.route('/contacts')
def contacts():
	with app.app_context():
		contacts = ContactsManager().generate_contacts(
			dict(avg_age=10, age_dev=5),
			5
		)
		logger.info("Generating contacts list {}".format(contacts))
		return flask.jsonify(dump_contacts(contacts))


if __name__ == '__main__':
	app.run(debug=True)
