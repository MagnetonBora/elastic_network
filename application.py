import sys
import flask
import logging

from utils import ContactsManager, ContactsTree, SimulationManager
from flask import render_template, url_for, Flask

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
        edges += [(parent_id, c['uid'], user['messages_number']) for c in user['contacts']]
    return edges


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/tree')
def tree():
    with app.app_context():
        root = ContactsTree(2, dict(avg_age=25, age_dev=5)).generate_tree()
        users = root.traverse()
        logger.info("Generating test tree {}".format(users))
        edges = make_edges(users)
        tree_data = dict(edges=edges, users=users)
        return flask.jsonify(tree_data)


@app.route('/simulation')
def simulation():
    with app.app_context():
        depth = 3
        age_params = dict(avg_age=25, age_dev=5)
        settings = {
            "use_profile_spreading": False,
        	"question": "What are the best movie?",
        	"answers": ["A Beautiful mind", "Terminator", "Matrix"],
        	"clasterization_factor": 1,
        	"time_limit": 1000,
        	"reply_prob": 1.0,
        	"forwarding_prob": 1.0,
        	"depth": 2,
        	"age_params": {
        		"avg_age": 25,
        		"age_dev": 10
        	}
        }
        sender = ContactsTree(depth, age_params).generate_tree()
        simulator = SimulationManager(sender=sender, settings=settings)
        simulator.start_simulation()
        users = sender.traverse()
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
    app.run(debug=True)
