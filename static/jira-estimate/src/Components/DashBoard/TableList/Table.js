import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Avatar from '@atlaskit/avatar';
import { invoke, router } from '@forge/bridge';
import Tooltip from '@atlaskit/tooltip';
import RedExclamation from '../../../assests/images/exclamationRed.svg'
import exclamationOrangeImg from '../../../assests/images/exclamationOrange.svg'
import { Link } from 'react-router-dom';


const Table = (props) => {
  const { allIssues, isTotalTimeShow } = props

  const [columns, setColumns] = useState([]);

  const [rankedData, setRankedData] = useState([])

  const [columnName, setColumnName] = useState("")
  const [issueId, setIssueId] = useState("")
  const [values, setValues] = useState({}); // Updated to store values for each card

  useEffect(() => {
    allIssues.map((item) => setValues((prevValues) => ({
      ...prevValues,
      [item.id.toString()]: getTime(item.originalTime) === "" ? "0m" : getTime(item.originalTime), // Store the value for the specific card id
    })))
  }, [allIssues])

  useEffect(() => {
    (async () => {
      if (columnName && issueId) {
        if (columnName === 'Not Tracked') {
          await invoke('updateIssue', { date: null, issueId });
        } else {
          const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

          const currentDate = new Date();
          const currentDayOfWeek = currentDate.getDay();

          const targetDayIndex = weekDays.indexOf(columnName);
          let daysToAdd = targetDayIndex - currentDayOfWeek;
          if (daysToAdd < 0) {
            daysToAdd += 7;
          }

          const updatedDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          const updatedDateString = updatedDate.toISOString().split('T')[0];

          await invoke('updateIssue', { date: updatedDateString, issueId });
        }

        setColumnName("");
        setIssueId("");
      }
    })();
  }, [columnName, issueId]);

  useEffect(() => {
    (async () => {
      if (rankedData.length > 0) {
        await invoke('updateCustomFieldRanked', { allIssues: rankedData });
      }
    })();

  }, [rankedData])


  const columnsFromBackend = {
    [uuidv4()]: {
      name: "Not Tracked",
      items: allIssues.filter(item => {
        if (item.startDate === null) {
          return item;
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => item.startDate === null).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => item.startDate === null).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    },
    [uuidv4()]: {
      name: "Monday",
      items: allIssues.filter(item => {
        if (item.startDate != null) {
          const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const date = new Date(item.startDate)
          const day = weekday[date.getDay()]
          if (day === "Monday") {
            return item;
          }
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Monday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Monday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    },
    [uuidv4()]: {
      name: "Tuesday",
      items: allIssues.filter(item => {
        if (item.startDate != null) {
          const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const date = new Date(item.startDate)
          const day = weekday[date.getDay()]
          if (day === "Tuesday") {
            return item;
          }
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Tuesday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Tuesday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    },
    [uuidv4()]: {
      name: "Wednesday",
      items: allIssues.filter(item => {
        if (item.startDate != null) {
          const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const date = new Date(item.startDate)
          const day = weekday[date.getDay()]
          if (day === "Wednesday") {
            return item;
          }
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Wednesday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Wednesday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    },
    [uuidv4()]: {
      name: "Thursday",
      items: allIssues.filter(item => {
        if (item.startDate != null) {
          const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const date = new Date(item.startDate)
          const day = weekday[date.getDay()]
          if (day === "Thursday") {
            return item;
          }
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Thursday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Thursday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    },
    [uuidv4()]: {
      name: "Friday",
      items: allIssues.filter(item => {
        if (item.startDate != null) {
          const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          const date = new Date(item.startDate)
          const day = weekday[date.getDay()]
          if (day === "Friday") {
            return item;
          }
        }
      }),
      total: {
        totalActualTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Friday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.actualTime === null ? 0 : object.actualTime);
        }, 0),
        totalOriginalTime: allIssues.filter(item => {
          if (item.startDate != null) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const date = new Date(item.startDate)
            const day = weekday[date.getDay()]
            if (day === "Friday") {
              return item;
            }
          }
        }).reduce((accumulator, object) => {
          return accumulator + (object.originalTime === null ? 0 : object.originalTime);
        }, 0)
      }
    }
  };

  useEffect(() => {
    setColumns(columnsFromBackend)
  }, [allIssues])

  const [height, setHeigth] = useState()
  useEffect(() => {
    var elem = document.getElementById("tableContainer");
    if (elem) {
      var rect = elem.getBoundingClientRect();
      setHeigth(rect.height)
    }
  }, [columns, issueId])

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      const columnName = columns[destination.droppableId].name
      setColumnName(columnName)
      setIssueId(draggableId)
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setRankedData(destItems)
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setRankedData(copiedItems)
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };
  const [state, setState] = useState("")
  const [isInputOpen, setIsInputOpen] = useState("");

  const [id, setId] = useState("")
  const handleClick = (e, id) => {
    const parentId = e.target.parentElement.id;
    const ownId = e.target.id;
    setId(`input-${id}`)
    if (parentId === id) {
      setIsInputOpen(id);
      setState(ownId)
    }
  };

  useEffect(() => {
    const element = document.getElementById(id)
    if (element) {
      element.addEventListener('keypress', e => {
        if (e.key === "Enter") {
          handleBlur()
        }
      });
    }
  }, [id])


  const handleChange = (e, id) => {
    const inputId = id.toString()
    const value = e.target.value;

    setValues((prevValues) => ({
      ...prevValues,
      [inputId]: value, // Store the value for the specific card id
    }));
  };

  const handleBlur = async (e, id) => {
    setIsInputOpen("");
    const time = values[id]
    await invoke('updateIssueTime', { time, id })
  };

  const handleOpenIssue = (e, key, inputId) => {
    if (e.target.id === "original" || e.target.id === inputId) {
      e.preventDefault(); // Prevent the default behavior of the click event
      return;
    }
    router.open(`/browse/${key}`)
  }

  const getTime = (seconds) => {
    let result = '';
    if (seconds >= 28800) {
      const workingDays = Math.floor(seconds / 28800);
      seconds %= 28800;
      result += workingDays + "d ";
    }
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      result += hours + "h ";
    }
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      seconds %= 60;
      result += minutes + "m ";
    }
    return result.trim();
  };

  return (
    <div className={styles.TableContainer} id='tableContainer'>
      <DragDropContext
        onDragEnd={result => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              className={styles.TableList}
              key={columnId}
            >
              <div className={styles.columnBox}>
                <span className={styles.columnName}>{column.name}</span>
                {isTotalTimeShow && <div className={styles.partitionBoxHeading} >
                  <div id="original" className={styles.originalEstimate} title='Original Estimate'>{getTime(column?.total?.totalOriginalTime) === "" ? "0m" : getTime(column?.total?.totalOriginalTime)}</div>
                  <div id="actual" title='Actual Estimate' className={styles.actualEstimate}>{getTime(column?.total?.totalActualTime) === "" ? "0m" : getTime(column?.total?.totalActualTime)}</div>
                </div>}
              </div>
              <div>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          paddingTop: 10,
                          width: 220,
                          minHeight: height - 200,
                          marginLeft: 8
                        }}
                      >
                        {column.items.map((item, index) => {
                          const inputId = `input-${item.id}`;
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (

                                  <div
                                    id={item.key}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      padding: 8,
                                      margin: "0 0 8px 0",
                                      width: "225px",
                                      minHeight: "100px",
                                      maxHeight: "auto",
                                      backgroundColor: "#FFFFFF",
                                      boxShadow: " 0px 2px 2px #00000029",
                                      borderRadius: "8px",
                                      opacity: 1,
                                      border: item.sprint?.length > 1 ? "2px solid red" : "none",
                                      position: "relative",
                                      ...provided.draggableProps.style
                                    }}
                                    onClick={(e) => handleOpenIssue(e, item.key, inputId)}
                                  >
                                    <div className={styles.taskName}>{item.summary}</div>
                                    {item.epicName && <div className={styles.epicBox}>
                                      <span className={styles.epicName}>{item.epicName}</span></div>}
                                    <div className={styles.taskDetails}>
                                      <div className={styles.imgWithProjectKey}>
                                        <Avatar
                                          size="xsmall"
                                          appearance="square"
                                          src={item.issuetype.iconUrl}
                                          name={item.issuetype.name}
                                        />
                                        <div className={styles.key}>{item.key}</div>
                                        {item?.labels?.includes('STUCK') && <img src={RedExclamation} alt='red exclamation icon' className={styles.RedExclamation} />}
                                        {((item.actualTime !== null && item.originalTime !== null) && (item.status !== 'Done' && (item.actualTime >= 0.8 * item.originalTime))) && <img src={exclamationOrangeImg} alt='orange exclamation icon' className={styles.RedExclamation} />}
                                      </div>
                                      <div className={isInputOpen === item.id ? styles.userBoxActive : styles.userBox}>
                                        {isInputOpen === item.id ?
                                          <input
                                            id={inputId}
                                            type="text"
                                            className={styles.inputBox}
                                            value={values[item.id.toString()] || ""} // Get the value from the state
                                            onChange={(e) => handleChange(e, item.id)} // Pass the card id to handleChange
                                            onBlur={(e) => handleBlur(e, item.id)} // Pass the card id to handleBlur
                                            autoFocus
                                          /> :

                                          <div id={item.id} className={styles.partitionBox} >
                                            <div id="original" className={styles.originalEstimate} onClick={(e) => handleClick(e, item.id, item.originalTime)} title='Original Estimate'>{values[item.id.toString()]}</div>
                                            <div id="actual" title='Actual Estimate' className={(item.status === "In Progress") ? styles.InProgress : (item.status === "Dev Done") ? styles.devDone : (item.status === "QA" || item.status === "Done") ? styles.Done : styles.actualEstimate}>{getTime(item.actualTime) === "" ? "0m" : getTime(item.actualTime)}</div>
                                          </div>
                                        }

                                        <img src={item.priority.priorityUrl} name="priority url" className={styles.priorityImg} />
                                        {Object.keys(item.assignee).length === 0 ? <div className={styles.blankDiv}></div> :
                                          <Tooltip content={item.assignee.displayName}>
                                            {(tooltipProps) => (
                                              <img src={item.assignee.assigneeUrl} name="user url" {...tooltipProps} />
                                            )}
                                          </Tooltip>}
                                      </div>

                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div >
          );
        })}
      </DragDropContext >
    </div >
  )
}

export default Table