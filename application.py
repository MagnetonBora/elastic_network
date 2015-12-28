import os
import sys
import flask
import logging

from flask import request
from config import SETTINGS, AGE_PARAMS, DEPTH
from flask import render_template, url_for, Flask
from tree import create_index, restore_parents, traverse
from utils import ContactsManager, ContactsTree, SimulationManager, UserInfo, User


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
        parent_id = user['id']
        edges += [(parent_id, c['id']) for c in user['contacts']]
    return edges


@app.route('/')
def home():
    graphs = os.listdir('data/graphs')
    return render_template("index.html", graphs=graphs)


@app.route('/tree')
def tree():
    with app.app_context():
        sender = ContactsTree(DEPTH, AGE_PARAMS).generate_tree()
        simulator = SimulationManager(sender=sender, settings=SETTINGS)
        users = simulator.traverse()
        edges = make_edges(users)
        logger.info("Generating test tree {}".format(users))
        return flask.jsonify(dict(edges=edges, users=users))


@app.route('/simulation', methods=['POST'])
def simulation():
    with app.app_context():
        data = flask.json.loads(request.data)

        root_id = data['graph']['root']['id']
        tree_dict = create_index(data['graph'])

        restore_parents(root_id, tree_dict)

        sender = tree_dict[root_id]

        simulator = SimulationManager(sender=sender, settings=SETTINGS)
        simulator.start_simulation()
        statistics = simulator.statistics()

        response = dict(
            statistics=dict(
                votes=statistics['info'],
                replies_log=statistics['replies_log'],
                replies_number=statistics['replies_number'],
                request_number=simulator.average_request_number()
            )
        )
        return flask.jsonify(response)


@app.route('/generate-tree')
def generate_tree():
    with app.app_context():
        sender = ContactsTree(DEPTH, AGE_PARAMS).generate_tree()
        simulator = SimulationManager(sender=sender, settings=SETTINGS)
        nodes = simulator.traverse()
        return flask.jsonify(dict(root=sender.to_dict(), nodes=nodes, edges=make_edges(nodes)))


@app.route('/save', methods=['POST'])
def save_graph():
    data = flask.json.loads(request.data)
    path = 'data/graphs/{}'.format(data['name'])
    with open(path, 'w') as f:
        f.write(flask.json.dumps(data['graph']))
    return 'Ok'


@app.route('/load/<path:name>')
def load_graph(name):
    path = "data/graphs/{}".format(name)
    with open(path, 'r') as f:
        graph = flask.json.load(f)
        return flask.jsonify(graph)


def _create_folder_structure():
    try:
        os.mkdir('data/graphs')
    except Exception:
        pass


if __name__ == '__main__':
    _create_folder_structure()
    app.run(debug=True)
