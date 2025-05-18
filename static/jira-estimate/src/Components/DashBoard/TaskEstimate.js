import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import Filter from '../HOC/Filter/Filter'
import Table from './TableList/Table'
import { invoke } from '@forge/bridge'
import RedExclamation from '../../assests/images/exclamationRed.svg'
import exclamationOrangeImg from '../../assests/images/exclamationOrange.svg'

const TaskEstimate = () => {
    const [project, setProject] = useState("")
    const [selectedUser, setSelectedUser] = useState([])
    const [userList, setUserList] = useState([])
    const [priorityList, setPriortyList] = useState([])
    const [allIssues, setAllIssues] = useState([])
    const [apiData, setApiData] = useState([])
    const [selectedType, setSelectedType] = useState([])
    const [selectedLabel, setSelectedLabel] = useState([])
    const [selectedPriority, setSelectedPriority] = useState([])
    const [issueType, setIssueType] = useState([])
    const [stuckCount, setStuckCount] = useState(0)
    const [inProgressCount, setInProgressCount] = useState(0)   // which issues have passed 80% time and not done 
    const [isTotalTimeShow, setTotalTimeShow] = useState(false)

    const [input, setInput] = useState("")

    useEffect(() => {
        (async () => {
            // Can be done using resolvers
            // TO get all issues 
            await invoke('updateCustomField');

            const data = await invoke('getAllIssues');
            setApiData(data);

        })();
    }, []);

    useEffect(() => {
        // Get user list
        const userList = apiData.map(item => item.assignee);
        // Remove duplicate users from the array
        const uniqueUser = [...new Map(userList.map(item => [item["accountId"], item])).values()];
        setUserList(uniqueUser.filter(item => Object.keys(item).length));
        //Get issue type 
        const issueTypeList = apiData.map(item => item.issuetype);
        // Remove duplicate issue type from the array
        const uniqueIssueType = [...new Map(issueTypeList.map(item => [item["name"], item])).values()];
        setIssueType(uniqueIssueType.filter(item => Object.keys(item).length))

        // get priority lists
        const prioritiesLists = apiData.map(item => item.priority);
        // Remove duplicate priority from the array
        const uniquePriorityLists = [...new Map(prioritiesLists.map(item => [item["priorityName"], item])).values()];
        setPriortyList(uniquePriorityLists.filter(item => Object.keys(item).length))


        // Filter data based on selected user, selected type, and input
        let filteredData = apiData;


        if (project) {
            filteredData = filteredData.filter(item => item.project.project_key == project);
        }

        if (selectedUser.length > 0) {
            filteredData = filteredData.filter(item => selectedUser.includes(item.assignee.accountId)).sort((a, b) => a.prior - b.prior);;
        }

        if (selectedType.length > 0) {
            filteredData = filteredData.filter(item => selectedType.includes(item.issuetype.name));
        }

        if (input) {
            const inputLowerCase = input.toLowerCase();
            filteredData = filteredData.filter(item => item.summary.toLowerCase().includes(inputLowerCase));
        }
        if (selectedLabel.length > 0) {
            filteredData = filteredData.filter((item) => {
                if (selectedLabel.includes(1) && selectedLabel.includes(2) && selectedLabel.includes(3) && selectedLabel.includes(4)) {
                    return Object.keys(item.assignee).length === 0 && item.originalTime == null && item?.labels?.includes('STUCK') && item?.labels?.includes('CLIENT-REPORTED-BUG');
                }
                else if (selectedLabel.includes(1) && selectedLabel.includes(2) && selectedLabel.includes(3)) {
                    return Object.keys(item.assignee).length === 0 && item.originalTime == null && item?.labels?.includes('STUCK');
                } else if (selectedLabel.includes(1) && selectedLabel.includes(2)) {
                    return Object.keys(item.assignee).length === 0 && item.originalTime == null;
                }
                else if (selectedLabel.includes(1)) {
                    return Object.keys(item.assignee).length === 0;
                } else if (selectedLabel.includes(2)) {
                    return item.originalTime === null;
                } else if (selectedLabel.includes(3)) {
                    return item?.labels?.includes('STUCK');
                }
                else if (selectedLabel.includes(4)) {
                    return item?.labels?.includes('CLIENT-REPORTED-BUG');
                }
            })

        }
        if (selectedPriority.length > 0) {
            filteredData = filteredData.filter(item => selectedPriority.includes(item.priority.priorityName));
        }

        //get stuck count of issue
        let stuckObjects = filteredData.filter(item => item.labels && item.labels.includes('STUCK'));
        let countOfStuckObjects = stuckObjects.length;
        setStuckCount(countOfStuckObjects)

        // passed 80% time of original estimate
        let inProgressObject = filteredData.filter(item => {
            if (item.actualTime !== null && item.originalTime !== null) {
                return (item.status !== 'Done' && (item.actualTime >= 0.8 * item.originalTime))
            }
        });

        let countInProgressObject = inProgressObject.length;
        setInProgressCount(countInProgressObject)


        setAllIssues(filteredData);
    }, [apiData, selectedUser, selectedType, input, selectedLabel, project, selectedPriority]);

    useEffect(() => {
        if (selectedUser.length > 0) {
            setTotalTimeShow(true)
        } else {
            setTotalTimeShow(false)
        }
    }, [selectedUser])

    const handleClearFilter = () => {
        setSelectedUser([])
        setSelectedLabel([])
        setSelectedPriority([])
        setSelectedType([])
        setInput("")
        setProject("")
    }

    return (
        <div className={styles.HomePage}>
            <div className={styles.mainHeading}>
                <spna>
                    Jira Estimates
                </spna>
                <span className={styles.anotherHeading}>Task Estimates</span>
            </div>
            <div className={styles.mainContainer}>
                <Filter setProject={setProject} setSelectedUser={setSelectedUser} selectedUser={selectedUser} userList={userList} input={input} setInput={setInput}
                    selectedType={selectedType} setSelectedType={setSelectedType} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} issueType={issueType}
                    priorityList={priorityList} selectedPriority={selectedPriority} setSelectedPriority={setSelectedPriority} handleClear={handleClearFilter}
                />
                {(stuckCount > 0 || inProgressCount > 0) && <div className={styles.showCounts}>
                    {stuckCount > 0 && <div className={styles.stuckCount}>
                        <img src={RedExclamation} alt='red exclamation icon' className={styles.RedExclamation} />{stuckCount}
                    </div>}
                    {inProgressCount > 0 && <div className={styles.stuckCount}>
                        <img src={exclamationOrangeImg} alt='orange exclamation icon' className={styles.RedExclamation} />{inProgressCount}
                    </div>}
                </div>}
                <Table allIssues={allIssues} isTotalTimeShow={isTotalTimeShow} />
            </div>
        </div>
    )
}

export default TaskEstimate