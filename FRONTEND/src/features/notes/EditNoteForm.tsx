import { useState, useEffect, ChangeEvent } from "react";
import {
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from "./notesApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import { INote, IUser } from "../../types";
import { getErrorMessage } from "../../app/utils/errorUtils";

const EditNoteForm = ({ note, users }: { note: INote, users: IUser[] }) => {
  const { isManager, isAdmin } = useAuth();
  const [updateNote, { isLoading, isSuccess, isError, error }] = useUpdateNoteMutation();
  const [deleteNote, { isSuccess: isDelSuccess, isError: isDelError, error: delerror }] = useDeleteNoteMutation();

  const navigate = useNavigate();

  const [user, setUser] = useState(note.user._id);
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [completed, setCompleted] = useState<boolean>(note.completed);

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setUser("");
      setTitle("");
      setText("");
      setCompleted(false);
      navigate("/dash/notes");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  const onUserChanged = (e: ChangeEvent<HTMLSelectElement>) => setUser(e.target.value);
  const onTitleChanged = (e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const onTextChanged = (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value);
  const onCompletedChanged = (completed: boolean) => setCompleted(!completed);

  const canSave =
    [user, title, text, typeof completed === "boolean"].every(Boolean) &&
    !isLoading;

  const onSaveNoteClicked = async () => {
    await updateNote({
      id: note.id,
      user,
      title,
      text,
      completed,
    });
  };

  const onDeleteNoteClicked = async () => {
    await deleteNote({ id: note.id });
  };

  const options = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.username}
    </option>
  ));

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const validUserClass = !user ? "form__input--incomplete" : "";
  const validTitleClass = !title ? "form__input--incomplete" : "";
  const validTextClass = !text ? "form__input--incomplete" : "";
  const validCompletedClass = typeof completed !== "boolean" ? "form__input--incomplete" : "";

  let deleteButton = null;
  if (isManager || isAdmin) {
    deleteButton = (
      <button
        className="icon-button"
        title="Delete"
        onClick={onDeleteNoteClicked}
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    );
  }

  const content = (
    <>
      <p className={errClass}>{getErrorMessage(error || delerror)}</p>

      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__title-row">
          <h2>Edit Note #{note.id}</h2>

          <div className="form__action-buttons">
            <button
              className="icon-button"
              title="Save"
              onClick={onSaveNoteClicked}
              disabled={!canSave}
            >
              <FontAwesomeIcon icon={faSave} />
            </button>
            {deleteButton}
          </div>
        </div>

        <label className="form__label" htmlFor="title">
          Title:
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          onChange={onTitleChanged}
        />

        <label className="form__label" htmlFor="text">
          Text:
        </label>
        <input
          className={`form__input form__input__text ${validTextClass}`}
          id="text"
          name="text"
          type="text"
          autoComplete="off"
          value={text}
          onChange={onTextChanged}
        />

        <div className="form__edit__details">
          <section>
            <label className="form__label" htmlFor="note-completed">
              WORK COMPLETE
            </label>
            <input
              className={`form__checkbox ${validCompletedClass}`}
              id="note-completed"
              name="note-completed"
              type="checkbox"
              checked={completed}
              onChange={() => onCompletedChanged(completed)}
            />

            <label className="form__label" htmlFor="user">
              ASSIGNED TO
            </label>
            <select
              id="user"
              name="user"
              className={`form__select ${validUserClass}`}
              value={user}
              onChange={onUserChanged}
            >
              {options}
            </select>
          </section>

          <section>
            <label>Created:</label>
            <label>{note.createdAt.toString()}</label>

            <label>Updated:</label>
            <label>{note.updatedAt.toString()}</label>
          </section>
        </div>
      </form>
    </>
  );

  return content;
};
export default EditNoteForm;
