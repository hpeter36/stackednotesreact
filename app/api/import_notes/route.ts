import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter, dbOrm } from "@/db";
import { EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";
import { NoteElementInput } from "@/components/NoteElement";
import { Input } from "postcss";
import { dbAddNewNote } from "@/db/sql_queries";

type ImportNotesApiInputs = {
	rootNoteId: number,
	notesData: NoteElementInput[]
}

export async function POST(request: Request) {

  // user checking
  const user = await getUserOnServer();
  if (!user)
    return getApiResponse(
      "Error when importing note elements, the user is not authenticated",
      EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
      401
    );

	const inputData: ImportNotesApiInputs = await request.json();

	// init, set first(root) element
	const addedIdsToDb: { idTmp: number; idDb: number }[] = [
        { idTmp: inputData.rootNoteId, idDb:  inputData.rootNoteId },
      ];

      // process parents(1st level)
      for (const noteParent of inputData.notesData) {
        // insert to db if not already
        if (addedIdsToDb.findIndex((d) => d.idTmp === noteParent.id) === -1) {
          // get parent id
          const parentId = addedIdsToDb.find(
            (dDb) => dDb.idTmp === noteParent.parentId
          );
          if (!parentId) { // !!!
            console.error(
              `Error when inserting notes to db, db parent id cannot be retrieved from tmp parent id(${noteParent.parentId})`
            );
            return;
          }

          // add note to db
		  const insertedId = await dbAddNewNote(parentId.idDb.toString(), noteParent.title, user.id)
		  addedIdsToDb.push({ idTmp: noteParent.id, idDb: insertedId as any });
        }

        // process parents(2nd level)
        for (const noteChild of noteParent.childrenElements) {
          // insert to db if not already

          if (addedIdsToDb.findIndex((d) => d.idTmp === noteChild.id) === -1) {
            // get parent id
            const parentId = addedIdsToDb.find(
              (d) => d.idTmp === noteChild.parentId
            );
            if (!parentId) { // !!!
              console.error(
                `Error when inserting notes to db, db parent id cannot be retrieved from tmp parent id(${noteChild.parentId})`
              );
              return;
            }

            // add note to db
			const insertedId = await dbAddNewNote(parentId.idDb.toString(), noteChild.title, user.id)
			addedIdsToDb.push({ idTmp: noteChild.id, idDb: insertedId});
          }
        }
      }

  return getApiResponse("", EnumApiResponseStatus.STATUS_CREATED, 201);
}
