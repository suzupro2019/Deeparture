from django.shortcuts import render, get_object_or_404
from django.views import View
from .models import Project


class ProjectEditView(View):
    def get(self, request, *args, **kwargs):
        project_id = kwargs['id']
        projects = Project.objects.filter(author=request.user)
        project = get_object_or_404(projects, id=project_id)
        context = {
            'project': project,
        }
        return render(request, 'daw/DAW.html', context)

daw_edit = ProjectEditView.as_view()
