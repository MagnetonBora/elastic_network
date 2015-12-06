import sys
import flask
import logging

from config import SETTINGS, AGE_PARAMS, DEPTH
from flask import render_template, url_for, Flask
from utils import ContactsManager, ContactsTree, SimulationManager

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)
app = Flask(__name__)


def dump_contacts(users):
    dumped_items = [user.to_dict() for user in users]
    return dict(contacts=dumped_items)


def make_edges(userslist):
    edges = []
    for user in userslist:
        parent_id = user['uid']
        edges += [(parent_id, c['uid']) for c in user['contacts']]
    return edges


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/tree')
def tree():
    with app.app_context():
        sender = ContactsTree(DEPTH, AGE_PARAMS).generate_tree()
        simulator = SimulationManager(sender=sender, settings=SETTINGS)
        users = simulator.traverse()
        edges = make_edges(users)
        logger.info("Generating test tree {}".format(users))
        return flask.jsonify(dict(edges=edges, users=users))


@app.route('/simulation')
def simulation():
    with app.app_context():
        sender = ContactsTree(DEPTH, AGE_PARAMS).generate_tree()
        simulator = SimulationManager(sender=sender, settings=SETTINGS)
        simulator.start_simulation()
        users = simulator.traverse()
        edges = make_edges(users)
        response = dict(
            users=users,
            edges=edges,
            statistics=dict(
                votes=simulator.statistics(),
                request_number=simulator.average_request_number()
            )
        )
        return flask.jsonify(response)


if __name__ == '__main__':
    app.run()
