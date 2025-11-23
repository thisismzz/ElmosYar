from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns= [
    path('signup/', views.signup, name='signup'),
    path('login/', views.Login.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', views.Logout.as_view(), name='logout'),
    path('profile/', views.UserInfoView.as_view(), name='user_profile'),
    path('profile/<str:username>/', views.get_other_user_profile)
]