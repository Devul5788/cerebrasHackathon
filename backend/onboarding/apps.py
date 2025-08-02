from django.apps import AppConfig


class OnboardingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'onboarding'
    verbose_name = 'Onboarding'

    def ready(self):
        """
        Import any app-specific signals or configurations here
        """
        pass
