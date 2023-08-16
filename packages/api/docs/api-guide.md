# FLUXPUCK'S PROJECTY GUIDE

## Table of Contents
- [RESTful API](#api)
- [Routes](#routes)
- [Middleware](#middleware)
- [Git Guide](#git)

___

## RESTful API<a name="api"></a>
A RESTful API is a valuable tool that provides a standardized and well-defined interface for communication between various systems, improving the performance and reliability of applications. 

By separating the database from applications, mainly for Flux#3955 (a lightweight Discord bot), potential downtime can be reduced, and updates can be tested and refined in the API before implementation. This approach not only minimizes the risk of errors, but also streamlines the development process, improves overall efficiency and allows for better collaboration.

Additionally, the API's flexibility and scalability will help with handling a future growing number of requests.

## Routes<a name="routes"></a>
All routes in the API have been separated in different files, allowing for better clarity in the codebase. These routes are currently available:

## Middleware<a name="middleware"></a>
As the routes, middleware is separated in different files. It adds the following functionalities to the RESTful API.

### Authentication
The API includes a basic authentication system that allows users to authenticate using a private token.

### Logging
The API is set-up to log requests/calls using Morgan, including information such as request method, URL, response status, response time, and more. This all is compiled into a daily report, which can be used to monitor API-usage, diagnose issues and improve performance.

### ErrorHandler
The error handler is responsible for handling any errors that are thrown by other middleware or API routes in the application. Its purpose is to catch any errors that are not handled elsewhere and provide a meaningful response to the user.

## Git Guide<a name="git"></a>
Please read the [git-guide](/docs/git-guide.md) for more information on version control of the codebase.

<br>

*This guide was originally created on a beautiful monday morning in february by @Fluxpuck.*