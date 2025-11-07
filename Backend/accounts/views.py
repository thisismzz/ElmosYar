from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm
from django.contrib import messages
from django.contrib.auth import login

def signupView(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid(): 
            user = form.save(commit=False)
            
            # Approval process
            # ...
            
            user.save()
            messages.success(request, "Registeration was successful!")
            # return redirect('')
    
    else:
        form = CustomUserCreationForm()
        return render(request, 'signup.html', {'form' : form})