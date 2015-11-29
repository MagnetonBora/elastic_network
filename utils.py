import math
import random
import string

from random import choice, Random, randint


def read_names(file_path):
    with open(file_path, 'r') as input_file:
        names = input_file.readlines()
    return map(lambda name: name.replace("\n", ""), names)

# def visualize_graph(nodes):
#     G = nx.Graph()

#     node_labels = {}
#     for node in nodes:
#         for contact in node['contacts']:
#             G.add_edge(node['id'], contact.uid)
#             node_labels[contact.uid] = contact.uid

#     settings = {        
#         'node_shape': 'o',
#         'with_lables': True,
#         'labels': node_labels
#     }

#     nx.draw_graphviz(G, **settings)
#     plt.show()


class User(object):

    def __init__(self, user_info, contacts=None):
        self._uid = self._generate_uid(8)
        self._contacts = [] if contacts is None else contacts
        self._user_info = user_info
        self._replies = []
        self._demand_replies = 0
        self._parent = None

    def _generate_uid(self, length):
        symbols = [choice(string.ascii_letters + string.digits) for i in xrange(length)]
        return string.join(symbols, '')

    def _traverse(self, root, users):
        contacts = [c.to_dict() for c in root.contacts]
        item = dict(
            id=root.uid,
            name=root.user_info.name,
            age=root.user_info.age,
            gender=root.user_info.gender,
            contacts=contacts
        )
        users.append(item)
        for contact in root.contacts:
            self._traverse(contact, users)
        return users

    def traverse(self):
        return self._traverse(self, [])

    @property
    def user_info(self):
        return self._user_info

    @property
    def uid(self):
        return self._uid

    @property
    def replies(self):
        return self._replies

    @property
    def contacts(self):
        return self._contacts

    @contacts.setter
    def contacts(self, contacts_collection):
        if len(self._contacts) == 0:
            self._contacts = contacts_collection
        else:
            for contact in contacts_collection:
                self._contacts.append(contact)

    @property
    def parent(self):
        return self._parent

    @parent.setter
    def parent(self, user):
        self._parent = user

    def answer(self, answers):
        return choice(answers)

    def add_contact(self, contact=None):
        if contact is not None:
            contact.parent = self
            self._contacts.append(contact)

    def add_contacts(self, contacts=None):
        if contacts is not None:
            for contact in contacts:
                self.add_contact(contact)

    def __repr__(self):
        return "Name: {name}, id: {id}".format(
            name=self._user_info.name,
            id=self._uid
        )

    def to_dict(self):
        info = self._user_info.to_dict()
        info.update(dict(uid=self._uid))
        return info


class UserInfo(object):

    def __init__(self, name, age, gender):
        self.name = name
        self.age = age
        self.gender = gender

    def __repr__(self):
        return 'User: {}, age: {}, gender: {}'.format(self.name, self.age, self.gender)

    def to_dict(self):
        return self.__dict__


class ContactsManager(object):
    FILE_PATH_MALE = 'data/male.txt'
    FILE_PATH_FEMALE = 'data/female.txt'
    genders = ['male', 'female']

    def __init__(self):
        self.male = read_names(self.FILE_PATH_MALE)
        self.female = read_names(self.FILE_PATH_FEMALE)

    def _generate_age(self, avg_age, age_dev):
        age = 0
        while age <= 0:
            age = int(math.floor(random.gauss(avg_age, age_dev)))
        return age

    def _contacts_generator(self, config, count):
        for i in xrange(count):
            user_info = self.generate_contact(config)
            yield User(user_info)

    def generate_contacts(self, config, count):
        contacts = self._contacts_generator(config, count)
        return [contact for contact in contacts]

    def generate_contact(self, config):
        avg_age = config['avg_age']
        avg_dev = config['age_dev']
        user_info = dict(
            age=self._generate_age(avg_age, avg_dev),
            gender=choice(self.genders)
        )
        if 'male' in user_info.values():
            user_info.update(dict(name=choice(self.male)))
        if 'female' in user_info.values():
            user_info.update(dict(name=choice(self.female)))
        return UserInfo(**user_info)


class ContactsTree(object):

    def __init__(self, depth, config):
        self.config = config
        self.depth = depth
        self.manager = ContactsManager()

    def _generate_tree(self, user, depth):
        count = randint(3, 5)
        user.contacts = self.manager.generate_contacts(self.config, count)
        if depth < 0:
            return
        for contact in user.contacts:
            contact.parent = user
            self._generate_tree(contact, depth-1)

    def generate_tree(self):
        user = User(self.manager.generate_contact(self.config))
        self._generate_tree(user, self.depth-1)
        return user
