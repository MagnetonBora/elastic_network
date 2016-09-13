import os
import sys
import flask
import logging

from flask import request
from contactstree import deserialize
from flask import render_template, url_for, Flask
from utils import ContactsManager, ContactsTree, SimulationManager, UserInfo, User

DEPTH = 2

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


@app.route('/simulation', methods=['POST'])
def simulation():
    with app.app_context():
        data = flask.json.loads(request.data)
        root_id = data['graph']['root']['id']
        tree_dict = deserialize(root_id, data['graph'])
        sender = tree_dict[root_id]
        settings = {}
        settings.update(data['params'])
        settings.update(use_profile_spreading=data['spreading'])
        simulator = SimulationManager(sender=sender, settings=settings)
        simulator.start_simulation()
        statistics = simulator.statistics()
        response = dict(
            statistics=dict(
                votes=statistics['info'],
                replies_log=statistics['replies_log'],
                replies_number=statistics['replies_number'],
                request_number=simulator.average_request_number()-1
            ),
            replies_stats=statistics['replies_stats']
        )
        return flask.jsonify(response)


@app.route('/generate-tree', methods=['POST'])
def generate_tree():
    with app.app_context():
        data = flask.json.loads(request.data)
        params = data['params']
        age_params = {
            'avg_age': params['avg_age'],
            'age_dev': params['age_dev']
        }
        sender = ContactsTree(DEPTH, age_params).generate_tree()
        settings = {}
        settings.update(data['params'])
        simulator = SimulationManager(sender=sender, settings=settings)
        nodes = simulator.traverse()
        return flask.jsonify(dict(root=sender.to_dict(), nodes=nodes, edges=make_edges(nodes)))


@app.route('/save', methods=['POST'])
def save_graph():
    data = flask.json.loads(request.data)
    if 'name' not in data or 'graph' not in data:
        return 'Ooops'
    path = 'data/graphs/{}'.format(data['name'])
    with open(path, 'w') as f:
        try:
            f.write(flask.json.dumps(data['graph']))
        except Exception as e:
            print e
    return 'Ok'


@app.route('/delete', methods=['POST'])
def delete_graph():
    data = flask.json.loads(request.data)
    if 'name' in data:
        path = 'data/graphs/{}'.format(data['name'])
        try:
            os.remove(path)
        except Exception as e:
            print e
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
    app.run()
