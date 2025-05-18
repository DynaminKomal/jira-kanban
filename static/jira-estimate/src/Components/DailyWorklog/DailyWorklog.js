import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { invoke } from '@forge/bridge';
import Tooltip from '@atlaskit/tooltip';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const DailyWorklog = () => {
    const [allIssues, setAllIssues] = useState([]);
    const [formattedData, setFormattedData] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [apiData, setApiData] = useState([]);
    const [dailyWorkingHours, setDailyWorkingHours] = useState([]);
    const [rankedList, setRankedList] = useState([])
    const [dragDropData, setDragDropData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const setDailyWorkingHour = await invoke('setDailyWorkingHours');
                const data = await invoke('getAllIssues');
                const getDailyWorkingHours = await invoke('getDailyWorkingHours');
                setDailyWorkingHours(getDailyWorkingHours);
                setApiData(data);
                if (data?.error) {
                    setApiData([]);
                }
            } catch (err) {
                console.log("err: ", err)
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const filteredIssues = apiData.filter(issue => {
                const issueStartDate = new Date(issue.startDate).toISOString().split('T')[0];
                return issueStartDate === today;
            });
            setAllIssues(filteredIssues);
        } catch (err) {
            console.log("err: ", err)
        }
    }, [apiData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper function to convert time to minutes
    const timeToMinutes = (time) => {
        const [hour, minute] = time.split(":");
        const [amPm] = minute.split(" ");
        let hours = parseInt(hour, 10);
        const minutes = parseInt(minute.split(" ")[0], 10);

        if (amPm === "pm" && hours < 12) {
            hours += 12;
        } else if (amPm === "am" && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    };

    // Helper function to convert minutes back to time
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const amPm = hours >= 12 ? "pm" : "am";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${mins < 10 ? '0' + mins : mins} ${amPm}`;
    };


    useEffect(() => {
        const assigneeTasks = {};

        allIssues.forEach(task => {
            const assignee = task.assignee.displayName?.toLowerCase();
            if (!assigneeTasks[assignee]) {
                assigneeTasks[assignee] = [];
            }
            assigneeTasks[assignee].push(task);
        });

        // Formatting tasks based on login time and sorting by priority
        const formattedData = Object.keys(assigneeTasks).map(assignee => {
            const tasks = assigneeTasks[assignee];
            const assigneeData = dailyWorkingHours.find(user => user.name.toLowerCase() === assignee);
            const { login_time } = assigneeData || { login_time: "9:00 am" };
            let currentStartTime = timeToMinutes(login_time);

            // Sorting tasks by priority
            const sortedTasks = tasks.sort((a, b) => a.prior - b.prior);

            const formattedTasks = sortedTasks.map(task => {
                const startTime = minutesToTime(currentStartTime);
                currentStartTime += parseInt(task.originalTime, 10) / 60;
                return { ...task, startTime };
            });

            // Ensure there are exactly 9 tasks, adding empty objects if needed
            while (formattedTasks.length < 9) {
                formattedTasks.push({});
            }

            return {
                assignee: tasks[0].assignee,
                tasks: formattedTasks
            };
        });
        setFormattedData(formattedData);
    }, [allIssues]);

    useEffect(() => {
        if (dragDropData.length > 0) {
            const removeBlankObject = dragDropData.map(assignee => ({
                ...assignee,
                tasks: assignee.tasks.filter(task => Object.keys(task).length > 0)
            }));
            
            removeBlankObject.forEach(assignee => {
                assignee.tasks.forEach((task, index) => {
                    task.prior = index + 1;
                });
            });

            // Formatting tasks based on login time and sorting by priority
            const formattedData = removeBlankObject.map(item => {
                const tasks = item.tasks;
                const assigneeData = dailyWorkingHours.find(user => user.name.toLowerCase() === item.assignee.displayName?.toLowerCase());
                const { login_time } = assigneeData || { login_time: "9:00 am" };
                let currentStartTime = timeToMinutes(login_time);

                // Sorting tasks by priority
                const sortedTasks = tasks.sort((a, b) => a.prior - b.prior);

                const formattedTasks = sortedTasks.map(task => {
                    const startTime = minutesToTime(currentStartTime);
                    currentStartTime += parseInt(task.originalTime, 10) / 60;
                    return { ...task, startTime };
                });

                while (formattedTasks.length < 9) {
                    formattedTasks.push({});
                }
                return {
                    assignee: item.assignee,
                    tasks: formattedTasks
                };
            });
            setFormattedData(formattedData);
        }
    }, [dragDropData]);


    useEffect(() => {
        (async () => {
            if (rankedList.length > 0) {
                const filterData = rankedList.filter(item => Object.keys(item).length > 0);
                await invoke('updateCustomFieldRanked', { allIssues: filterData });
            }
        })();

    }, [rankedList])

    const timeSlots = ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM', '5:30 PM', '6:30 PM', '7:30 PM', '8:30 PM'];

    const timeToSeconds = (time) => {
        if (time) {
            const [hours, minutes, period] = time.match(/(\d+):(\d+)\s?(am|pm)/i).slice(1);
            let totalSeconds = (parseInt(hours) % 12) * 3600 + parseInt(minutes) * 60;
            if (period?.toLowerCase() === "pm") totalSeconds += 12 * 3600;
            return totalSeconds;
        } else {
            return 0;
        }
    };

    const getCurrentTime = () => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let period = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${period}`;
    };

    const calculateRedLinePosition = () => {
        const loginTimeInSeconds = timeToSeconds("8:30 am");
        const logoutTimeInSeconds = timeToSeconds("8:30 pm");
        const currentTimeInSeconds = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

        if (currentTimeInSeconds >= logoutTimeInSeconds) {
            return 100;
        }

        if (currentTimeInSeconds < loginTimeInSeconds) {
            return 0;
        }

        const timeElapsed = currentTimeInSeconds - loginTimeInSeconds;
        const totalDayTime = logoutTimeInSeconds - loginTimeInSeconds;
        return (timeElapsed / totalDayTime) * 100;
    };
    let redLinePosition = calculateRedLinePosition();

    const stopMovement = () => {
        return 100;
    };

    if (redLinePosition === 0) {
        redLinePosition = stopMovement();
    }

    const calculateTaskWidth = (originalTime,) => {
        const workDayInSeconds = 8 * 60 * 60;
        return (parseInt(originalTime) / workDayInSeconds) * 100;
    };

    const getTaskStatusClass = (task) => {
        const currentTimeInSeconds = timeToSeconds(getCurrentTime());
        const taskStartTime = timeToSeconds(task.startTime);
        const taskEndTime = taskStartTime + parseInt(task.originalTime);

        if (task.status?.toLowerCase() === "done") {
            return styles.completed;
        }
        if (task.status?.toLowerCase() === "in progress") {
            if (currentTimeInSeconds === taskStartTime) {
                return styles.inProgressWithinTime;
            }
            if (currentTimeInSeconds > taskStartTime && currentTimeInSeconds <= taskEndTime) {
                return styles.inProgressWithinTime;
            }
            if (currentTimeInSeconds < taskStartTime) {
                return styles.notStartedFuture;
            }
            if (currentTimeInSeconds > taskEndTime) {
                return styles.overdue;
            }
        }

        if (task.status?.toLowerCase() === "to do") {
            if (currentTimeInSeconds === taskStartTime) {
                return styles.overdue;
            }
            if (currentTimeInSeconds < taskStartTime) {
                return styles.notStartedFuture;
            }
            if (currentTimeInSeconds > taskStartTime) {
                return styles.overdue;
            }
        }

        return "";
    };

    const handleWidth = (name) => {
        const referenceTime = "8:30 am";
        const user = dailyWorkingHours.find((item) => item.name?.toLowerCase() === name?.toLowerCase());

        if (user) {
            const loginTime = user.login_time;

            const timeToMinutes = (time) => {
                const [timePart, modifier] = time.split(' ');
                let [hours, minutes] = timePart.split(':').map(Number);

                if (modifier === 'pm' && hours !== 12) {
                    hours += 12;
                }
                if (modifier === 'am' && hours === 12) {
                    hours = 0;
                }

                return hours * 60 + minutes;
            };

            const referenceTimeInMinutes = timeToMinutes(referenceTime);
            const userLoginTimeInMinutes = timeToMinutes(loginTime);

            const difference = Math.abs(userLoginTimeInMinutes - referenceTimeInMinutes);

            const hourDifference = difference / 60;

            return hourDifference;
        } else {
            return 0;
        }
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) {
            return;
        }
        if (source.droppableId !== destination.droppableId) {
            return;
        }

        const updatedData = [...formattedData];
        const [movedTask] = updatedData[source.droppableId].tasks.splice(source.index, 1);
        updatedData[destination.droppableId].tasks.splice(destination.index, 0, movedTask);
        setRankedList(updatedData[destination.droppableId].tasks)
        setDragDropData(updatedData);
    };


    return (
        <div className={styles.HomePage}>
            <div className={styles.mainHeading}>
                <span>
                    Jira Estimates
                </span>
                <span className={styles.anotherHeading}>Daily Worklog</span>
            </div>
            <div className={styles.worklogContainer}>
                {allIssues.length !== 0 && dailyWorkingHours.length !== 0 &&
                    <div className={styles.mainContainer}>

                        <div className={styles.header}>
                            <div className={styles.user}></div>
                            <div className={styles.timeSlot}>
                                <div
                                    className={styles.redLine}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: `${redLinePosition}%`,
                                        width: '2px',
                                        backgroundColor: 'red',
                                        height: '100%',
                                        zIndex: '1'
                                    }}
                                ></div>
                                {timeSlots.map((time, index) => (
                                    <div className={styles.timeBox} key={index}>
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.formattedDataBox}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                {formattedData.map((item, index) => {
                                    const checkOddEven = index % 2 === 0;
                                    const margin = handleWidth(item.assignee.displayName) * 113;
                                    return (
                                        <div key={index} className={`${styles.tablebox} ${checkOddEven ? styles.even : styles.odd}`}>
                                            <div className={styles.userLists}>
                                                <div key={item.assignee.accountId}>
                                                    <div className={styles.userBox}>
                                                        <div className={styles.userDetails}>
                                                            <div className={styles.userName}>
                                                                <Tooltip content={item.assignee.displayName}>
                                                                    <img
                                                                        src={item.assignee.assigneeUrl}
                                                                        className={styles.userImg}
                                                                        alt={item.assignee.displayName}
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Droppable droppableId={String(index)}>
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className={styles.issueLists} style={{ marginLeft: `${margin}px` }}>
                                                        {item.tasks.map((task, index) => {
                                                            const taskWidth = calculateTaskWidth(task.originalTime);
                                                            const taskStatusClass = getTaskStatusClass(task);
                                                            if (task.key) {
                                                                return (
                                                                    <Draggable
                                                                        key={task.id}
                                                                        draggableId={task.id}
                                                                        index={index}
                                                                    >
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className={`${styles.cardContainer} ${taskStatusClass}`}
                                                                                style={{
                                                                                    width: `${taskWidth < 4 ? 4 : taskWidth}%`,
                                                                                    ...provided.draggableProps.style
                                                                                }}>
                                                                                {task.key}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div
                                                                        key={task.key}
                                                                        id={task.key}
                                                                        className={`${styles.blankCard} `}
                                                                        style={{ width: `${taskWidth}%` }}>
                                                                    </div>
                                                                );
                                                            }
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    );
                                })}
                            </DragDropContext>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default DailyWorklog;
