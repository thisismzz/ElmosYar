from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
from .models import Planner, Task
from .serializer import TaskSerializer, PlannerSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_planner(request):
    serializer = PlannerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"error" : False,
                         "message" : "پلنر با موفقیت ساخته شد",
                         "code" : "PLANNER_CREATE_SUCCESS",
                         "data" : serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"error" : True,
                     "message" : "مقادیر وارد شده نامعتبر است",
                     "code" : "PLANNER_CREATE_FAILED",
                     "details" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_planner(request, planner_id):
    try:
        planner = Planner.objects.get(id=planner_id, user=request.user)
    except Planner.DoesNotExist:
        return Response({"error" : True,
                         "message" : "پلنر یافت نشد",
                         "code" : "PLANNER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    planner.delete()
    return Response({"error" : False,
                     "message" : "پلنر با موفقیت حذف شد",
                     "code" : "PLANNER_DELETE_SUCCESS"}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_planner(request, planner_id):
    try:
        planner = Planner.objects.get(id=planner_id, user=request.user)
    except Planner.DoesNotExist:
        return Response({"error" : True,
                         "message" : "پلنر یافت نشد",
                         "code" : "PLANNER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PlannerSerializer(planner, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"error" : False,
                         "message" : "پلنر با موفقیت ویرایش شد",
                         "code" : "PLANNER_UPDATE_SUCCESS",
                         "data" : serializer.data}, status=status.HTTP_200_OK)
        
    return Response({"error" : True,
                     "message" : "مقادیر وارد شده نامعتبر است",
                     "code" : "PLANNER_UPDATE_FAILED",
                     "details" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task(request, planner_id):
    try:
        planner = Planner.objects.get(id=planner_id, user=request.user)
    except Planner.DoesNotExist:
        return Response({"error" : True,
                         "message" : "پلنر یافت نشد",
                         "code" : "PLANNER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(planner=planner)
        return Response({"error" : False,
                        "message" : "تسک جدید با موفقیت ساخته شد",
                        "code" : "TASK_CREATE_SUCCESS",
                        "data" : serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"error" : True,
                     "message" : "مقادیر وارد شده نامعتبر است",
                     "code" : "TASK_CREATE_FAILED",
                     "details" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id, planner__user=request.user)
    except Task.DoesNotExist:
        return Response({"error" : True,
                         "message" : "تسک یافت نشد",
                         "code" : "TASK_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"error" : False,
                        "message" : "تسک با موفقیت ویرایش شد",
                        "code" : "TASK_UPDATE_SUCCESS",
                        "data" : serializer.data}, status=status.HTTP_200_OK)
        
    return Response({"error" : True,
                     "message" : "مقادیر وارد شده نامعتبر است",
                     "code" : "TASK_UPDATE_FAILED",
                     "details" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id, planner__user=request.user)
    except Task.DoesNotExist:
        return Response({"error" : True,
                         "message" : "تسک یافت نشد",
                         "code" : "TASK_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    task.delete()
    return Response({"error" : False,
                     "message" : "تسک با موفقیت حذف شد",
                     "code" : "TASK_DELETE_SUCCESS"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_planner(request, planner_id):
    try:
        planner = Planner.objects.get(id=planner_id, user=request.user)
    except Planner.DoesNotExist:
        return Response({"error" : True,
                         "message" : "پلنر یافت نشد",
                         "code" : "PLANNER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    tasks = planner.tasks.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response({"error" : False,
                    "message" : "پلنر با موفقیت یافت شد",
                    "code" : "TASK_FOUND",
                    "data" : serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_planner_to_drive(request, planner_id):
    access_token = request.data.get("access_token")
    if not access_token:
        return Response({"error": True,
                         "message" : "اکسس توکن الزامی است",
                         "code" : "TOKEN_INVALID"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        planner = Planner.objects.get(id=planner_id, user=request.user)
    except Planner.DoesNotExist:
        return Response({"error" : True,
                         "message" : "پلنر یافت نشد",
                         "code" : "PLANNER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    data = PlannerSerializer(planner).data
    file_content = json.dumps(data, ensure_ascii=False, indent=2)
    media = MediaInMemoryUpload(file_content.encode('utf-8'), mimetype='application/json')

    credentials = Credentials(token=access_token)
    drive_service = build('drive', 'v3', credentials=credentials)

    folder_name = 'ElmosYar-planners'
    folder_id = None

    response = drive_service.files().list(
        q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces='drive',
        fields='files(id, name)').execute()

    if response['files']:
        folder_id = response['files'][0]['id']
    else:
        folder_metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder"}
        
        folder = drive_service.files().create(body=folder_metadata, fields='id').execute()
        folder_id = folder['id']

    file_metadata = {
        "name": f"{planner.title}.json",
        "parents": [folder_id],
        "mimeType": "application/json"}

    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, name').execute()

    data = {"file_id": uploaded_file['id'], "file_name": uploaded_file['name']}
    return Response({"error" : False,
                     "message" : 'پلنر با موفقیت آپلود شد',
                     "code" : "PLANNER_EXPORT_SUCCESS",
                     "data" : {"file_id": uploaded_file['id'], "file_name": uploaded_file['name']}}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_planner_from_drive(request):
    access_token = request.data.get("access_token")
    if not access_token:
        return Response({"error": True,
                         "message": "اکسس توکن الزامی است",
                         "code": "TOKEN_INVALID"}, status=status.HTTP_400_BAD_REQUEST)

    file_id = request.data.get("file_id")
    if not file_id:
        return Response({"error": True,
                         "message" : "آیدی فایل الزامی است",
                         "code" : "PLANNER_IMPORT_FAILED"}, status=status.HTTP_400_BAD_REQUEST)

    credentials = Credentials(token=access_token)
    drive_service = build("drive", "v3", credentials=credentials)

    file = drive_service.files().get_media(fileId=file_id).execute()
    data = json.loads(file.decode('utf-8'))
    
    planner = Planner.objects.create(
        user=request.user,
        title=data.get("title", "Imported Planner"),
        description=data.get("description", ""))

    for task_data in data.get("tasks", []):
        Task.objects.create(
            planner=planner,
            title=task_data["title"],
            description=task_data.get("description", ""),
            start_date=task_data["start_date"],
            end_date=task_data["end_date"],
            is_done=task_data.get("is_done", False)
        )

    serializer = PlannerSerializer(planner)
    return Response({"error" : False,
                    "message" : "پلنر با موفقیت ساخته شد",
                    "code" : "PLANNER_IMPORT_SUCCESS",
                    "data" : serializer.data}, status=status.HTTP_201_CREATED)

