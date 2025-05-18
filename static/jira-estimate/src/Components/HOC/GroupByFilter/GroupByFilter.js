import React, { useEffect, useState, useRef } from 'react'
import styles from './styles.module.scss'
import dropdownDownpIcon from '../../../assests/images/Icon feather-chevron-down.svg'
import dropdownUpIcon from '../../../assests/images/Icon feather-chevron-down.svg'
import { useOnOutsideClick } from '../useOnOutsideClick'



const GroupByFilter = (props) => {
  const { selectedItem, setSelectedItem } = props
  const [showItems, setShowItem] = useState(false)


  const GroupByList = [
    { id: 1, name: "Project" },
    { id: 2, name: "Assignee" },
    { id: 3, name: "None" },
  ]



  const handelDropDown = () => {
    setShowItem(!showItems)
  }

  const handleFilterType = (project_name) => {
    setSelectedItem(project_name)
    setShowItem(false)

  }

  const dropDownRef = useRef();
  useOnOutsideClick(dropDownRef, () => {
    if (showItems) setShowItem(false);
  });



  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSelect}>
        <div className={styles.text}>GROUP BY</div>
        <div className={showItems ? styles.select_box__box_active : styles.select_box__box} onClick={handelDropDown}>
          <div className={styles.select_box__container}>
            <div className={styles.select_box__selected_item} ref={dropDownRef} >
              {selectedItem ? selectedItem : "None"}
            </div>
            <div className={styles.select_box__arrow} onClick={handelDropDown}>
              {showItems ? <img src={dropdownUpIcon} alt="" /> : <img src={dropdownDownpIcon} alt="" />}
            </div>

            <div
              style={{ display: showItems ? "block" : "none", }}
              className={styles.select_box__items}
            >
              {GroupByList?.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleFilterType(item.name)}>
                  {item?.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupByFilter