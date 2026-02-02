# API Request Examples with cURL

## Base URL
```bash
curl http://89.106.206.119:8000/api
```

## 🔐 Authentication Endpoints

### Sign Up
```bash
curl -X POST http://89.106.206.119:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "",
    "last_name": "",
    "profile_picture": null,
    "bio": null,
    "student_id": null,
    "is_email_verified": false,
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Login
```bash
curl -X POST http://89.106.206.119:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "johndoe",
    "password": "securepassword123",
    "rememberMe": true
  }'
```

**Response Headers:**
```
Set-Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/token/refresh/; Max-Age=604800
```

**Response Body:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "",
    "last_name": "",
    "profile_picture": null,
    "bio": null,
    "student_id": null,
    "is_email_verified": true,
    "followers_count": 5,
    "following_count": 3,
    "posts_count": 12,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
```bash
curl -X POST http://89.106.206.119:8000/api/logout/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

**Response Headers:**
```
Set-Cookie: refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict; Path=/api/token/refresh/
```

**Response Body:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Verify Token
```bash
curl -X POST http://89.106.206.119:8000/api/token/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

### Refresh Token
```bash
curl -X POST http://89.106.206.119:8000/api/token/refresh/ \
  -H "Content-Type: application/json"
```

**Response Headers:**
```
Set-Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/token/refresh/; Max-Age=604800
```

**Response Body:**
```json
{
  "success": true,
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Email Verification
```bash
curl http://89.106.206.119:8000/api/verify-email/0c0ce97e-48b4-4ef9-822a-71361f8ea018/
```

**Response Headers:**
```
Set-Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/token/refresh/; Max-Age=86400
```

**Response Body:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "",
    "last_name": "",
    "profile_picture": null,
    "bio": null,
    "student_id": null,
    "is_email_verified": true,
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 0,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Resend Verification Email
```bash
curl -X POST http://89.106.206.119:8000/api/resend-verification-email/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your email."
}
```

### Request Password Reset
```bash
curl -X POST http://89.106.206.119:8000/api/password-reset/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "If this email exists in our system, a password reset link has been sent"
}
```

### Reset Password
```bash
curl -X POST http://89.106.206.119:8000/api/password-reset/0c0ce97e-48b4-4ef9-822a-71361f8ea018/ \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newsecurepassword123",
    "password_confirm": "newsecurepassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login."
}
```

## 👤 Profile Endpoints

### Get Current User Profile
```bash
curl -X GET http://89.106.206.119:8000/api/profile/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "/media/profiles/john.jpg",
    "bio": "Software developer and tech enthusiast",
    "info": "student",
    "phone_number" : "29385930",
    "student_id": "12345",
    "is_email_verified": true,
    "followers_count": 15,
    "following_count": 8,
    "posts_count": 25,
    "is_following": false,
    "is_me": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Public Profile
```bash
curl -X GET http://89.106.206.119:8000/api/users/janedoe/profile/
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "janedoe",
    "first_name": "Jane",
    "last_name": "Doe",
    "profile_picture": "/media/profiles/jane.jpg",
    "bio": "Digital artist and designer",
    "student_id": null,
    "is_email_verified": true,
    "followers_count": 120,
    "following_count": 45,
    "posts_count": 67,
    "is_following": true,
    "is_me": false,
    "created_at": "2024-01-10T08:15:00Z"
  }
}
```

### Update Profile
```bash
curl -X PUT http://89.106.206.119:8000/api/profile/update/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "janedoe",
    "first_name": "Jane",
    "last_name": "Doe",
    "bio": "Senior software engineer at Tech Corp",
    "student_id": "12345",
    "info": "student",
    "phone_number" : "29385930"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "profile_picture": "/media/profiles/john.jpg",
    "bio": "Senior software engineer at Tech Corp",
    "student_id": "12345",
    "is_email_verified": true,
    "followers_count": 15,
    "following_count": 8,
    "posts_count": 25,
    "is_following": false,
    "is_me": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update Profile Picture
```bash
curl -X POST http://89.106.206.119:8000/api/profile/update-picture/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -F "profile_picture=@/path/to/new_photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "profile_picture": "/media/profiles/new_photo.jpg"
}
```

### Delete Profile Picture
```bash
curl -X DELETE http://89.106.206.119:8000/api/profile/delete-picture/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

## 📝 Post Endpoints

### Example Format JSON File for Regex Validation
**format.json for "products" category:**
```json
{
  "name": "^[a-zA-Z0-9\\s]{3,100}$",
  "price": "^[0-9]+(\\.[0-9]{1,2})?$",
  "status": "^(available|out of stock|discontinued)$",
  "category": "^(electronics|clothing|books|home)$",
  "rating": "^[1-5](\\.[0-9])?$",
  "stock": "^[0-9]+$"
}
```

### Category Format Response with Anonymous Field
```json
{
  "success": true,
  "category": "products",
  "format": {
    "name": "^[a-zA-Z0-9\\s]{3,100}$",
    "price": "^[0-9]+(\\.[0-9]{1,2})?$"
  },
  "last_updated": "2024-01-16T10:30:00Z",
  "is_anonymous": false
}
```

#### **⚠️ Related Error Responses**

### Invalid Search JSON Format
```json
{
  "success": false,
  "message": "Invalid JSON in search parameter"
}
```

### Category Required for Advanced Search
```json
{
  "success": false,
  "message": "Category is required for advanced search"
}
```

### No Format Found for Category
```json
{
  "success": false,
  "message": "No format found for category: programming"
}
```

### Invalid Regex Pattern in Search
```json
{
  "success": false,
  "message": "Error in advanced search"
}
```

### Attribute Validation Failed
```json
{
  "success": false,
  "message": "Attribute 'price' does not match format pattern"
}
```

### Required Attributes Missing
```json
{
  "success": false,
  "message": "Attribute 'title' is required and cannot be removed"
}
```

### Access to Anonymous Category Denied
```json
{
  "success": false,
  "message": "Access to posts in anonymous categories is not allowed for authenticated users"
}
```

### Cannot Modify Anonymous Category Post
```json
{
  "success": false,
  "message": "Cannot delete posts in anonymous categories"
}
```

### 📊 Post Attributes Structure

Posts now support structured data through the `attributes` field. This allows for advanced filtering and validation based on category-specific formats.

#### Example Post with Attributes:
```json
{
  "id": 45,
  "category": "tutorials",
  "attributes": {
    "difficulty": "intermediate",
    "duration": "2 hours",
    "prerequisites": ["python", "django basics"],
    "resources": [
      {"type": "video", "url": "https://example.com/video"},
      {"type": "code", "url": "https://github.com/example"}
    ],
    "rating": 4.5,
    "tags": ["django", "rest", "api"]
  }
}
```

### Search Parameters:
- Use `search` query parameter with JSON object containing key-regex pairs
- Regex patterns are applied to post attributes
- Both format validation and search regex are applied
- Category must be specified for advanced search
- Posts in anonymous categories are hidden from authenticated users

### Validation Flow:
1. When creating/updating a post with attributes
2. System checks if category has a format file
3. Validates each attribute against corresponding regex pattern in format
4. Returns error if validation fails
5. During search, applies both format validation and search criteria

### Anonymous Categories Rules:
1. Posts in anonymous categories are invisible to authenticated users
2. Author information is hidden for posts in anonymous categories
3. Cannot perform actions (like, save, repost) on anonymous category posts
4. Anonymous flag can be set when creating/updating category formats

### Get Posts (with pagination and filters)
```bash
curl -X GET "http://89.106.206.119:8000/api/posts/?category=programming&search={\"difficulty\":\"^(easy|medium)$\",\"language\":\"^python$\"}" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 45,
      "author": 1,
      "author_info": {
        "id": 1,
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "profile_picture": "/media/profiles/john.jpg",
        "is_email_verified": true,
        "followers_count": 15,
        "following_count": 8,
        "posts_count": 25
      },
      "category": "programming",
      "category_info": {
        "id": 1,
        "name": "programming",
        "anonymous": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "attributes": {
        "difficulty": "easy",
        "language": "python",
        "duration": "30min"
      },
      "likes_count": 12,
      "dislikes_count": 0,
      "comments_count": 5,
      "reposts_count": 3,
      "replies_count": 2,
      "user_reaction": "like",
      "is_saved": false,
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_count": 45,
    "has_next": true,
    "has_previous": false
  }
}
```

### Get Posts from Anonymous Category (for non-authenticated users)
```bash
curl -X GET "http://89.106.206.119:8000/api/posts/?category=confessions"
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 67,
      "author": 3,
      "author_info": null,
      "category": "confessions",
      "category_info": {
        "id": 2,
        "name": "confessions",
        "anonymous": true,
        "created_at": "2024-01-16T09:15:00Z",
        "updated_at": "2024-01-16T09:15:00Z"
      },
      "attributes": {
        "message": "I have something important to share",
        "emotion": "anxious"
      },
      "likes_count": 5,
      "dislikes_count": 0,
      "comments_count": 3,
      "reposts_count": 0,
      "replies_count": 0,
      "user_reaction": null,
      "is_saved": false,
      "created_at": "2024-01-16T11:30:00Z",
      "updated_at": "2024-01-16T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 2,
    "total_count": 25,
    "has_next": true,
    "has_previous": false
  }
}
```

### Get Post Detail
```bash
curl -X GET http://89.106.206.119:8000/api/posts/1/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "author": 1,
    "author_info": {
      "id": 1,
      "username": "johndoe",
      "profile_picture": "/media/profile_pictures/john.jpg"
    },
    "category": "tech",
    "category_info": {
      "id": 1,
      "name": "tech",
      "anonymous": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "media": [
      {
        "id": 1,
        "url": "/media/posts/project_screenshot.jpg",
        "media_type": "image",
        "caption": "",
        "order": 0,
        "file_size": 2048576
      }
    ],
    "mentions": [],
    "attributes": {
      "type": "project",
      "status": "launched"
    },
    "likes_count": 25,
    "dislikes_count": 2,
    "comments_count": 8,
    "reposts_count": 3,
    "replies_count": 2,
    "user_reaction": "like",
    "is_saved": false,
    "comments": [
      {
        "id": 1,
        "user": 2,
        "user_info": {
          "id": 2,
          "username": "janedoe",
          "profile_picture": "/media/profile_pictures/jane.jpg"
        },
        "content": "Great work! This looks amazing! 👏",
        "likes_count": 2,
        "dislike_count": 1,
        "replies_count": 1,
        "is_liked": false,
        "is_disliked": false,
        "created_at": "2024-01-15T16:00:00Z"
      }
    ],
    "replies": [
      {
        "id": 3,
        "author": 2,
        "author_info": {
          "id": 2,
          "username": "janedoe",
          "profile_picture": "/media/profile_pictures/jane.jpg"
        },
        "category": "tech",
        "media": [],
        "mentions": [],
        "attributes": {
          "type": "reply"
        },
        "likes_count": 2,
        "dislikes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "replies_count": 0,
        "user_reaction": null,
        "is_saved": false,
        "created_at": "2024-01-15T16:30:00Z",
        "updated_at": "2024-01-15T16:30:00Z"
      }
    ],
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### Create Post (with category auto-creation)
```bash
curl -X POST http://89.106.206.119:8000/api/posts/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: multipart/form-data" \
  -F "category=advanced-python" \
  -F "attributes={\"difficulty\":\"medium\",\"language\":\"python\",\"duration\":\"45min\",\"topics\":[\"classes\",\"inheritance\",\"polymorphism\"]}" \
  -F "media=@tutorial.jpg"
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 56,
    "author": 1,
    "author_info": {
      "id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/john.jpg",
      "is_email_verified": true,
      "followers_count": 15,
      "following_count": 8,
      "posts_count": 27
    },
    "created_at": "2024-01-16T09:15:00Z",
    "updated_at": "2024-01-16T09:15:00Z",
    "mentions": [],
    "media": [
      {
        "id": 12,
        "url": "/media/posts/tutorial.jpg",
        "media_type": "image",
        "caption": "",
        "order": 0,
        "file_size": 1048576
      }
    ],
    "category": 3,
    "category_info": {
      "id": 3,
      "name": "advanced-python",
      "anonymous": false,
      "created_at": "2024-01-16T09:15:00Z",
      "updated_at": "2024-01-16T09:15:00Z"
    },
    "parent": null,
    "is_repost": false,
    "original_post": null,
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "replies_count": 0,
    "user_reaction": null,
    "is_saved": false,
    "attributes": {
      "difficulty": "medium",
      "language": "python",
      "duration": "45min",
      "topics": ["classes", "inheritance", "polymorphism"]
    }
  }
}
```

### Like Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/like/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Liked",
  "likes_count": 26,
  "dislikes_count": 2,
  "user_reaction": "like"
}
```

### Dislike Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/dislike/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Disliked",
  "likes_count": 24,
  "dislikes_count": 3,
  "user_reaction": "dislike"
}
```

### Repost Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/repost/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 4,
    "author": 2,
    "author_info": {
      "id": 2,
      "username": "janedoe",
      "profile_picture": "/media/profile_pictures/jane.jpg"
    },
    "category": 1,
    "category_info": {
      "id": 1,
      "name": "tech",
      "anonymous": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "media": [],
    "mentions": [],
    "attributes": {
      "type": "project",
      "status": "launched"
    },
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "replies_count": 0,
    "user_reaction": null,
    "is_saved": false,
    "is_repost": true,
    "original_post": {
      "id": 1,
      "author": 1,
      "author_info": {
        "id": 1,
        "username": "johndoe"
      }
    },
    "created_at": "2024-01-15T18:30:00Z",
    "updated_at": "2024-01-15T18:30:00Z"
  }
}
```

### Get Post Thread
```bash
curl -X GET http://89.106.206.119:8000/api/posts/1/thread/
```

**Response:**
```json
{
  "success": true,
  "thread": {
    "id": 1,
    "author": 1,
    "author_info": {
      "id": 1,
      "username": "johndoe",
      "profile_picture": "/media/profile_pictures/john.jpg"
    },
    "category": "tech",
    "category_info": {
      "id": 1,
      "name": "tech",
      "anonymous": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "media": [
      {
        "id": 1,
        "url": "/media/posts/project_screenshot.jpg",
        "media_type": "image",
        "caption": "",
        "order": 0,
        "file_size": 2048576
      }
    ],
    "mentions": [],
    "attributes": {
      "type": "project",
      "status": "launched"
    },
    "likes_count": 25,
    "dislikes_count": 2,
    "comments_count": 8,
    "reposts_count": 3,
    "replies_count": 2,
    "user_reaction": "like",
    "is_saved": false,
    "replies": [
      {
        "id": 3,
        "author": 2,
        "author_info": {
          "id": 2,
          "username": "janedoe",
          "profile_picture": "/media/profile_pictures/jane.jpg"
        },
        "category": "tech",
        "category_info": {
          "id": 1,
          "name": "tech",
          "anonymous": false,
          "created_at": "2024-01-15T10:30:00Z",
          "updated_at": "2024-01-15T10:30:00Z"
        },
        "media": [],
        "mentions": [],
        "attributes": {
          "type": "reply"
        },
        "likes_count": 2,
        "dislikes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "replies_count": 0,
        "user_reaction": null,
        "is_saved": false,
        "created_at": "2024-01-15T16:30:00Z",
        "updated_at": "2024-01-15T16:30:00Z"
      }
    ],
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### Save Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/save/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Post saved successfully"
}
```

### Unsave Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/unsave/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Post unsaved successfully"
}
```

### Get Saved Posts
```bash
curl -X GET "http://89.106.206.119:8000/api/posts/saved/?page=1&per_page=10" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "author": 1,
      "author_info": {
        "id": 1,
        "username": "johndoe",
        "profile_picture": "/media/profile_pictures/john.jpg"
      },
      "category": 1,
      "category_info": {
        "id": 1,
        "name": "tech",
        "anonymous": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "media": [
        {
          "id": 1,
          "url": "/media/posts/project_screenshot.jpg",
          "media_type": "image",
          "caption": "",
          "order": 0,
          "file_size": 2048576
        }
      ],
      "mentions": [],
      "attributes": {
        "type": "project",
        "status": "launched"
      },
      "likes_count": 25,
      "dislikes_count": 2,
      "comments_count": 8,
      "reposts_count": 3,
      "replies_count": 2,
      "user_reaction": "like",
      "is_saved": true,
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 1,
    "total_count": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

### Delete Post
```bash
curl -X DELETE http://89.106.206.119:8000/api/posts/1/delete/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### Update Post
```bash
curl -X PUT http://89.106.206.119:8000/api/posts/56/update/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "category": "advanced-python-updated",
    "attributes": {
      "difficulty": "hard",
      "language": "python",
      "duration": "60min",
      "topics": ["classes", "inheritance", "polymorphism", "decorators"],
      "prerequisites": ["python basics", "functions"]
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "post": {
    "id": 56,
    "author": 1,
    "author_info": {
      "id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/john.jpg",
      "is_email_verified": true,
      "followers_count": 15,
      "following_count": 8,
      "posts_count": 27
    },
    "created_at": "2024-01-16T09:15:00Z",
    "updated_at": "2024-01-16T10:30:00Z",
    "category": 4,
    "category_info": {
      "id": 4,
      "name": "advanced-python-updated",
      "anonymous": false,
      "created_at": "2024-01-16T10:30:00Z",
      "updated_at": "2024-01-16T10:30:00Z"
    },
    "attributes": {
      "difficulty": "hard",
      "language": "python",
      "duration": "60min",
      "topics": ["classes", "inheritance", "polymorphism", "decorators"],
      "prerequisites": ["python basics", "functions"]
    },
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "replies_count": 0,
    "user_reaction": null,
    "is_saved": false
  }
}
```

### Get Posts by Category
```bash
curl -X GET "http://89.106.206.119:8000/api/posts/category/tech/?page=1&per_page=10"
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "author": 1,
      "author_info": {
        "id": 1,
        "username": "johndoe",
        "profile_picture": "/media/profile_pictures/john.jpg"
      },
      "category": 1,
      "category_info": {
        "id": 1,
        "name": "tech",
        "anonymous": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "media": [
        {
          "id": 1,
          "url": "/media/posts/project_screenshot.jpg",
          "media_type": "image",
          "caption": "",
          "order": 0,
          "file_size": 2048576
        }
      ],
      "mentions": [],
      "attributes": {
        "type": "project",
        "status": "launched"
      },
      "likes_count": 25,
      "dislikes_count": 2,
      "comments_count": 8,
      "reposts_count": 3,
      "replies_count": 2,
      "user_reaction": "like",
      "is_saved": false,
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "category": "tech",
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 5,
    "total_count": 48,
    "has_next": true,
    "has_previous": false
  }
}
```

### Get User Posts
```bash
curl -X GET "http://89.106.206.119:8000/api/users/johndoe/posts/?page=1&per_page=10"
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "author": 1,
      "author_info": {
        "id": 1,
        "username": "johndoe",
        "profile_picture": "/media/profile_pictures/john.jpg"
      },
      "category": 1,
      "category_info": {
        "id": 1,
        "name": "tech",
        "anonymous": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "media": [
        {
          "id": 1,
          "url": "/media/posts/project_screenshot.jpg",
          "media_type": "image",
          "caption": "",
          "order": 0,
          "file_size": 2048576
        }
      ],
      "mentions": [],
      "attributes": {
        "type": "project",
        "status": "launched"
      },
      "likes_count": 25,
      "dislikes_count": 2,
      "comments_count": 8,
      "reposts_count": 3,
      "replies_count": 2,
      "user_reaction": "like",
      "is_saved": false,
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "username": "johndoe",
  "user": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "/media/profile_pictures/john.jpg",
    "bio": "Software developer and tech enthusiast",
    "followers_count": 15,
    "following_count": 8,
    "date_joined": "2024-01-15T10:30:00Z"
  },
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 3,
    "total_count": 25,
    "has_next": true,
    "has_previous": false
  }
}
```

### Upload Category Format (Superusers only)
```bash
curl -X POST http://89.106.206.119:8000/api/posts/formats/upload/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -F "category=products" \
  -F "format_file=@/path/to/format.json"
```

**Response:**
```json
{
  "success": true,
  "message": "Format uploaded successfully",
  "format": {
    "id": 1,
    "category": "products",
    "format_file": "/media/category_formats/format_12345.json",
    "file_url": "/media/category_formats/format_12345.json",
    "created_by": 1,
    "created_by_info": {
      "id": 1,
      "username": "admin"
    },
    "created_at": "2024-01-16T11:00:00Z",
    "updated_at": "2024-01-16T11:00:00Z"
  }
}
```

### Delete Category Format (Superusers only)
```bash
curl -X DELETE http://89.106.206.119:8000/api/posts/formats/products/delete/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Format deleted successfully"
}
```

## 💬 Comment Endpoints 

### Comment on Post
```bash
curl -X POST http://89.106.206.119:8000/api/posts/1/comment/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great work! This looks amazing! 👏"
  }'
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": 1,
    "user": 2,
    "user_info": {
      "id": 2,
      "username": "janedoe",
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/jane.jpg",
      "is_email_verified": true,
      "followers_count": 120,
      "following_count": 45,
      "posts_count": 67
    },
    "post": 1,
    "content": "Great work! This looks amazing! 👏",
    "created_at": "2024-01-15T16:00:00Z",
    "parent": null,
    "likes_count": 0,
    "replies_count": 0,
    "is_liked": false
  },
  "comments_count": 9
}
```


### Like Comment
```bash
curl -X POST http://89.106.206.119:8000/api/comments/1/like/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Liked",
  "likes_count": 12,
  "dislikes_count": 2,
  "is_liked": true,
  "is_disliked": false
}
```

### Dislike Comment
```bash
curl -X POST http://89.106.206.119:8000/api/comments/1/dislike/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Disliked",
  "likes_count": 12,
  "dislikes_count": 2,
  "is_liked": false,
  "is_disliked": true
}
```

### Delete Comment
```bash
curl -X DELETE http://89.106.206.119:8000/api/comments/1/delete/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### Update Comment
```bash
curl -X PUT http://89.106.206.119:8000/api/comments/1/update/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment with more details!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "comment": {
    "id": 1,
    "user": 2,
    "user_info": {
      "id": 2,
      "username": "janedoe",
      "profile_picture": "/media/profile_pictures/jane.jpg"
    },
    "content": "Updated comment with more details!",
    "likes_count": 0,
    "replies_count": 0,
    "is_liked": false,
    "created_at": "2024-01-15T16:00:00Z"
  }
}
```

## 🤝 Social Endpoints

### Follow User
```bash
curl -X POST http://89.106.206.119:8000/api/users/janedoe/follow/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "You are now following janedoe",
  "followers_count": 16
}
```

### Unfollow User
```bash
curl -X POST http://89.106.206.119:8000/api/users/janedoe/unfollow/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "You have unfollowed janedoe",
  "followers_count": 15
}
```

### Get User Followers
```bash
curl -X GET "http://89.106.206.119:8000/api/users/johndoe/followers/?page=1&per_page=10"
```

**Response:**
```json
{
  "success": true,
  "followers": [
    {
      "id": 2,
      "username": "janedoe",
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/jane.jpg",
      "bio": "Digital artist and designer",
      "student_id": null,
      "is_email_verified": true,
      "followers_count": 120,
      "following_count": 45,
      "posts_count": 67,
      "is_following": true,
      "is_me": false,
      "created_at": "2024-01-10T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 2,
    "total_count": 16,
    "has_next": true,
    "has_previous": false
  }
}
```

### Get User Following
```bash
curl -X GET "http://89.106.206.119:8000/api/users/johndoe/following/?page=1&per_page=10"
```

**Response:**
```json
{
  "success": true,
  "following": [
    {
      "id": 2,
      "username": "janedoe",
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/jane.jpg",
      "bio": "Digital artist and designer",
      "student_id": null,
      "is_email_verified": true,
      "followers_count": 120,
      "following_count": 45,
      "posts_count": 67,
      "is_following": true,
      "is_me": false,
      "created_at": "2024-01-10T08:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 1,
    "total_count": 8,
    "has_next": false,
    "has_previous": false
  }
}
```

## 🔔 Notification Endpoints

### Get Notifications
```bash
curl -X GET "http://89.106.206.119:8000/api/notifications/?page=1&per_page=10" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "sender": 2,
      "sender_info": {
        "id": 2,
        "username": "janedoe",
        "first_name": "Jane",
        "last_name": "Doe",
        "profile_picture": "/media/profiles/jane.jpg",
        "is_email_verified": true,
        "followers_count": 120,
        "following_count": 45,
        "posts_count": 67
      },
      "notif_type": "like",
      "post": 1,
      "comment": null,
      "message": "janedoe liked your post",
      "is_read": false,
      "created_at": "2024-01-15T16:30:00Z"
    }
  ],
  "unread_count": 3,
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 1,
    "total_count": 3,
    "has_next": false,
    "has_previous": false
  }
}
```

### Mark Notifications as Read
```bash
curl -X POST http://89.106.206.119:8000/api/notifications/mark-read/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2, 3]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read"
}
```

## 💬 Messaging Endpoints

### Get Conversations
```bash
curl -X GET http://89.106.206.119:8000/api/conversations/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": 1,
      "other_user": {
        "id": 2,
        "username": "janedoe",
        "first_name": "Jane",
        "last_name": "Doe",
        "profile_picture": "/media/profiles/jane.jpg",
        "is_email_verified": true,
        "followers_count": 120,
        "following_count": 45,
        "posts_count": 67
      },
      "last_message": {
        "content": "Looking forward to it!",
        "sender": "janedoe",
        "created_at": "2024-01-15T17:00:00Z",
        "is_read": true
      },
      "unread_count": 0,
      "updated_at": "2024-01-15T17:00:00Z"
    }
  ],
  "count": 1
}
```

### Start Conversation
```bash
curl -X POST http://89.106.206.119:8000/api/conversations/start/janedoe/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": 2,
    "other_user": {
      "id": 2,
      "username": "janedoe",
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/jane.jpg",
      "is_email_verified": true,
      "followers_count": 120,
      "following_count": 45,
      "posts_count": 67
    },
    "last_message": null,
    "unread_count": 0,
    "updated_at": "2024-01-15T18:00:00Z"
  },
  "message": "Conversation started successfully"
}
```

### Send Message
```bash
curl -X POST http://89.106.206.119:8000/api/conversations/1/send/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hey! How are you doing?"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 6,
    "sender": 1,
    "sender_info": {
      "id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "/media/profiles/john.jpg",
      "is_email_verified": true,
      "followers_count": 15,
      "following_count": 8,
      "posts_count": 25
    },
    "content": "Hey! How are you doing?",
    "image": null,
    "file": null,
    "is_read": false,
    "created_at": "2024-01-15T17:05:00Z"
  }
}
```


### Get Conversation Detail
```bash
curl -X GET "http://89.106.206.119:8000/api/conversations/1/?page=1&per_page=20" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": 1,
    "other_user": {
      "id": 2,
      "username": "janedoe",
      "profile_picture": "/media/profile_pictures/jane.jpg"
    },
    "last_message": {
      "content": "Looking forward to it!",
      "sender": "janedoe",
      "created_at": "2024-01-15T17:00:00Z",
      "is_read": true
    },
    "unread_count": 0,
    "updated_at": "2024-01-15T17:00:00Z"
  },
  "messages": [
    {
      "id": 6,
      "sender": {
        "id": 1,
        "username": "johndoe",
        "profile_picture": "/media/profile_pictures/john.jpg"
      },
      "content": "Hey! How are you doing?",
      "image": null,
      "file": null,
      "is_read": true,
      "created_at": "2024-01-15T17:05:00Z"
    },
    {
      "id": 5,
      "sender": {
        "id": 2,
        "username": "janedoe",
        "profile_picture": "/media/profile_pictures/jane.jpg"
      },
      "content": "Looking forward to it!",
      "image": null,
      "file": null,
      "is_read": true,
      "created_at": "2024-01-15T17:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "total_count": 6,
    "has_next": false,
    "has_previous": false
  }
}
```

### Delete Message
```bash
curl -X DELETE http://89.106.206.119:8000/api/messages/1/delete/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### Update Message
```bash
curl -X PUT http://89.106.206.119:8000/api/messages/1/update/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message content!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "message_data": {
    "id": 1,
    "sender": {
      "id": 1,
      "username": "johndoe",
      "profile_picture": "/media/profile_pictures/john.jpg"
    },
    "content": "Updated message content!",
    "image": null,
    "file": null,
    "is_read": true,
    "created_at": "2024-01-15T16:30:00Z"
  }
}
```


## 📁 Category Format Endpoints

### Upload Category Format (Superuser Only)
```bash
curl -X POST http://89.106.206.119:8000/api/posts/formats/upload/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: multipart/form-data" \
  -F "category=programming" \
  -F "format_file=@/path/to/format.json"
```

**Response:**
```json
{
  "success": true,
  "message": "Format uploaded successfully",
  "format": {
    "id": 1,
    "category": "programming",
    "file_url": "/media/category_formats/format_123.json",
    "created_by": 1,
    "created_by_info": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "profile_picture": "/media/profiles/admin.jpg",
      "is_email_verified": true,
      "followers_count": 15,
      "following_count": 8,
      "posts_count": 25
    },
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

### Get Category Format (Public)
```bash
curl -X GET http://89.106.206.119:8000/posts/api/formats/programming/
```

**Response:**
```json
{
  "success": true,
  "category": "programming",
  "format": {
    "required_fields": ["title", "description", "code"],
    "optional_fields": ["tags", "language", "difficulty"],
    "max_length": 5000,
    "allowed_media_types": ["image", "code_snippet"],
    "validation_rules": {
      "title": {
        "min_length": 5,
        "max_length": 200
      },
      "code": {
        "max_size": 10000
      }
    }
  },
  "last_updated": "2024-01-15T12:00:00Z"
}
```

### Delete Category Format (Superuser Only)
```bash
curl -X DELETE http://89.106.206.119:8000/posts/api/formats/programming/delete/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Format deleted successfully"
}
```

### Example Format JSON File
**format.json:**
```json
{
  "required_fields": ["title", "description", "code"],
  "optional_fields": ["tags", "language", "difficulty"],
  "max_length": 5000,
  "allowed_media_types": ["image", "code_snippet"],
  "validation_rules": {
    "title": {
      "min_length": 5,
      "max_length": 200
    },
    "code": {
      "max_size": 10000
    }
  },
  "template": {
    "title": "Post Title",
    "description": "Describe your code...",
    "code": "// Your code here",
    "language": "python",
    "difficulty": "beginner"
  }
}
```

## 🏦 Wallet API Documentation

### 📊 Get User Wallet Balance

#### Request
```bash
curl -X GET http://89.106.206.119:8000/api/wallet/mywallet/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Response
```json
{
  "error": false,
  "message": "کیف پول با موفقیت دریافت شد",
  "code": "USER_WALLET_FETCHED",
  "data": {
    "user": 123,
    "balance": 150000
  }
}
```

### 💰 Deposit Funds

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/deposit/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'
```

#### Response
```json
{
  "error": false,
  "message": "مبلغ 50000 به با موفقیت کیف پول شما اضافه شد",
  "code": "DEPOSIT_SUCCESS",
  "data": {
    "balance": 200000
  }
}
```

### 💳 Withdraw Funds

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/withdraw/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 20000}'
```

#### Response
```json
{
  "error": false,
  "message": "مبلغ 20000 با موفقیت از کیف پول شما کسر شد",
  "code": "WITHDRAW_SUCCESS",
  "data": {
    "balance": 180000
  }
}
```

### 🔄 Transfer Funds

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/transfer/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "to_user_id": 456,
    "amount": 30000
  }'
```

#### Response
```json
{
  "error": false,
  "message": "مبلغ 30000 با موفقیت منتقل شد",
  "code": "TRANSFER_SUCCESS",
  "data": {
    "balance": 150000
  }
}
```

### 📜 Transaction History

#### Request
```bash
curl -X GET http://89.106.206.119:8000/api/wallet/transactions/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

#### Response
```json
{
  "error": false,
  "message": "تراکنش های کاربر یافت شد",
  "code": "USER_TRANSACTION_FETCHED",
  "data": [
    {
      "wallet": 1,
      "amount": 50000,
      "status": "success",
      "type": "deposit",
      "from_user": 123,
      "to_user": null,
      "registered_in": "2024-01-15T15:30:00Z"
    },
    {
      "wallet": 1,
      "amount": 20000,
      "status": "success",
      "type": "withdraw",
      "from_user": 123,
      "to_user": null,
      "registered_in": "2024-01-15T15:45:00Z"
    },
    {
      "wallet": 1,
      "amount": 30000,
      "status": "success",
      "type": "payment",
      "from_user": 123,
      "to_user": 456,
      "registered_in": "2024-01-15T16:00:00Z"
    }
  ]
}
```

- **200 OK** - No transactions (special case)
```json
{
  "error": true,
  "message": "تراکنشی وجود ندارد",
  "code": "USER_TRANSACTION_NOT_EXIST"
}
```

---

### 🛒 In-App Purchase Post/Item

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/purchase/8/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```
*Note: No request body needed. Price is taken from post attributes.*

#### Response
```json
{
  "error": false,
  "message": "خرید با موفقیت انجام شد",
  "code": "PURCHASE_SUCCESS",
  "data": {
    "balance": 120000
  }
}
```

### 🛒 Create fake gateway link Post/Item

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/payment/create/8/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```
*Note: No request body needed. Price is taken from post attributes.*

#### Response
```json
{
    "error": false,
    "message": "لینک پرداخت با موفقیت ساخته شد",
    "code": "PAYMENT_CREATED",
    "data": {
        "payment_url": "/fake-gateway/5d9d7a1b-756b-4c81-995e-812967720b182/"
    }
}
```

### ✅ Payment verification

#### Request
```bash
curl -X POST http://89.106.206.119:8000/api/wallet/payment/verify/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  -H "Content-Type: application/json" \
  -d '{"authority": "5d9d7a1b-756b-4c81-995e-812967720b182"}'
```
#### Response



### 📝 Post Attributes Schema

Posts being purchased must have the following attributes structure:

```json
{
  "id": "^[0-9]+$",
  "name": "^[a-zA-Z0-9\\s\\-]{3,100}$",
  "mealType": "^(breakfast|lunch|dinner|snack)$",
  "location": "^[a-zA-Z0-9\\s\\-,]{2,100}$",
  "date": "^\\d{4}-\\d{2}-\\d{2}$",
  "price": "^[0-9]+(\\.[0-9]{1,2})?$",
  "isSoldOut": "^(true|false)$",
  "day": "^(saturday|sunday|monday|tuesday|wednesday|thursday|friday|)$"
}
```

## 📁 Log File Management

### Via Admin Panel (others are just for command line):

```text
|-admin/
  |-logs/
    |-viewer/
    |-download/
    |-clear/
    |-statistics/
```


### List Log Files
**GET** `/api/logs/files/`

**Description:** لیست فایل‌های لاگ موجود

```bash
curl -X GET "http://89.106.206.119:8000/api/logs/files/" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "log_dir": "/app/logs",
  "files": [
    {
      "name": "application.log",
      "size": 4521750,
      "size_human": "4.31 MB",
      "modified": "2024-01-15T16:30:45Z",
      "preview": [
        "📅 2024-01-15 16:30:00 | 📊 INFO | 👤 admin | 🌐 192.168.1.100 | 📁 posts.views:142 | 📝 User created new post",
        "📅 2024-01-15 16:25:15 | 📊 WARNING | 👤 johndoe | 🌐 192.168.1.101 | 📁 accounts.views:89 | 📝 Failed login attempt",
        "📅 2024-01-15 16:20:30 | 📊 ERROR | 👤 system | 🌐 127.0.0.1 | 📁 database.models:15 | 📝 Database connection timeout"
      ]
    },
    {
      "name": "security.log",
      "size": 125678,
      "size_human": "122.73 KB",
      "modified": "2024-01-15T16:28:12Z",
      "preview": [
        "📅 2024-01-15 16:28:12 | 📊 WARNING | 👤 anonymous | 🌐 103.21.244.0 | 📁 security:45 | 📝 Multiple failed login attempts from IP",
        "📅 2024-01-15 15:45:23 | 📊 INFO | 👤 admin | 🌐 192.168.1.100 | 📁 security:78 | 📝 Superuser accessed log files"
      ]
    }
  ],
  "total_files": 5
}
```

---

### Read Logs with Filters
**GET** `/api/logs/read/`

**Description:** خواندن لاگ‌ها با فیلتر و صفحه‌بندی

**Query Parameters:**
- `file` (optional): نام فایل لاگ (default: `application.log`)
- `level` (optional): سطح لاگ (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`)
- `user` (optional): فیلتر بر اساس نام کاربری
- `ip` (optional): فیلتر بر اساس آدرس IP
- `search` (optional): جستجوی متن در لاگ‌ها
- `date_from` (optional): تاریخ شروع (YYYY-MM-DD)
- `date_to` (optional): تاریخ پایان (YYYY-MM-DD)
- `page` (optional): شماره صفحه (default: 1)
- `per_page` (optional): تعداد در هر صفحه (max: 1000, default: 100)

```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=application.log&level=ERROR&page=1&per_page=50" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "file": "application.log",
  "logs": [
    "<span style=\"color: #dc3545; font-weight: bold;\">ERROR</span> | 👤 admin | 🌐 192.168.1.100 | 📁 posts.views:89 | 📝 Failed to create post: Database constraint violation",
    "<span style=\"color: #dc3545; font-weight: bold;\">ERROR</span> | 👤 jane | 🌐 192.168.1.102 | 📁 interactions.views:45 | 📝 Comment creation failed: Post does not exist",
    "<span style=\"color: #dc3545; font-weight: bold;\">ERROR</span> | 👤 system | 🌐 127.0.0.1 | 📁 database:112 | 📝 Connection pool exhausted"
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total_pages": 3,
    "total_count": 145,
    "has_next": true,
    "has_previous": false
  },
  "statistics": {
    "levels": {
      "ERROR": 145,
      "INFO": 1245,
      "WARNING": 89,
      "DEBUG": 456
    },
    "top_users": {
      "admin": 450,
      "johndoe": 230,
      "janedoe": 189,
      "system": 145
    },
    "file_size": "10.24 MB"
  }
}
```

---

### Download Log File
**GET** `/api/logs/download/<file_name>/`

**Description:** دانلود کامل یک فایل لاگ

```bash
curl -X GET "http://89.106.206.119:8000/api/logs/download/application.log/" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -o application.log
```

**Response:**  
فایل لاگ دانلود می‌شود با Content-Type: `text/plain`

---

### Clear Log File
**DELETE** `/api/logs/clear/<file_name>/`

**Description:** پاک کردن محتوای یک فایل لاگ

```bash
curl -X DELETE "http://89.106.206.119:8000/api/logs/clear/application.log/" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "فایل \"application.log\" با موفقیت پاک شد"
}
```

---

### Get Log Statistics
**GET** `/api/logs/statistics/`

**Description:** دریافت آمار و تحلیل لاگ‌ها

**Query Parameters:**
- `log_type` (optional): نوع لاگ (`app`, `api`, `security`, `database`, `all`)
- `days` (optional): تعداد روزهای گذشته برای تحلیل (default: 7)

```bash
curl -X GET "http://89.106.206.119:8000/api/logs/statistics/?log_type=all&days=30" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_files": 5,
    "total_size": 25489632,
    "files": [
      {
        "name": "application.log",
        "size": 10485760,
        "size_human": "10.00 MB",
        "modified": "2024-01-15T16:30:45Z"
      },
      {
        "name": "api_requests.log",
        "size": 5242880,
        "size_human": "5.00 MB",
        "modified": "2024-01-15T16:25:30Z"
      }
    ],
    "recent_errors": [
      {
        "timestamp": "2024-01-15 16:30:00",
        "level": "ERROR",
        "user": "admin",
        "ip": "192.168.1.100",
        "message": "Failed to create post: Database constraint violation"
      }
    ],
    "top_users": {
      "admin": 1245,
      "johndoe": 890,
      "janedoe": 756,
      "system": 450
    },
    "activity_by_hour": {
      "00": 45,
      "01": 23,
      "02": 12,
      "10": 189,
      "11": 234,
      "12": 278,
      "13": 256,
      "14": 245,
      "15": 267,
      "16": 289,
      "17": 278,
      "18": 245,
      "19": 189,
      "20": 145,
      "21": 98,
      "22": 67,
      "23": 45
    }
  },
  "total_size_human": "24.31 MB"
}
```

---

### 👤 User Activity Logs

### Get My Activity Logs
**GET** `/api/logs/my-activity/`

**Description:** کاربران معمولی می‌توانند لاگ‌های فعالیت خودشان را ببینند

**Query Parameters:**
- `page` (optional): شماره صفحه (default: 1)
- `per_page` (optional): تعداد در هر صفحه (max: 200, default: 50)

```bash
curl -X GET "http://89.106.206.119:8000/api/logs/my-activity/?page=1&per_page=20" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "success": true,
  "username": "johndoe",
  "logs": [
    "📅 2024-01-15 16:30:00 | 📊 INFO | 👤 johndoe | 🌐 192.168.1.101 | 📁 posts.views:142 | 📝 User created new post with ID: 456",
    "📅 2024-01-15 15:45:23 | 📊 INFO | 👤 johndoe | 🌐 192.168.1.101 | 📁 interactions.views:89 | 📝 User liked post 123",
    "📅 2024-01-15 14:20:15 | 📊 WARNING | 👤 johndoe | 🌐 192.168.1.101 | 📁 accounts.views:67 | 📝 Failed login attempt - wrong password",
    "📅 2024-01-15 13:10:45 | 📊 INFO | 👤 johndoe | 🌐 192.168.1.101 | 📁 messaging.views:123 | 📝 User sent message in conversation 789"
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_count": 56,
    "has_next": true,
    "has_previous": false
  }
}
```

---

### 📊 **Log Format Information**

### Log Entry Format:
```
📅 [TIMESTAMP] | 📊 [LEVEL] | 👤 [USERNAME] | 🌐 [IP_ADDRESS] | 📁 [MODULE]:[LINE_NUMBER] | 📝 [MESSAGE]
```

**Example:**
```
📅 2024-01-15 16:30:00 | 📊 INFO | 👤 admin | 🌐 192.168.1.100 | 📁 posts.views:142 | 📝 User created new post with ID: 123 in category: technology
```

**Level Colors:**
- 🟦 **INFO** - آبی (`#0d6efd`)
- 🟨 **WARNING** - زرد (`#ffc107`)
- 🟥 **ERROR** - قرمز (`#dc3545`)
- 🟪 **CRITICAL** - بنفش (`#6f42c1`)
- 👤 **User** - سبز (`#20c997`)
- 🌐 **IP** - نارنجی (`#fd7e14`)

---

### 🔧 **Error Responses**

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication credentials were not provided."
}
```

### 403 Forbidden (Non-superuser)
```json
{
  "success": false,
  "message": "Only superusers can access log files"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "فایل لاگ \"nonexistent.log\" یافت نشد"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "خطا در خواندن لاگ‌ها: [error details]"
}
```

---

### 🚀 **Advanced Filtering Examples**

### 1. فیلتر بر اساس کاربر و سطح:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=application.log&user=admin&level=ERROR&page=1"
```

### 2. جستجو در لاگ‌ها:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=security.log&search=login%20failed&page=1"
```

### 3. فیلتر تاریخ:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=application.log&date_from=2024-01-01&date_to=2024-01-15&page=1"
```

### 4. ترکیب چند فیلتر:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=api_requests.log&level=WARNING&user=system&ip=127.0.0.1&page=1"
```

---

### 📝 **Notes**

1. **سوپر یوزرها** می‌توانند به تمام لاگ‌ها دسترسی داشته باشند
2. **کاربران معمولی** فقط می‌توانند لاگ‌های فعالیت خودشان را ببینند
3. لاگ‌ها به صورت **رنگی** و **فرمت‌بندی شده** نمایش داده می‌شوند
4. فایل‌های لاگ به صورت **خودکار rotate** می‌شوند (10MB برای app.log)
5. حداکثر 1000 خط در هر درخواست قابل دریافت است (`per_page=1000`)

---

### 🎯 **Sample Workflow**

### 1. مشاهده لیست فایل‌های لاگ:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/files/" \
  -H "Authorization: Bearer YOUR_SUPERUSER_TOKEN"
```

### 2. بررسی خطاهای اخیر:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=application.log&level=ERROR&page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_SUPERUSER_TOKEN"
```

### 3. بررسی فعالیت مشکوک:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/read/?file=security.log&search=failed%20login&date_from=2024-01-01" \
  -H "Authorization: Bearer YOUR_SUPERUSER_TOKEN"
```

### 4. دریافت آمار کامل:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/statistics/?log_type=all&days=30" \
  -H "Authorization: Bearer YOUR_SUPERUSER_TOKEN"
```

### 5. کاربر عادی مشاهده لاگ‌های خود:
```bash
curl -X GET "http://89.106.206.119:8000/api/logs/my-activity/?page=1&per_page=50" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

## ⚠️ Error Responses

### Format Not Found
```json
{
  "success": false,
  "message": "No format found for category: programming"
}
```

### Permission Denied (Non-Superuser)
```json
{
  "success": false,
  "message": "Only superusers can upload format files"
}
```

### Invalid JSON File
```json
{
  "success": false,
  "message": "Invalid JSON file"
}
```

### File Type Error
```json
{
  "success": false,
  "message": "Only JSON files are allowed"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Category is required"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["This field is required."],
    "password": ["This password is too short."]
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication credentials were not provided."
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Not found."
}
```

### Permission Error
```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```
