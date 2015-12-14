import sys
import math
import random
import string
import logging
from random import choice, Random, randint

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


class User(object):

    def __init__(self, user_info, contacts=None):
        self._uid = self._generate_uid(8)
        self._contacts = [] if contacts is None else contacts
        self._user_info = user_info
        self._replies = []
        self._replies_amount = 0
        self._demand_replies = 0
        self._parent = None

    def _generate_uid(self, length):
        symbols = [choice(string.ascii_letters + string.digits) for i in xrange(length)]
        return string.join(symbols, '')

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
        self.male = self._read_names(self.FILE_PATH_MALE)
        self.female = self._read_names(self.FILE_PATH_FEMALE)

    def _read_names(self, file_path):
        with open(file_path, 'r') as input_file:
            names = input_file.readlines()
        return map(lambda name: name.replace("\n", ""), names)

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
        count = randint(1, 3)
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


class SimulationManager(object):

    def __init__(self, sender, settings):
        self._current_time = 0
        self._settings = settings
        self._question = settings['question']
        self._answers = settings['answers']
        self._time_limit = settings['time_limit']
        self._max_depth = 10
        self._sender = sender
        self._avg_request_number = 0
        self._use_profile_spreading = settings.get('use_profile_spreading', False)

    def _traverse(self, root, users):
        contacts = [c.to_dict() for c in root.contacts]

        item = dict(
            uid=root.uid,
            name=root.user_info.name,
            age=root.user_info.age,
            gender=root.user_info.gender,
            contacts=contacts
        )

        for contact in root.contacts:
            self._traverse(contact, users)
        users.append(item)
        return users

    def traverse(self):
        return self._traverse(self._sender, [])
    
    def statistics(self):
        replies = self._sender.replies
        stats = dict((item, replies.count(item)) for item in replies)
        total_answers = float(sum(stats.values()))
        stats_relative = [
            {'voted_item': k, 'votes_amount': math.floor(100.0*v/total_answers)}
            for k, v in stats.iteritems()
        ]
        return dict(replies_number=len(replies), info=stats_relative)

    def average_request_number(self):
        return self._avg_request_number

    def start_simulation(self):
        logger.info('STARTING DISCRETE TIME SIMULATION')
        self._invoke(self._sender, 1)
        logger.info('DISCRETE TIME SIMULATION HAS BEEN FINISHED')

    def _invoke(self, user, depth):
        self._current_time += random.gauss(1, 0.1)
        self._avg_request_number += 1

        logger.info('Current time: {}'.format(self._current_time))

        if self._current_time > self._time_limit:
            return

        if depth > self._max_depth:
            return

        reply = -math.log(random.random() + 0.0001)/user.user_info.age
        if reply < self._settings['reply_prob']:
            answer = user.answer(self._answers)
            if user.parent is not None:
                logger.info(
                    'User {child} id={uid} replies to {parent} answer {answer}'.format(
                        uid=user.uid,
                        child=user.user_info.name,
                        parent=user.parent.user_info.name,
                        answer=answer
                    )
                )
                user.parent.replies.append(answer)
                logger.info(
                    'Piggybacking! User {} found out that {} is {} years old'.format(
                        user.user_info.name,
                        user.parent.user_info.name,
                        int(user.user_info.age)
                    )
                )

        for contact in user.contacts:
            if self._use_profile_spreading and contact.user_info.age > user.user_info.age:
                continue

            forward = -math.log(random.random() + 0.0001)/contact.user_info.age
            if forward < self._settings['forwarding_prob']:
                logger.info(
                    'User {} forwards message to {}'.format(
                        user.user_info.name,
                        contact.user_info.name
                    )
                )
                self._invoke(contact, depth+1)

        if user.parent is not None:
            for item in user.replies:
                user.parent.replies.append(item)

    def __repr__(self):
        return '{}'.format(self._sender)
