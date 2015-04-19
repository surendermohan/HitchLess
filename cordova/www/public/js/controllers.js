function TodoController($scope, Todo, $http) {
    $scope.todos = Todo.query();

    $scope.selectTodo = function (id) {
        $scope.todo = _.where($scope.todos, {_id: id})[0];
    }

    $scope.newTodo = function () {
        $scope.todo = new Todo();
    }

    $scope.saveTodo = function () {
        if ($scope.todo._id == null) {
            Todo.save({}, $scope.todo, function (data) {
                $scope.todos.push(data);
            });
        }
        else {
            Todo.update({todoId: $scope.todo._id}, $scope.todo, function (data) {
            });
        }
    }

    $scope.completeTodo = function (id) {
        Todo.delete({todoId: id}, function () {
            $scope.todos = _.without($scope.todos, $scope.todo);
        });
    }

    $scope.getFlights = function () {
         $http.get('/flights?origin=SEA&destination=SFO&returndate=2015-05-01')
         .success(function(data) {
            $scope.flights = data;
        });
    }    
}

