from django.urls import path
from .views import (
    company_research,
    company_list,
    customer_report,
    company_delete,
    company_report,
    reports_list,
    report_detail,
    report_update,
    report_delete
)

app_name = 'companies'

urlpatterns = [
    # Company research endpoint
    path('research/', company_research, name='company-research'),
    
    # Company list endpoint - gives detailed information about every company
    path('', company_list, name='company-list'),
    # Company delete endpoint
    path('<int:company_id>/', company_delete, name='company-delete'),
    
    # Company report endpoint - get existing report for a company
    path('<int:company_id>/report/', company_report, name='company-report'),
    
    # Customer report endpoint - uses Cerebras inference for detailed reports
    path('customer-report/', customer_report, name='customer-report'),
    
    # Reports management endpoints
    path('reports/', reports_list, name='reports-list'),
    path('reports/<int:report_id>/', report_detail, name='report-detail'),
    path('reports/<int:report_id>/update/', report_update, name='report-update'),
    path('reports/<int:report_id>/delete/', report_delete, name='report-delete'),
]
