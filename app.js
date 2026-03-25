// Apuntando a tu backend en Render
const API_URL = "https://taskmanager-pg-back.onrender.com/comments";

const API = {
  async getComments() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener comentarios");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async createComment(commentData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error("Error al crear el comentario");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async deleteComment(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el comentario");
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

const UI = {
  commentsList: document.getElementById("commentsList"),
  form: document.getElementById("commentForm"),
  usernameInput: document.getElementById("username"),
  messageInput: document.getElementById("message"),

  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Hace un momento";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;

    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  },

  renderComments(comments) {
    this.commentsList.innerHTML = ""; // Limpiar lista

    if (comments.length === 0) {
      this.commentsList.innerHTML =
        '<p class="empty-message">No hay comentarios aún.</p>';
      return;
    }

    comments.forEach((comment) => {
      const card = document.createElement("div");
      card.className = "comment-card";
      card.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">@${comment.username}</span>
                    <span class="comment-date">${this.formatTimeAgo(comment.date)}</span>
                </div>
                <div class="comment-body">
                    <p>${comment.message}</p>
                </div>
                <button class="delete-btn" data-id="${comment._id}">Eliminar</button>
            `;
      this.commentsList.appendChild(card);
    });
  },

  clearForm() {
    this.form.reset();
  },
};

const App = {
  async init() {
    // Cargar comentarios al iniciar
    await this.loadComments();

    // Event Listeners
    UI.form.addEventListener("submit", (e) => this.handlePost(e));

    // Event Delegation para los botones de eliminar
    UI.commentsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        this.handleDelete(id);
      }
    });
  },

  async loadComments() {
    try {
      const comments = await API.getComments();
      UI.renderComments(comments);
    } catch (error) {
      console.error("Hubo un problema al cargar los comentarios.");
    }
  },

  async handlePost(e) {
    e.preventDefault();

    const username = UI.usernameInput.value.trim();
    const message = UI.messageInput.value.trim();

    if (!username) {
      alert("El nombre de usuario no puede estar vacío.");
      return;
    }
    if (username.length > 50) {
      alert("El nombre de usuario no puede tener más de 50 caracteres.");
      return;
    }
    if (message.length < 5 || message.length > 300) {
      alert("El mensaje debe tener entre 5 y 300 caracteres.");
      return;
    }

    const newComment = {
      username,
      message,
      date: new Date().toISOString(),
    };

    try {
      await API.createComment(newComment);
      UI.clearForm();
      await this.loadComments();
    } catch (error) {
      alert("No se pudo publicar el comentario.");
    }
  },

  async handleDelete(id) {
    const confirmacion = confirm(
      "¿Estás seguro de que deseas eliminar este comentario?",
    );

    if (confirmacion) {
      try {
        await API.deleteComment(id);
        await this.loadComments();
      } catch (error) {
        alert("No se pudo eliminar el comentario.");
      }
    }
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
