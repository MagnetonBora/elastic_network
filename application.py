import sys
import flask
import logging

from utils import ContactsManager, ContactsTree
from flask import render_template, url_for, Flask

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)
app = Flask(__name__)


def dump_contacts(users):
	dumped_items = [user.to_dict() for user in users]
	return dict(contacts=dumped_items)


@app.route('/')
def home():
	return render_template("index.html")


@app.route('/contacts')
def contacts():
	with app.app_context():
		users = ContactsManager().generate_contacts(
			dict(avg_age=25, age_dev=5),
			5
		)
		logger.info("Generating contacts list {}".format(users))
		return flask.jsonify(dump_contacts(users))


@app.route('/tree')
def tree():
	with app.app_context():
		root = ContactsTree(1, dict(avg_age=25, age_dev=5)).generate_tree()
		users = root.traverse()
		logger.info("Generating test tree {}".format(users))
		return flask.jsonify(dict(users=users))


if __name__ == '__main__':
	app.run(debug=True)
