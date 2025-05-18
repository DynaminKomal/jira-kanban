import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { v4 as uuidv4 } from 'uuid';
import rightArrowIcon from '../../../assests/images/Icon awesome-caret-down.svg';
import downArrowIcon from '../../../assests/images/Icon awesome-caret-down (1).svg';
import { invoke, router } from '@forge/bridge';
import Tooltip from '@atlaskit/tooltip';

const ResourcesPage = () => {

    const [allIssues, setAllIssues] = useState([])
    useEffect(() => {
        (async () => {
            // Can be done using resolvers
            // TO get all issues 
            const data = await invoke('getAllIssues', { project_name: "" });
            setAllIssues(data)
        })();
    }, []);



    const [userId, setUserId] = useState("")

    const handleCaretDownIcon = (id) => {
        setUserId(id)
    }
    const handleCaretUpIcon = () => {
        setUserId("")
    }

    let transformedData = [];
    // Get unique weekdays
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    try {
        allIssues.forEach((issue) => {
            const { startDate, actualTime, assignee } = issue;
            const assigneeKey = JSON.stringify(assignee);

            let assigneeEntry = transformedData.find((entry) => entry.assignee === assigneeKey);
            if (!assigneeEntry) {
                assigneeEntry = {
                    assignee: assigneeKey,
                    weekdays: daysOfWeek.map((day) => ({
                        day,
                        totalTime: 0,
                        issues: []
                    })),
                    time: 0
                };
                transformedData.push(assigneeEntry);
            }

            if (startDate !== null) {
                const dayOfWeek = startDate && new Date(startDate).getDay();
                const dayIndex = dayOfWeek - 1;

                if (actualTime) {
                    assigneeEntry.weekdays[dayIndex].issues.push(issue);
                    assigneeEntry.weekdays[dayIndex].totalTime += actualTime || 0;
                }
                assigneeEntry.time += actualTime || 0;
            }
        });

        transformedData.forEach((assigneeEntry) => {
            assigneeEntry.assignee = JSON.parse(assigneeEntry.assignee);
        });


    } catch (error) {
        console.log(error);
    }
    let filteredData = transformedData.filter(item => Object.keys(item.assignee).length !== 0)

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


    const handleOpenIssue = (e, key) => {
        router.open(`/browse/${key}`)
    }

    return (
        <div className={styles.worklogContainer}>
            <div className={styles.ColumnNames}>
                <div className={styles.nameColumn}>
                    <div className={styles.name}>Name</div>
                </div>
                <div className={styles.weekdays}>
                    {daysOfWeek.map((day, index) => {
                        return (
                            <div className={styles.Columns} key={index}>
                                <div className={styles.columnName}>{day}</div>
                            </div>
                        )
                    })}
                </div>
                <div className={styles.totalColumn}>
                    <div className={styles.name}>Total</div>
                </div>
            </div>
            <div className={styles.mainContainer}>
                {filteredData.map((item) => {
                    const id = item.assignee.accountId
                    return (
                        <div className={styles.tablebox}>
                            <div className={styles.userLists}>
                                <div key={item.assignee.accountId}>
                                    <div className={styles.userBox}>
                                        <div className={styles.userDetails}>
                                            <div className={styles.userName}>
                                                {userId == item.assignee.accountId ? <img src={downArrowIcon} className={styles.arrowDown} onClick={handleCaretUpIcon} /> : <img src={rightArrowIcon} className={styles.arrow} onClick={(e) => handleCaretDownIcon(item.assignee.accountId)} />}

                                                <Tooltip content={item.assignee.displayName}>
                                                    {(tooltipProps) => (
                                                        <img src={item.assignee.assigneeUrl} className={styles.userImg} alt="item.assignee.displayName" {...tooltipProps} />
                                                    )}
                                                </Tooltip>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className={styles.issueLists}>
                                {item.weekdays.map((item) => {
                                    return (
                                        <div className={styles.issues}>
                                            <>
                                                {getTime(item.totalTime) ? <div className={styles.cardBox} key={`${item.day}`}>
                                                    <div className={styles.time}>

                                                        {getTime(item.totalTime)}
                                                    </div>
                                                </div> : <div className={styles.cardBoxBlank} key={`${item.day}`}>

                                                </div>}

                                            </>
                                            {id === userId && item.issues.map((item, index) => {
                                                return (
                                                    <div key={item.id} index={index}>
                                                        <div id={item.key} className={styles.cardContainer} onClick={(e) => handleOpenIssue(e, item.key)}>
                                                            <div className={styles.taskName}>{item.summary}</div>
                                                            {item.epicName && <div className={styles.epicBox}>
                                                                <span className={styles.epicName}>{item.epicName}</span></div>}
                                                            <div className={styles.taskDetails}>
                                                                <div className={styles.imgWithProjectKey}>
                                                                    <img src={item.issuetype.iconUrl}
                                                                        name={item.issuetype.name}
                                                                    />
                                                                    <div className={styles.key}>{item.key}</div>
                                                                </div>
                                                                <div className={styles.userBoxActive}>
                                                                    <div id={item.id} className={styles.partitionBox} >
                                                                        <div id="original" className={styles.originalEstimate} title='Original Estimate'>{item.originalTime === null ? "0m" : getTime(item.originalTime)}</div>
                                                                        <div id="actual" title='Actual Estimate' className={(item.status === "In Progress") ? styles.InProgress : (item.status === "Dev Done") ? styles.devDone : (item.status === "QA" || item.status === "Done") ? styles.Done : styles.actualEstimate}>{item.actualTime === null ? "0m" : getTime(item.actualTime)}</div>
                                                                    </div>
                                                                    <img src={item.priority.priorityUrl} name="priority url" className={styles.priorityImg} />
                                                                    {Object.keys(item.assignee).length === 0 ? <div className={styles.blankDiv}></div> :

                                                                        <img src={item.assignee.assigneeUrl} name="user url" />
                                                                    }
                                                                </div>

                                                            </div>
                                                        </div>


                                                    </div>
                                                )
                                            }
                                            )}
                                        </div>)
                                })}
                            </div>
                            <div className={styles.totalList}>
                                {getTime(item.time) ? <div className={styles.cardBox2}>
                                    <div className={styles.time}>
                                        {getTime(item.time)}
                                    </div>
                                </div> : ""}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ResourcesPage