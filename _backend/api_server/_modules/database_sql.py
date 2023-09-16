import pandas as pd
from api_server import db_session

class DataBaseSql():

    def __init__(self):
        return

#---------------notes

    def get_all_note_element(self, from_id):  # minden usernek kellene egy dummy note ami a root lesz parent_id = 0-val

        # get the root id if 'from_id' not specified
        # root id -> 0
        if from_id is None:
            sql = f'''select id from notes order by id asc limit 1'''
            res = db_session.execute(sql)
            from_id = res.fetchone()[0]

        # get data
        sql = f'''
        with RECURSIVE cte AS 
        (
        SELECT n.id, n.parent_id, n.note, n.note_order
        FROM notes n
        WHERE n.id = {from_id}
        UNION ALL
        SELECT n.id, n.parent_id, n.note, n.note_order
        FROM notes n JOIN cte c ON n.parent_id = c.id
        )
        select id, parent_id, note, note_order
        FROM cte order by parent_id asc, note_order asc'''

        # format data
        df = pd.read_sql(sql, db_session.bind)
        df['parent_id'] = df['parent_id'].astype(int)

        # get hieararchical dict form
        # datas = {}
        # datas['root_id'] = from_id
        # def parse_element(g_df):
        #     #display(g_df)
        #     parent_id = f"id_{g_df['parent_id'].values[0]}"
        #     datas[parent_id] = g_df.to_dict(orient = 'records')

        # # get parents children
        # df = df.groupby(['parent_id']).apply(lambda g: parse_element(g))
        
        # return datas

        return df.to_dict(orient='records')

    def add_edit_note_element(self, note_id, parent_id, note):

        # insert new note
        id = note_id
        if note_id is None:
            sql = f'''
            insert into notes (parent_id, note, note_order)
            select {parent_id}, :n, (select ifnull((select (note_order + 1) from notes where parent_id = {parent_id} order by note_order desc limit 1), 0) as note_order)
            returning id
            '''
            res = db_session.execute(sql, params= {'n': note})
            db_session.commit()
            id = res.fetchone()[0]

        # update note
        else:
            sql = f"update notes set note = '{note}' where id={note_id}"
            res = db_session.execute(sql)
            db_session.commit()

        # get added/updated row
        sql = f'''select * from notes where id = {id}'''
        res = db_session.execute(sql)
        res = res.fetchone()

        return dict(res)
    
    def delete_note_and_sub_notes(self, note_id_from):

        # get notes to delete
        sql = f'''
        with RECURSIVE cte AS 
        (
        SELECT n.id, n.parent_id, n.note, n.note_order
        FROM notes n
        WHERE n.id = {note_id_from}
        UNION ALL
        SELECT n.id, n.parent_id, n.note, n.note_order
        FROM notes n JOIN cte c ON n.parent_id = c.id
        )
        select id, parent_id, note, note_order
        FROM cte'''

        df = pd.read_sql(sql, db_session.bind)
        df['id'] = df['id'].astype(str)
        ids_to_del_arr = df['id'].values

        # delete related tags
        sql = f'''delete from tags where note_id in ({','.join(ids_to_del_arr)})'''
        db_session.execute(sql)
        db_session.commit()

        # delete notes
        sql = f'''delete from notes where id in ({','.join(ids_to_del_arr)})'''
        db_session.execute(sql)
        db_session.commit()

        return {'status': 'OK'}

    def move_note(self, to_move_note_id, move_to_parent_id, after_note_id = None):

        after_note_order = -1
        moved_note_order = 0
        if after_note_id is not None:
            
            sql = f'''select note_order from notes where id = {after_note_id}'''
            res = db_session.execute(sql)
            after_note_order = res.fetchone()[0]

        sql = f'''update notes set note_order = note_order + 1 where parent_id = {move_to_parent_id} and note_order > {after_note_order}'''
        db_session.execute(sql)

        moved_note_order = after_note_order + 1
        sql = f'''update notes set parent_id = {move_to_parent_id}, note_order = {moved_note_order} where id = {to_move_note_id}'''
        db_session.execute(sql)
        db_session.commit()

        sql = f'Select * from notes where id = {to_move_note_id}'
        res = db_session.execute(sql)
        
        return dict(res.fetchone())

#---------------tags

    def get_all_tags_from_id(self, from_id):

        # get the root id if 'from_id' not specified
        # root id -> 0
        if from_id is None:
            sql = f'''select id from notes order by id asc limit 1'''
            res = db_session.execute(sql)
            from_id = res.fetchone()[0]

        sql=f'''with RECURSIVE cte AS 
        (
        SELECT n.id,  n.parent_id, n.note_order
        FROM notes n
        WHERE n.id = {from_id}
        UNION ALL
        SELECT n.id, n.parent_id, n.note_order
        FROM notes n JOIN cte c ON n.parent_id = c.id
        )
        select c.id as note_id, c.parent_id, c.note_order, td.name as tag_name
        FROM cte c
        inner join tags t on c.id = t.note_id
        inner join tag_defs td on t.tagdef_id = td.id 
        order by c.parent_id asc, c.note_order asc'''

        # format data
        df = pd.read_sql(sql, db_session.bind)
        return df.to_dict(orient='records')

    def get_tag_defs(self):

        sql = "select name, usage_count from tag_defs order by usage_count desc"
        res = db_session.execute(sql)
        res = res.fetchall()
        return [{"name": r["name"], "usage_count": r["usage_count"]} for r in res]
    
    def add_new_tag_def(self, tag_name):

        # check for existing tag name
        sql = f'''select count(*) as c from tag_defs where name = "{tag_name}"'''
        res = db_session.execute(sql)
        res = res.fetchone()
        if int(res["c"]) > 0:
            return {"affected_rows": 0}

        sql = f'''Insert into tag_defs (name, usage_count) values("{tag_name}",0)'''
        res = db_session.execute(sql)
        db_session.commit()
        return {"affected_rows": 1}

    def add_tag_to_note(self, note_id, tag_name):

        # check if note has the tag already
        sql = f'''select count(*) as c from notes n 
        inner join tags t on n.id = t.note_id 
        inner join tag_defs td  on t.tagdef_id  = td.id
        where n.id  = {note_id} and td.name = "{tag_name}"'''
        res = db_session.execute(sql)
        res = res.fetchone()
        if int(res["c"]) > 0:
            return {"affected_rows": 0}
        
        # insert tag to note
        sql = f'''insert into tags (note_id, tagdef_id) values({note_id}, (select id from tag_defs where name = "{tag_name}"))'''
        res = db_session.execute(sql)
        db_session.commit()

        # update count for tag def.
        sql = f'''update tag_defs set usage_count = (select count(*) from tags where tagdef_id = (select id from tag_defs where name = "{tag_name}")) where name = "{tag_name}"'''
        res = db_session.execute(sql)
        db_session.commit()

        return {"affected_rows": 1}


    def delete_tag_from_note(self, note_id, tag_name):

        sql = f'''delete t.* from tags t inner join tag_defs td on t.tagdef_id = td.id where t.note_id = {note_id} and td.name = "{tag_name}"'''
        res = db_session.execute(sql)
        db_session.commit()
        return {"affected_rows": 1}

    def get_theme_color_schemes(self):

        # light
        sql = "select id,fc,sec,acc,prim,b_avg from themes where b_avg >= 0.5 order by b_avg"
        light_dict = pd.read_sql(sql, db_session.bind).to_dict(orient='records')

        # dark
        sql = "select id,fc,sec,acc,prim,b_avg from themes where b_avg < 0.5 order by b_avg"
        dark_dict = pd.read_sql(sql, db_session.bind).to_dict(orient='records')

        return {'light': light_dict, 'dark': dark_dict}