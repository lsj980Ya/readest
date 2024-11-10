import clsx from 'clsx';
import React, { useEffect } from 'react';

import { useReaderStore } from '@/store/readerStore';
import { useEnv } from '@/context/EnvContext';
import useDragBar from '../../hooks/useDragBar';
import NotebookHeader from './Header';
import NoteEditor from './NoteEditor';
import { TextSelection } from '@/utils/sel';
import { BookNote } from '@/types/book';
import { uniqueId } from '@/utils/misc';
import BooknoteItem from '../sidebar/BooknoteItem';

const MIN_NOTEBOOK_WIDTH = 0.05;
const MAX_NOTEBOOK_WIDTH = 0.45;

const Notebook: React.FC<{ width: string; isPinned: boolean }> = ({ width, isPinned }) => {
  const { envConfig } = useEnv();
  const { settings, sideBarBookKey, notebookWidth } = useReaderStore();
  const { isNotebookVisible, isNotebookPinned } = useReaderStore();
  const { notebookNewAnnotation, notebookEditAnnotation } = useReaderStore();
  const { setNotebookWidth, setNotebookPin, toggleNotebookPin } = useReaderStore();
  const { getConfig, saveConfig, getView, setNotebookVisible, updateBooknotes } = useReaderStore();
  const { setNotebookNewAnnotation, setNotebookEditAnnotation } = useReaderStore();

  const handleNotebookResize = (newWidth: string) => {
    setNotebookWidth(newWidth);
    settings.globalReadSettings.notebookWidth = newWidth;
  };

  const handleTogglePin = () => {
    toggleNotebookPin();
    settings.globalReadSettings.isNotebookPinned = !isNotebookPinned;
  };

  const handleClickOverlay = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setNotebookVisible(false);
  };

  const handleDragMove = (e: MouseEvent) => {
    const widthFraction = 1 - e.clientX / window.innerWidth;
    const newWidth = Math.max(MIN_NOTEBOOK_WIDTH, Math.min(MAX_NOTEBOOK_WIDTH, widthFraction));
    handleNotebookResize(`${Math.round(newWidth * 10000) / 100}%`);
  };

  const handleSaveNote = (selection: TextSelection, note: string) => {
    if (!sideBarBookKey) return;
    const view = getView(sideBarBookKey);
    const config = getConfig(sideBarBookKey)!;

    const cfi = view?.getCFI(selection.index, selection.range);
    if (!cfi) return;

    const { booknotes: annotations = [] } = config;
    const annotation: BookNote = {
      id: uniqueId(),
      type: 'annotation',
      cfi,
      note,
      href: selection.href || '',
      text: selection.text,
      created: Date.now(),
    };
    annotations.push(annotation);
    const updatedConfig = updateBooknotes(sideBarBookKey, annotations);
    if (updatedConfig) {
      saveConfig(envConfig, sideBarBookKey, updatedConfig, settings);
    }
    setNotebookNewAnnotation(null);
  };

  const handleEditNote = (annotation: BookNote) => {
    if (!sideBarBookKey) return;
    const config = getConfig(sideBarBookKey)!;
    const { booknotes: annotations = [] } = config;
    const existingIndex = annotations.findIndex((item) => item.id === annotation.id);
    if (existingIndex === -1) return;
    annotation.modified = Date.now();
    annotations[existingIndex] = annotation;
    const updatedConfig = updateBooknotes(sideBarBookKey, annotations);
    if (updatedConfig) {
      saveConfig(envConfig, sideBarBookKey, updatedConfig, settings);
    }
    setNotebookEditAnnotation(null);
  };

  useEffect(() => {
    setNotebookWidth(width);
    setNotebookPin(isPinned);
    setNotebookVisible(isPinned);
  }, []);

  const { handleMouseDown } = useDragBar(handleDragMove);
  const deleteNote = (note: BookNote) => {
    if (!sideBarBookKey) return;
    const config = getConfig(sideBarBookKey);
    if (!config) return;
    const { booknotes = [] } = config;
    const updatedNotes = booknotes.filter((item) => item.id !== note.id);
    const updatedConfig = updateBooknotes(sideBarBookKey, updatedNotes);
    if (updatedConfig) {
      saveConfig(envConfig, sideBarBookKey, updatedConfig, settings);
    }
  };

  if (!sideBarBookKey) return null;

  const config = getConfig(sideBarBookKey);
  const { booknotes: allNotes = [] } = config || {};
  const annotationNotes = allNotes
    .filter((note) => note.type === 'annotation' && note.note)
    .sort((a, b) => b.created - a.created);
  const excerptNotes = allNotes
    .filter((note) => note.type === 'excerpt')
    .sort((a, b) => a.created - b.created);

  return isNotebookVisible ? (
    <>
      {!isPinned && (
        <div className='overlay fixed inset-0 z-10 bg-black/20' onClick={handleClickOverlay} />
      )}
      <div
        className={clsx(
          'notebook-container bg-base-200 right-0 z-20 h-full min-w-60 select-none',
          'rounded-window-top-right rounded-window-bottom-right',
          !isPinned && 'shadow-2xl',
        )}
        style={{
          width: `${notebookWidth}`,
          maxWidth: `${MAX_NOTEBOOK_WIDTH * 100}%`,
          position: isPinned ? 'relative' : 'absolute',
        }}
      >
        <div
          className='drag-bar absolute left-0 top-0 h-full w-0.5 cursor-col-resize'
          onMouseDown={handleMouseDown}
        />
        <NotebookHeader isPinned={isPinned} handleTogglePin={handleTogglePin} />
        <div className='max-h-[calc(100vh-44px)] overflow-y-auto px-3'>
          <div>{excerptNotes.length > 0 && <p className='pt-1 text-sm'>Excerpts</p>}</div>
          <ul className=''>
            {excerptNotes.map((item, index) => (
              <li key={`${index}-${item.id}`} className='my-2'>
                <div
                  tabIndex={0}
                  className='collapse-arrow border-base-300 collapse border bg-white'
                >
                  <div
                    className='collapse-title h-9 min-h-9 p-2 pr-8 text-sm font-medium'
                    style={
                      {
                        '--top-override': '1.2rem',
                        '--end-override': '0.7rem',
                      } as React.CSSProperties
                    }
                  >
                    <p className='line-clamp-1'>{item.text || `Excerpt ${index + 1}`}</p>
                  </div>
                  <div
                    className='collapse-content select-text px-3 pb-0 text-xs'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className='hyphens-auto text-justify'>{item.text}</p>
                    <div className='flex justify-end'>
                      <button
                        className={clsx(
                          'btn btn-ghost settings-content hover:bg-transparent',
                          'flex h-[1em] min-h-[1em] items-end p-0',
                        )}
                        onClick={deleteNote.bind(null, item)}
                      >
                        <div className='align-bottom text-xs text-red-400'>Delete</div>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div>
            {(notebookNewAnnotation || annotationNotes.length > 0) && (
              <p className='pt-1 text-sm'>Notes</p>
            )}
          </div>
          {(notebookNewAnnotation || notebookEditAnnotation) && (
            <NoteEditor onSave={handleSaveNote} onEdit={handleEditNote} />
          )}
          <ul className=''>
            {annotationNotes.map((item, index) => (
              <BooknoteItem
                key={`${index}-${item.cfi}`}
                bookKey={sideBarBookKey}
                item={item}
                editable={true}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  ) : null;
};

export default Notebook;