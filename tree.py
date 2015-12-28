from utils import UserInfo, User


def create_index(tree):
    tree_map = {}
    nodes = tree["nodes"]
    for node in nodes:
        contacts = node["data"].pop('contacts')
        user_data = node["data"]
        user = User(UserInfo(**user_data))
        tree_map[user.id] = user
        for contact in contacts:
            if contact['id'] in tree_map:
                user_contact = tree_map[contact['id']]
            else:
                user_contact = User(UserInfo(**contact))
                tree_map[user_contact.id] = user_contact
            user.contacts.append(user_contact)
    return tree_map


def restore_parents(root_id, tree_map):
    root = tree_map[root_id]
    for contact in root.contacts:
        contact.parent = root
        restore_parents(contact.id, tree_map)


def traverse(root):
    for contact in root.contacts:
        traverse(contact)
    print root
