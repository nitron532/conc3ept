import gspread
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
from multiprocessing import Process
from graph import topologicalSort

load_dotenv()

"""
visual editing (dragging things around) to edit google sheet lesson plan
have a visual "preview" of the google sheet before its created where you can drag things around to edit
create a folder for the current course to put the lesson plans in
"""


def get_or_create_folder(drive, folder_name, parent_id="root"):
    # 1. Search for existing folder
    query = (
        f"name = '{folder_name}' and "
        f"mimeType = 'application/vnd.google-apps.folder' and "
        f"'{parent_id}' in parents and "
        f"trashed = false"
    )

    results = drive.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name)",
    ).execute()

    files = results.get("files", [])

    if files:
        # Folder exists (use first match)
        return files[0]["id"]

    # 2. Create folder
    folder_metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }

    folder = drive.files().create(
        body=folder_metadata,
        fields="id",
    ).execute()

    return folder["id"]


credentials = {
    "installed": {
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"]
    }
}



def authorizeAndCreate(result,orderedData, subNodes):
    try:
        gc, authorized_user = gspread.oauth_from_dict(
            credentials,
            scopes=[
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.file",
            ],
        )


        drive = build("drive", "v3", credentials=gc.http_client.auth)
        folder_id = get_or_create_folder(drive, "Conc3ept Lesson Plans")
        lp = gc.create("Example Course")

        drive.files().update(
            fileId=lp.id,
            addParents=folder_id,
            removeParents="root",
            fields="id, parents",
        ).execute()

        worksheet = lp.get_worksheet(0)

        worksheet.format("A1:A6",{
            "wrapStrategy": "WRAP",
            "backgroundColor":{
                "red":242, 
                "green":199, 
                "blue":99
            }
        })
        worksheet.update_acell('A1', 'Start time')
        worksheet.update_acell("B1", "Duration")
        worksheet.update_acell("C1", "What")
        worksheet.update_acell("D1", "Slides")
        worksheet.update_acell("E1", "Discussion Topic")
        worksheet.update_acell("F1", "Objectives")
        i = 1
        while i < len(orderedData)+1:
            worksheet.update_acell(f"F{i+1}", f"{orderedData[i-1]}")
            worksheet.update_acell(f"B{i+1}", f"0:0{i+1}")
            i+=1
        worksheet.update_acell(f"A{i}", "TOTAL")
        worksheet.update_acell(f"B{i}", "sum")

        # print(lp.url)
        result["success"] = "json describing success, url of lesson plan too"
        #set result["success"] to credentials gc

    except Exception as e: #doesnt catch when the user closes the tab or "goes back to safety", but does when cancel clicked on permission screen
        print("Authorization failed, exception given: ", e)
        result["error"] = e




def createLessonPlan(data):
    result = {"success": "", "error": ""}
    idToName = {}
    for i in range(len(data["nodes"])):
        idToName[int(data["nodes"][i][0])] = data["nodes"][i][1]

    orderedIds = topologicalSort([node[0] for node in data["nodes"]],data["edges"])
    orderedLabels = [idToName[id] for id in orderedIds]
    p = Process(target = authorizeAndCreate, args = (result,orderedLabels,data["subNodes"],))
    p.start()
    p.join(timeout=45)
    if p.is_alive():
        p.terminate()
        print("Authorization timed out or was abandoned by user.")
        raise RuntimeError("Oauth flow aborted")
    elif result["error"]:
        print("An error occured in the authorization flow: ", result["error"]) #return later?
    else:
        print(result["success"]) #eventually return success or something


if __name__ == "__main__":
    createLessonPlan()