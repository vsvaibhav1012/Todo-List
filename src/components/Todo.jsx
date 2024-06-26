import { useState } from "react";
import { useDispatch } from "react-redux";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { addTodo, updateSearchTodo } from "../Redux/Action/actions";
import FilterButton from "./FilterButton";
import List from "./List";

const Todo = () => {
  const dispatch = useDispatch();
  const [todoText, setTodoText] = useState("");
  const [searchText, setSearchText] = useState("");

  const handleAddTodo = (text) => {
    dispatch(addTodo(text));
  };

  const saveTodo = () => {
    if (todoText.trim() !== "") {
      handleAddTodo(todoText.trim());
      setTodoText("");
    }
  };

  const handleSearchTodo = (value) => {
    setSearchText(value);
    dispatch(updateSearchTodo(value));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      saveTodo();
    }
  };

  return (
    <div className="max-w-4xl mx-auto sm:mt-8 p-4 bg-gray-200 rounded">
      <h2 className="mt-3 mb-6 text-2xl font-bold text-center text-teal-700 uppercase">
        To do List
      </h2>
      {/* Input Button */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Enter Your Task"
          className="flex-grow p-2 border-b-2 border-gray-300 rounded focus:outline-none focus:border-gray-800 ease-in-out duration-300"
          name="text"
          id="addTodo"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="ml-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-800 focus:outline-none"
          onClick={saveTodo}
        >
          <FaArrowAltCircleRight />
        </button>
      </div>
      {/* Filter Search */}
      <div className="flex items-center justify-between flex-wrap">
        <FilterButton />
        {/* Search */}
        <div className="flex items-center justify-end mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            name="text"
            onChange={(e) => handleSearchTodo(e.target.value)}
            id="addTodo"
            className="flex-grow rounded p-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-500 sm:mr-4"
          />
          <button
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
            onClick={saveTodo}
          >
            <BsSearch />
          </button>
        </div>
      </div>
      <List />
    </div>
  );
};

export default Todo;
