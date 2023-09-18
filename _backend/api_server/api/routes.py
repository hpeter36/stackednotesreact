from flask import Blueprint
from flask import jsonify, request
from api_server import db_my_sql

api = Blueprint('api',__name__)

@api.before_request
def common():
    return

@api.after_request
def after_request(response):
    return response

@api.route('/api/v1/resources/get_all_note_element', methods=['GET'])
def get_all_note_element():

    from_note_id = request.args.get('from_note_id')
    #if from_note_id is None:
    #    from_note_id = 1

    return jsonify(db_my_sql.get_all_note_element(from_note_id))

@api.route('/api/v1/resources/get_notes_with_tag', methods=['GET'])
def get_notes_with_tag():

    tag_name = request.args.get('tag_name')
    if tag_name is None:
        return jsonify({'error': "Error when reading notes with tagname, the 'tag_name' is not specified"})

    return jsonify(db_my_sql.get_notes_with_tag(tag_name))

@api.route('/api/v1/resources/get_all_tags_from_id', methods=['GET'])
def get_all_tags_from_id():

    from_note_id = request.args.get('from_note_id')
    return jsonify(db_my_sql.get_all_tags_from_id(from_note_id))

@api.route('/api/v1/resources/get_tag_defs', methods=['GET'])
def get_tag_defs():

    return jsonify(db_my_sql.get_tag_defs())

@api.route('/api/v1/resources/add_new_tag_def', methods=['GET'])
def add_new_tag_def():

    tag_name = request.args.get('tag_name')
    if tag_name is None:
        return jsonify({'error': "Error when adding new tag definition, the 'tag_name' is not specified"})

    return jsonify(db_my_sql.add_new_tag_def(tag_name))

@api.route('/api/v1/resources/add_tag_to_note', methods=['GET'])
def add_tag_to_note():

    note_id = request.args.get('note_id')
    if note_id is None:
        return jsonify({'error': "Error when adding new tag to note, the 'note_id' is not specified"})

    tag_name = request.args.get('tag_name')
    if tag_name is None:
        return jsonify({'error': "Error when adding new tag to note, the 'tag_name' is not specified"})

    return jsonify(db_my_sql.add_tag_to_note(note_id, tag_name))

@api.route('/api/v1/resources/delete_tag_from_note', methods=['GET'])
def delete_tag_from_note():

    note_id = request.args.get('note_id')
    if note_id is None:
        return jsonify({'error': "Error when deleting tag from note, the 'note_id' is not specified"})

    tag_name = request.args.get('tag_name')
    if tag_name is None:
        return jsonify({'error': "Error when deleting tag from note, the 'tag_name' is not specified"})

    return jsonify(db_my_sql.delete_tag_from_note(note_id, tag_name))


@api.route('/api/v1/resources/add_edit_note_element', methods=['GET'])
def add_edit_note_element():

    note_id = request.args.get('note_id')
    #if note_id is None:
    #    return jsonify({'error': 'Error when adding new note, the note_id is not specified'})

    parent_id = request.args.get('parent_id')
    if parent_id is None:
        return jsonify({'error': "Error when editing note, the 'parent_id' is not specified"})

    note = request.args.get('note')
    if note is None:
        return jsonify({'error': "Error when editing note, the 'note' text is not specified"})

    return jsonify(db_my_sql.add_edit_note_element(note_id, parent_id, note))

@api.route('/api/v1/resources/delete_note_and_sub_notes', methods=['GET'])
def delete_note_and_sub_notes():

    note_id_from = request.args.get('note_id_from')
    if note_id_from is None:
        return jsonify({'error': "Error when deleting note, the 'note_id_from' is not specified"})

    return jsonify(db_my_sql.delete_note_and_sub_notes(note_id_from))

@api.route('/api/v1/resources/move_note', methods=['GET'])
def move_note():

    to_move_note_id = request.args.get('to_move_note_id')
    if to_move_note_id is None:
        return jsonify({'error': "Error when moving note, the 'to_move_note_id' is not specified"})

    move_to_parent_id = request.args.get('move_to_parent_id')
    if move_to_parent_id is None:
        return jsonify({'error': "Error when moving note, the 'move_to_parent_id' is not specified"})

    after_note_id = request.args.get('after_note_id')

    return jsonify({'moved_note': db_my_sql.move_note(to_move_note_id, move_to_parent_id, after_note_id)})

@api.route('/api/v1/resources/get_theme_color_schemes', methods=['GET'])
def get_theme_color_schemes():

    #theme_type = request.args.get('theme_type')
    
    #if theme_type is None:
    #    theme_type = 'light' # dark

    return jsonify({'items': db_my_sql.get_theme_color_schemes()})

# @api.route('/api/v1/resources/pin_note', methods=['GET'])
# def pin_note():

#     note_id = request.args.get('note_id')
#     if note_id is None:
#         return jsonify({'error': 'Error when pinning note, the note_id is not specified'})

#     is_pin = request.args.get('is_pin')
#     if is_pin is None:
#         is_pin = '1'

#     return jsonify({'success' : db_my_sql.pin_note(note_id, is_pin)})

