/* eslint-disable no-nested-ternary, max-len */
import React, { useState, DragEvent } from 'react';
// @ts-ignore
import { Draggable, Droppable } from 'react-drag-and-drop';
import styles from './Palette.module.scss';
import { IComponents, IProps } from './Palette.types';
import { parse, stringify } from '../../helpers/jsonMethods';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  removeItem, enableItem, setCurrentItem, setItem, setCurrentBoard,
} from '../../redux/slices/boardsSlice';
import Display from './Display/Display';
import Operators from './Operators/Operators';
import Numbers from './Numbers/Numbers';
import EqualButton from './EqualButton/EqualButton';
import Line from './Line/Line';
import { isConstructor, isDisplay, isRuntimeMode } from '../../helpers/checkers';

function Palette({ items, board, disabledItems }: IProps) {
  const constructorParts: IComponents = {
    display: <Display />,
    operators: <Operators />,
    numbers: <Numbers />,
    equal: <EqualButton />,
  };

  const { mode } = useAppSelector((state) => state.boards);

  const dispatch = useAppDispatch();

  const [isLineVisible, setIsLineVisible] = useState(false);

  const isCalculatingEnable = isRuntimeMode(mode);

  function switchLineVisibility(bool: boolean) {
    const isDisplayExist = items.some((item) => isDisplay(item));

    if (isConstructor(board) && isDisplayExist) {
      setIsLineVisible(bool);
    }
  }

  function handleDoubleClick(itemId: number) {
    if (isConstructor(board) && !isCalculatingEnable) {
      const boardId = board.id;

      dispatch(removeItem({ boardId, itemId }));
      dispatch(enableItem(itemId));
    }
  }

  function handleDragStart(data: string) {
    if (!isCalculatingEnable) {
      switchLineVisibility(true);

      const parsedData = parse(data);

      if (parsedData) {
        dispatch(setCurrentItem(parsedData));
        dispatch(setCurrentBoard(board));
      }
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, data: string) {
    e.stopPropagation();

    switchLineVisibility(false);

    if (!isCalculatingEnable) {
      const parsedData = parse(data);

      if (board && parsedData) {
        dispatch(setItem({ boardId: board.id, item: parsedData }));
      }
    }
  }

  return (
    <Droppable
      types="item"
    >
      <div className={styles.palette}>
        {isLineVisible && <Line />}

        {items.map((item) => {
          const data = stringify(item);
          const isDisabled = (disabledItems && disabledItems.includes(item.id)) || isCalculatingEnable;
          const isConstructorBoard = isConstructor(board);
          const isDisplayPart = isDisplay(item);

          return (
            <Draggable
              id={item.id}
              enabled={!isDisabled}
              className={isConstructorBoard
                ? isDisplayPart ? styles.draggableNotAllowed : styles.draggable
                : isDisabled ? styles.draggableDisabled : styles.draggableBordered}
              key={item.id}
              type="item"
              data={data}
              onDragStart={() => handleDragStart(data)}
              onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, data)}
              onDoubleClick={() => handleDoubleClick(item.id)}
            >
              <div className={isCalculatingEnable ? styles.part : `${styles.part} ${styles.disabled}`}>{constructorParts[item.name as keyof IComponents]}</div>
            </Draggable>
          );
        })}
      </div>
    </Droppable>
  );
}

export default Palette;
