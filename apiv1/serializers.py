from daw.lib.constants import artists, major_keys, minor_keys
from daw.lib.suggester import generate_chord_prog
from daw.models import Project
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

keys = major_keys + minor_keys


class ChordProgressionSerializer(serializers.Serializer):
    """コード進行を返すためのシリアライザ"""

    artist = serializers.ChoiceField(choices=artists)
    key = serializers.ChoiceField(choices=keys)
    #出⼒時に get_chord_progression() が呼ばれる
    chord_progression = serializers.SerializerMethodField()

    def get_chord_progression(self, obj):
        return generate_chord_prog(obj['artist'], obj['key'])


class ProjectSerializer(serializers.ModelSerializer):
    """プロジェクトデータ用のシリアライザ"""

    author_email = serializers.ReadOnlyField(source='author.email')
    melody_data = serializers.JSONField(label='メロディデータ', allow_null=True)

    class Meta:
        model = Project
        exclude = ['author']
        validators = [
            # authorとproject_nameでユニークになっていることを検証
            UniqueTogetherValidator(
                queryset = Project.objects.all(),
                fields = ('author', 'project_name'),
                message='作成者とプロジェクト名でユニークになっていなければいけません。'
            ),
        ]
        extra_kwargs = {
            'created_at': {
                'read_only': True,
            },
            'updated_at': {
                'read_only': True,
            },
        }
