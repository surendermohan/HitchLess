var module1 = angular.module('TodoService', ['ngResource']).factory('Todo', ['$resource', function ($resource) {
    var Todo = $resource('http://localhost:3000/api/todo/:todoId', {}, {
        update: { method: 'PUT'}
    });
    return Todo;
}]);