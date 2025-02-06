/*Cargar Proyectos */
document.addEventListener("DOMContentLoaded", function() {
  loadProjects();
});
function loadProjects() {
  const projectListContainer = document.getElementById("projectList");
  projectListContainer.innerHTML = '';
  const request = indexedDB.open("projectDB", 1);

  request.onsuccess = function(e) {
    const db = e.target.result;
    const transaction = db.transaction("projects", "readonly");
    const store = transaction.objectStore("projects");

    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = function() {
      const projects = getAllRequest.result;

      projects.forEach((project) => {
        const projectDiv = document.createElement("div");
        projectDiv.classList.add("project-card");

        projectDiv.innerHTML = `<h3>${project.name}</h3>`;

        const loadButton = document.createElement("button");
        loadButton.textContent = "Cargar Proyecto";
        loadButton.onclick = function() {
          loadProject(project.name);
        };
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar Proyecto";
        deleteButton.onclick = function() {
          deleteProject(project.name, projectDiv);
        };

        projectDiv.appendChild(loadButton);
        projectDiv.appendChild(deleteButton);

        projectListContainer.appendChild(projectDiv);
      });
    };
  };

  request.onerror = function() {
    alert("Error al cargar los proyectos");
  };
}
function loadProject(projectName) {
  const request = indexedDB.open("projectDB", 1);

  request.onsuccess = function(e) {
    const db = e.target.result;
    const transaction = db.transaction("projects", "readonly");
    const store = transaction.objectStore("projects");

    const getRequest = store.get(projectName);
    getRequest.onsuccess = function() {
      const project = getRequest.result;

      localStorage.setItem("currentProject", JSON.stringify(project));

      window.location.href = "scene.html";
    };

    getRequest.onerror = function() {
      alert("Error al cargar el proyecto");
    };
  };

  request.onerror = function() {
    alert("Error al acceder a la base de datos");
  };
}
function deleteProject(projectName, projectDiv) {
  const request = indexedDB.open("projectDB", 1);

  request.onsuccess = function(e) {
    const db = e.target.result;
    const transaction = db.transaction("projects", "readwrite");
    const store = transaction.objectStore("projects");

    const deleteRequest = store.delete(projectName);
    deleteRequest.onsuccess = function() {
      alert("Proyecto eliminado correctamente");
      projectList.removeChild(projectDiv);
    };

    deleteRequest.onerror = function() {
      alert("Error al eliminar el proyecto");
    };
  };

  request.onerror = function() {
    alert("Error al acceder a la base de datos");
  };
}
