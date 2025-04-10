
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/api/testing/all-data": {
        "delete": {
          "operationId": "TestingController_deleteAllData",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Testing"
          ]
        }
      },
      "/api/users": {
        "get": {
          "operationId": "UsersController_getAllUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ]
        },
        "post": {
          "operationId": "UsersController_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ]
        }
      },
      "/api/users/{id}": {
        "delete": {
          "operationId": "UsersController_deleteUserById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Users"
          ]
        }
      },
      "/api/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginInputDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration": {
        "post": {
          "operationId": "AuthController_register",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_registrationConfirmation",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationConfirmationInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_resendRegistrationEmail",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationResendingInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_recoverPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PasswordRecoveryInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/new-password": {
        "post": {
          "operationId": "AuthController_createNewPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NewPasswordInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/auth/me": {
        "get": {
          "operationId": "AuthController_getMe",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/blogs": {
        "get": {
          "operationId": "BlogsController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "post": {
          "operationId": "BlogsController_createBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/api/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsController_getPostsByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "post": {
          "operationId": "BlogsController_createPostByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostByBlogIdInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/api/blogs/{blogId}": {
        "get": {
          "operationId": "BlogsController_getBlogById",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {}
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        },
        "put": {
          "operationId": "BlogsController_updateBlogById",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/api/blogs/{id}": {
        "delete": {
          "operationId": "BlogsController_deleteBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/api/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsController_getCommentsByPostId",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_commentPost",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCommentInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/api/posts": {
        "get": {
          "operationId": "PostsController_getAllPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_createPost",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostInputDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/api/posts/{postId}": {
        "get": {
          "operationId": "PostsController_getPostById",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "put": {
          "operationId": "PostsController_updatePostById",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "delete": {
          "operationId": "PostsController_deleteBlogById",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {}
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/api/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostsController_makeLike",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/api/comments/{commentId}": {
        "get": {
          "operationId": "CommentsController_getCommentById",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ]
        },
        "put": {
          "operationId": "CommentsController_updateComment",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ]
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ]
        }
      },
      "/api/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsController_makeLike",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeInputDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Comments"
          ]
        }
      }
    },
    "info": {
      "title": "BLOGGER API",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "CreateUserInputDto": {
          "type": "object",
          "properties": {}
        },
        "LoginInputDto": {
          "type": "object",
          "properties": {}
        },
        "RegistrationInputDto": {
          "type": "object",
          "properties": {}
        },
        "RegistrationConfirmationInputDto": {
          "type": "object",
          "properties": {}
        },
        "RegistrationResendingInputDto": {
          "type": "object",
          "properties": {}
        },
        "PasswordRecoveryInputDto": {
          "type": "object",
          "properties": {}
        },
        "NewPasswordInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreateBlogInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreatePostByBlogIdInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreatePostInputDto": {
          "type": "object",
          "properties": {}
        },
        "CreateCommentInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostInputDto": {
          "type": "object",
          "properties": {}
        },
        "LikeInputDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateCommentInputDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
