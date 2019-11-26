from django.urls import path
from django.views.generic import TemplateView
from .views import daw_edit

urlpatterns = [
    path('', TemplateView.as_view(template_name='daw/index.html'), name='index'),
    path('daw/start/', TemplateView.as_view(template_name='daw/start.html'), name='daw_start'),
    path('daw/new/', TemplateView.as_view(template_name='daw/DAW.html'), name='daw_new'),
    path('daw/<uuid:id>/', daw_edit, name='daw_edit'),
]
