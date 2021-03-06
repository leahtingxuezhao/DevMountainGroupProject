import React, { Component } from "react";
import "./Personal_Dashboard.css";
import { connect } from "react-redux";
import { sidebarToggle } from "../../redux/reducers/sidebarReducer";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import deadline_logo from "./iconfinder_Clock_arrow_2202265.png";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
/**
 * Moves an item from one list to another list.
 */

const id4List = {
  droppable: "tasks",
  droppable2: "inProgress",
  droppable3: "review"
  // droppable4: "done"
};
const move = (
  source,
  destination,
  droppableSource,
  droppableDestination,
  setState
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  const sourceId = id4List[droppableSource.droppableId];
  const destId = id4List[droppableDestination.droppableId];

  destClone.splice(droppableDestination.index, 0, removed);

  // optimistic update
  setState({
    [sourceId]: sourceClone,
    [destId]: destClone
  });

  const updateTaskInProgress = () => {
    axios.put(`/api/updateTaskToInProgress/${removed.task_id}`).then(res => {
      setState({
        [sourceId]: sourceClone,
        [destId]: destClone
      });
    });
  };

  const updateTaskToDo = () => {
    axios.put(`/api/updateTaskToDo/${removed.task_id}`).then(res => {
      setState({
        [sourceId]: sourceClone,
        [destId]: destClone
      });
    });
  };
  const updateTaskToReview = () => {
    axios.put(`/api/updateTaskToReview/${removed.task_id}`).then(res => {
      setState({
        [sourceId]: sourceClone,
        [destId]: destClone
      });
    });
  };

  if (droppableDestination.droppableId === "droppable2") {
    updateTaskInProgress();
  } else if (droppableDestination.droppableId === "droppable3") {
    updateTaskToReview();
  } else if (droppableDestination.droppableId === "droppable") {
    updateTaskToDo();
  }
  const result = {};
  result[sourceId] = sourceClone;
  result[destId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  borderRadius: "8px",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "lightgrey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "white",
  padding: grid,
  width: 250
});

class Personal_Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      inProgress: [],
      review: [],
      done: []
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  async componentDidMount() {
    await this.getTasksToDo();
    await this.getTasksInProgress();
    await this.getTasksReview();
    await this.getTasksDone();
  }

  getTasksToDo = () => {
    let owner = this.props.user.user_id;
    axios
      .get(`/api/getToDoTasks/${owner}`)
      .then(res => {
        this.setState({ tasks: res.data });
      })
      .catch(err => console.log("err", err));
  };

  getTasksInProgress = () => {
    let owner = this.props.user.user_id;
    axios
      .get(`/api/getInProgressTasks/${owner}`)
      .then(res => {
        this.setState({ inProgress: res.data });
      })
      .catch(err => console.log("err", err));
  };

  getTasksReview = () => {
    let owner = this.props.user.user_id;
    axios
      .get(`/api/getReviewTasks/${owner}`)
      .then(res => {
        this.setState({ review: res.data });
      })
      .catch(err => console.log("err", err));
  };

  getTasksDone = () => {
    let owner = this.props.user.user_id;
    axios
      .get(`/api/getDoneTasks/${owner}`)
      .then(res => {
        this.setState({ done: res.data });
        console.log("res.data :", res.data);
      })
      .catch(err => console.log("err", err));
  };

  getList = id => this.state[id4List[id]];

  onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const DDD = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { DDD };

      if (source.droppableId === "droppable2") {
        state = { inProgress: DDD };
        this.setState({ ...this.state, state });
      } else if (source.droppableId === "droppable3") {
        state = { review: DDD };
        this.setState({ ...this.state, state });
      } else if (source.droppableId === "droppable") {
        state = { tasks: DDD };
        this.setState({ ...this.state, state });
      }
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination,
        data => {
          this.setState({ ...this.state, ...data });
        }
      );
      console.log("this.state :", this.state);
    }
  };

  render() {
    const { tasks, inProgress, review, done } = this.state;
    let [searchBy, filTasks, filInProgress, filReview, filDone] = [
      this.props.searchInput
    ];
    if (!searchBy) {
      filTasks = tasks;
      filInProgress = inProgress;
      filReview = review;
      filDone = done;
    } else {
      filTasks = tasks.filter(
        v =>
          v.task_name.includes(searchBy) ||
          v.task_description.includes(searchBy)
      );
      filInProgress = inProgress.filter(
        v =>
          v.task_name.includes(searchBy) ||
          v.task_description.includes(searchBy)
      );
      filReview = review.filter(
        v =>
          v.task_name.includes(searchBy) ||
          v.task_description.includes(searchBy)
      );
      filDone = done.filter(
        v =>
          v.task_name.includes(searchBy) ||
          v.task_description.includes(searchBy)
      );
    }

    const getPriorityColor = priority => {
      if (priority === "high") {
        return "priority_high";
      } else if (priority === "medium") {
        return "priority_medium";
      } else {
        return "priority_low";
      }
    };

    return (
      <div className="personal_dashboard">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div>
            <div className="dashboardTitle">To Do</div>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {filTasks.map((task, index) => (
                    <Draggable
                      key={task.task_id}
                      draggableId={task.task_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div className="title">{task.task_name}</div>
                          <div className="descriptionA">
                            Task description: {task.task_description}
                          </div>
                          <div className={getPriorityColor(task.priority)}>
                            Priority: {task.priority}
                          </div>
                          <div className="deadline">
                            <div className="deadline">
                              Deadline: {task.deadline.slice(0, 10)}
                              <img
                                src={deadline_logo}
                                className="deadlineLogo"
                              ></img>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div>
            <div className="dashboardTitle">In Progress</div>
            <Droppable droppableId="droppable2">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {filInProgress.map((task, index) => (
                    <Draggable
                      key={task.task_id}
                      draggableId={task.task_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div className="title">{task.task_name}</div>
                          <div className="descriptionA">
                            Task description: {task.task_description}
                          </div>
                          <div className={getPriorityColor(task.priority)}>
                            Priority: {task.priority}
                          </div>
                          <div className="deadline">
                            <div className="deadline">
                              Deadline: {task.deadline.slice(0, 10)}
                              <img
                                src={deadline_logo}
                                className="deadlineLogo"
                              ></img>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div>
            <div className="dashboardTitle">In Review</div>
            <Droppable droppableId="droppable3">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {filReview.map((task, index) => (
                    <Draggable
                      key={task.task_id}
                      draggableId={task.task_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div className="title">{task.task_name}</div>
                          <div className="descriptionA">
                            Task description: {task.task_description}
                          </div>
                          <div className={getPriorityColor(task.priority)}>
                            Priority: {task.priority}
                          </div>
                          <div className="deadline">
                            <div className="deadline">
                              Deadline: {task.deadline.slice(0, 10)}
                              <img
                                src={deadline_logo}
                                className="deadlineLogo"
                              ></img>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div>
            <div className="dashboardTitle">Done</div>
            {filDone.map(task => (
              <div className="doneList" key={task.task_id}>
                <div className="title">{task.task_name}</div>
                <div className="descriptionA">
                  Task description: {task.task_description}
                </div>
                <div className={getPriorityColor(task.priority)}>
                  Priority: {task.priority}
                </div>
                <div className="deadline">
                  <div className="deadline">
                    Deadline: {task.deadline.slice(0, 10)}
                    <img src={deadline_logo} className="deadlineLogo"></img>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    toggleSideBar: state.sidebarReducer.toggleSideBar,
    user: state.userReducer.user,
    searchInput: state.searchReducer.searchInput
  };
}
export default connect(mapStateToProps, { sidebarToggle })(Personal_Dashboard);
