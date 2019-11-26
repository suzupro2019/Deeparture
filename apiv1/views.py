from django_filters import rest_framework as filters
from rest_framework import status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import ChordProgressionSerializer, ProjectSerializer
from daw.models import Project


class ChordProgressionGenerateAPIView(views.APIView):
    """コード進行を生成するためのAPIクラス"""

    def post(self, request, *args, **kwargs):
        """コード進行を生成するためのAPIに対応するハンドラメソッド"""

        permission_classes = [IsAuthenticated]
        # シリアライザオブジェクトを作成
        serializer = ChordProgressionSerializer(data=request.data)
        # バリデーションを実行
        serializer.is_valid(raise_exception=True)
        # レスポンスオブジェクトを作成して返す
        return Response(serializer.data, status.HTTP_201_CREATED)


class ProjectFilter(filters.FilterSet):
    """プロジェクトモデル用のフィルタクラス"""

    # TODO: テンポの以上、以下など、フィルタをよしなに定義する

    class Meta:
        model = Project
        exclude = ['id', 'author', 'melody_data']


class ProjectViewSet(viewsets.ModelViewSet):
    """プロジェクトモデルのCRUD用APIクラス"""

    permission_classes = [IsAuthenticated]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ProjectFilter

    def list(self, request, *args, **kwargs):
        self.queryset = Project.objects.filter(author=request.user)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        self.queryset = Project.objects.filter(author=request.user)
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # シリアライザではauthorを設定できないため、
        # 明示的に新しいインスタンスを生成してシリアライザに渡す
        project = Project(author=request.user)
        serializer = self.serializer_class(project, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        # 更新時に更新日時を設定する
        serializer.save().update()

    def destroy(self, request, *args, **kwargs):
        self.queryset = Project.objects.filter(author=request.user)
        return super().destroy(request, *args, **kwargs)
