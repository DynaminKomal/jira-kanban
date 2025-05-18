import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import ResourcesPage from './Resources/ResourcesPage'
import GroupByFilter from '../HOC/GroupByFilter/GroupByFilter'
import ProjectResource from './Resources/ProjectResource'

const Worklog = () => {
    const [selectedItem, setSelectedItem] = useState("")
    return (
        <div className={styles.HomePage}>
            <div className={styles.mainHeading}>
                <spna>
                    Jira Estimates
                </spna>
                <span className={styles.anotherHeading}>Worklog</span>
            </div>
            <div className={styles.mainContainer}>
                <GroupByFilter selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                {selectedItem === "Project" ? <ProjectResource /> : <ResourcesPage />}
            </div>
        </div>
    )
}

export default Worklog