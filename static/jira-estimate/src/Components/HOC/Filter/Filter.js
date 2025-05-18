import React, { useEffect, useState, useRef } from 'react'
import styles from './styles.module.scss'
import dropdownDownpIcon from '../../../assests/images/Icon feather-chevron-down.svg'
import dropdownUpIcon from '../../../assests/images/Icon feather-chevron-down.svg'
import { useOnOutsideClick } from '../useOnOutsideClick'
import { invoke } from '@forge/bridge';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import searchIcon from '../../../assests/images/search.svg'
import closeIcon from '../../../assests/images/close.svg'


const Filter = (props) => {
  const { setProject, selectedUser,
    setSelectedUser, userList, input,
    setInput, selectedType, setSelectedType,
    selectedLabel, setSelectedLabel, issueType, priorityList,
    selectedPriority, setSelectedPriority, handleClear } = props
  const [showItems, setShowItem] = useState(false)
  const [showType, setShowType] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const [showPriorty, setShowPriorty] = useState(false)
  const [selectedItem, setSelectedItem] = useState('');

  const [projectsList, setProjects] = useState([])

  const labelList = [
    { id: 1, name: "Unassigned", },
    { id: 2, name: "Missing Estimate", },
    { id: 3, name: "Stuck", },
    { id: 4, name: "Client-Reported-Bug", },
  ]

  useEffect(() => {
    (async () => {
      // Can be done using resolvers
      // TO get all projects 
      const data = await invoke('getAllProjects');
      setProjects(data)

    })();
    return () => { };
  }, []);

  const handelDropDown = () => {
    setShowItem(!showItems)
  }
  const handelDropDownType = () => {
    setShowType(!showType)
  }
  const handelDropDownLabel = () => {
    setShowLabel(!showLabel)
  }
  const handleProject = (project_name) => {
    setSelectedItem(project_name)
    setProject(project_name)
    setShowItem(false)

  }

  const handelDropDownPriority = () => {
    setShowPriorty(!showPriorty)
  }

  const dropDownRef = useRef();
  const dropDownRefType = useRef();
  const dropDownRefLabel = useRef();
  const dropDownRefPriority = useRef();

  useOnOutsideClick(dropDownRef, () => {
    if (showItems) setShowItem(false);
  });
  useOnOutsideClick(dropDownRefType, () => {
    if (showType) setShowType(false);
  });
  useOnOutsideClick(dropDownRefLabel, () => {
    if (showLabel) setShowLabel(false);
  });
  useOnOutsideClick(dropDownRefPriority, () => {
    if (showPriorty) setShowPriorty(false);
  });

  const topCount = 4
  const bottomCount = userList.length - topCount;
  const [isOpen, setIsOpen] = useState(false)
  const handleMoreUser = () => {
    setIsOpen(!isOpen)
  }


  const [check, setCheck] = useState(false)
  const handleOnchange = (e, id) => {
    setCheck(e.target.checked)
    if (e.target.checked) {
      setSelectedUser([...selectedUser, id])
    } else if (!e.target.checked) {
      setSelectedUser(selectedUser.filter(e => e != id))
    }
  }

  const handleSelect = (e, id) => {
    if (selectedUser.includes(id)) {
      setSelectedUser(selectedUser.filter(e => e != id))
    } else {
      setSelectedUser([...selectedUser, id])
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleCancel = () => {
    setInput("")
  }

  const handleOnchangeType = (e, id) => {
    if (e.target.checked) {
      setSelectedType([...selectedType, id])
    } else if (!e.target.checked) {
      setSelectedType(selectedType.filter(e => e != id))
    }
  }
  const handleOnchangeLabel = (e, id) => {
    if (e.target.checked) {
      setSelectedLabel([...selectedLabel, id])
    } else if (!e.target.checked) {
      setSelectedLabel(selectedLabel.filter(e => e != id))
    }
  }

  const handleOnchangePriority = (e, id) => {
    if (e.target.checked) {
      setSelectedPriority([...selectedPriority, id])
    } else if (!e.target.checked) {
      setSelectedPriority(selectedPriority.filter(e => e != id))
    }
  }
  window.onclick = function (event) {
    let dropdownBoxClicked = event.target.closest("#dropdownselect");
    if (!dropdownBoxClicked) {
      setIsOpen(false)
    }
  }

  const clearFilter = () => {
    setSelectedItem("")
  }
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSelect}>
        <div className={showItems ? styles.select_box__box_active : styles.select_box__box} >
          <div className={styles.select_box__container}>
            <div className={styles.select_box__selected_item} ref={dropDownRef} onClick={handelDropDown}>
              {selectedItem ? selectedItem : "Project"}
            </div>
            <div className={styles.select_box__arrow} onClick={handelDropDown}>
              {showItems ? <img src={dropdownUpIcon} alt="" /> : <img src={dropdownDownpIcon} alt="" />}
            </div>

            <div
              style={{ display: showItems ? "block" : "none", }}
              className={styles.select_box__items}
            >
              {projectsList?.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleProject(project.key)}>
                  {project?.key}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.userMain}>
          <div className={styles.userContainer}>
            {userList.map((item, index) => {
              if (index < topCount) {
                return (
                  <div key={item.accountId} className={styles.userBox} onClick={(e) => handleSelect(e, item.accountId)}>
                    <Tooltip content={item.displayName}>
                      {(tooltipProps) => (
                        <div className={selectedUser.includes(item.accountId) ? styles.userdetailsActive : styles.userdetails} {...tooltipProps}>
                          <img src={item.assigneeUrl} className={styles.userImage} />
                        </div>
                      )}
                    </Tooltip>
                  </div>
                )
              } else if (index == 4) {
                return (
                  <div key={item.accountId} className={styles.userBox} id="dropdownselect">
                    <div className={styles.userdetails2} onClick={handleMoreUser}>
                      <span>+{bottomCount}</span>
                    </div>
                  </div>
                )
              }
            })}
          </div>
          {isOpen && <div className={styles.userBox2}>
            <div className={styles.user}>
              {userList.map((item, index) => {
                if (topCount <= index) {
                  return (
                    <label className={styles.user2} htmlFor={item.displayName} key={item.accountId} id="dropdownselect">
                      <input type='checkbox' id={item.displayName} onChange={(e) => handleOnchange(e, item.accountId)} checked={selectedUser.indexOf(item.accountId) >= 0} />
                      <img src={item.assigneeUrl} htmlFor={item.displayName} />
                      <span htmlFor={item.displayName}>{item.displayName}</span>
                    </label>
                  )
                }
              })}
            </div>
          </div>}

        </div>

        <div className={showType ? styles.select_box__box_active : styles.select_box__box} style={{ marginRight: '0px' }}>
          <div className={styles.select_box__container}>
            <div className={styles.select_box__selected_item} ref={dropDownRefType} onClick={handelDropDownType}>
              Type {selectedType.length > 0 && <span className={styles.countBox}>
                <span className={styles.count}>{selectedType.length}
                </span></span>}
            </div>
            <div className={styles.select_box__arrow} onClick={handelDropDownType}>
              {showType ? <img src={dropdownUpIcon} alt="" /> : <img src={dropdownDownpIcon} alt="" />}
            </div>

            {showType && (
              <div className={styles.typeBox} ref={dropDownRefType}>
                <div >
                  {issueType.map((type, index) => {
                    return (
                      <label className={styles.type} htmlFor={type.name} key={index}>
                        <input
                          type="checkbox"
                          id={type.name}
                          onChange={(e) => handleOnchangeType(e, type.name)}
                          checked={selectedType.includes(type.name)}
                        />
                        <img src={type.iconUrl} alt={type.name} />
                        <span>{type.name}</span>
                      </label>
                    )

                  })}
                </div>
              </div>)}
          </div>
        </div>

        {/* Filter by label */}
        <div className={showLabel ? styles.select_box__box_active : styles.select_box__box}>
          <div className={styles.select_box__container}>
            <div className={styles.select_box__selected_item} ref={dropDownRefLabel} onClick={handelDropDownLabel}>
              Label {selectedLabel.length > 0 && <span className={styles.countBox}>
                <span className={styles.count}>{selectedLabel.length}
                </span></span>}
            </div>
            <div className={styles.select_box__arrow} onClick={handelDropDownLabel}>
              {showLabel ? <img src={dropdownUpIcon} alt="" /> : <img src={dropdownDownpIcon} alt="" />}
            </div>

            {showLabel && (
              <div className={styles.labelBox} ref={dropDownRefLabel}>
                <div >
                  {labelList.map((label) => {
                    return (
                      <label className={styles.label} htmlFor={label.name} key={label.id}>
                        <input
                          type="checkbox"
                          id={label.name}
                          onChange={(e) => handleOnchangeLabel(e, label.id)}
                          checked={selectedLabel.includes(label.id)}
                        />
                        <span>{label.name}</span>
                      </label>
                    )

                  })}
                </div>
              </div>)}
          </div>
        </div>
        {/* Filter by priority */}
        <div className={showPriorty ? styles.select_box__box_active : styles.select_box__box} style={{ marginRight: '0px' }}>
          <div className={styles.select_box__container}>
            <div className={styles.select_box__selected_item} ref={dropDownRefPriority} onClick={handelDropDownPriority}>
              Priority {selectedPriority.length > 0 && <span className={styles.countBox}>
                <span className={styles.count}>{selectedPriority.length}
                </span></span>}
            </div>
            <div className={styles.select_box__arrow} onClick={handelDropDownPriority}>
              {showPriorty ? <img src={dropdownUpIcon} alt="" /> : <img src={dropdownDownpIcon} alt="" />}
            </div>

            {showPriorty && (
              <div className={styles.typeBox} ref={dropDownRefPriority}>
                <div >
                  {priorityList.map((item, index) => {
                    return (
                      <label className={styles.type} htmlFor={item.priorityName} key={index}>
                        <input
                          type="checkbox"
                          id={item.priorityName}
                          onChange={(e) => handleOnchangePriority(e, item.priorityName)}
                          checked={selectedPriority.includes(item.priorityName)}
                        />
                        <img src={item.priorityUrl} alt={item.priorityName} />
                        <span>{item.priorityName}</span>
                      </label>
                    )

                  })}
                </div>
              </div>)}
          </div>
        </div>
        {(selectedLabel.length > 0 || selectedPriority.length > 0 || selectedUser.length > 0 || selectedType.length > 0 || input.length > 0 || selectedItem.length > 0)
          ?
          <div className={styles.clearFilter} onClick={() => {
            handleClear();
            clearFilter();
          }}>Clear Filter</div> : <div className={styles.blankFilter}></div>
        }
      </div>
      <div className={styles.search}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder='Search...'
        />
        <div>
          {input.length > 0 ? <img src={closeIcon} alt="close icon" onClick={handleCancel} /> :
            <img src={searchIcon} alt="search icon" />}
        </div>


      </div>
    </div >
  )
}

export default Filter