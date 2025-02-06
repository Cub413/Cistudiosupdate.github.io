class UndoRedoManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  addAction(action) {
    this.undoStack.push(action);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 0) {
      const action = this.undoStack.pop();
      action.undo();
      this.redoStack.push(action);
    } else {
      console.warn("No hay acciones para deshacer.");
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const action = this.redoStack.pop();
      action.redo();
      this.undoStack.push(action);
    } else {
      console.warn("No hay acciones para rehacer.");
    }
  }
}
const undoRedoManager = new UndoRedoManager();