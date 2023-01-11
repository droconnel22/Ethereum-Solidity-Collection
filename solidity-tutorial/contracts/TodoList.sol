//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TodoList {

    event Created(uint indexed index, string text, bool completed);

    struct Todo {
        string text;
        bool  completed;
    }

    Todo[] public todos;

    uint public todoIndex = 0;

    function create(string calldata _text) external {
        Todo memory newTodo = Todo({text: _text, completed: false});
        todos[todoIndex] = newTodo;  
        emit Created(todoIndex, _text, false);
        todoIndex+=1;    
    }

    function update(uint _todoIndex, string calldata _text, bool _completed) external {
        require(_todoIndex < todoIndex, "does not exist");
        Todo storage todo = todos[_todoIndex];
        todo.completed = _completed;
        todo.text = _text;
    }

    function get(uint _todoIndex) external view returns(Todo memory todo_) {
         require(_todoIndex < todoIndex, "does not exist");
         todo_ = todos[_todoIndex];    
    }
}