from django.urls import path, include
from rest_framework import routers
from apiv1 import views

router = routers.SimpleRouter()
router.register('projects', views.ProjectViewSet)

app_name = 'apiv1'
urlpatterns = [
    path('chordprog/', views.ChordProgressionGenerateAPIView.as_view()),
    path('', include(router.urls))
]
