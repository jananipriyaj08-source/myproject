const API_URL = "/api/assignments";

const assignmentForm = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

async function loadAssignments() {
  const search = encodeURIComponent(searchInput.value.trim());
  const status = encodeURIComponent(filterStatus.value);

  try {
    const response = await fetch(
      `${API_URL}?search=${search}&status=${status}`
    );

    const assignments = await response.json();
    displayAssignments(assignments);
  } catch (error) {
    assignmentList.innerHTML =
      '<p class="empty-message">Unable to load assignments.</p>';
  }
}

function displayAssignments(assignments) {
  assignmentList.innerHTML = "";

  if (assignments.length === 0) {
    assignmentList.innerHTML =
      '<p class="empty-message">No assignments found.</p>';
    return;
  }

  assignments.forEach((item) => {
    const card = document.createElement("div");
    card.className = "assignment-card";

    const formattedDate = formatDate(item.deadline);
    const statusClass = item.status.toLowerCase().replace(" ", "-");

    card.innerHTML = `
      <h3>${escapeHTML(item.assignment)}</h3>
      <p><strong>Subject:</strong> ${escapeHTML(item.subject)}</p>
      <p><strong>Deadline:</strong> ${formattedDate}</p>

      <span class="status ${statusClass}">
        ${escapeHTML(item.status)}
      </span>

      <div class="card-actions">
        <button onclick="changeStatus(${item.id}, 'Completed')">
          Complete
        </button>

        <button onclick="changeStatus(${item.id}, 'In Progress')">
          In Progress
        </button>

        <button class="delete-button" onclick="deleteAssignment(${item.id})">
          Delete
        </button>
      </div>
    `;

    assignmentList.appendChild(card);
  });
}

assignmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const assignment = {
    subject: document.getElementById("subject").value.trim(),
    assignment: document.getElementById("assignment").value.trim(),
    deadline: document.getElementById("deadline").value,
    status: document.getElementById("status").value
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(assignment)
    });

    if (!response.ok) {
      throw new Error("Failed to add assignment");
    }

    assignmentForm.reset();
    loadAssignments();
  } catch (error) {
    alert("Unable to add assignment.");
  }
});

async function changeStatus(id, status) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    loadAssignments();
  } catch (error) {
    alert("Unable to update assignment status.");
  }
}

async function deleteAssignment(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this assignment?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete assignment");
    }

    loadAssignments();
  } catch (error) {
    alert("Unable to delete assignment.");
  }
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", loadAssignments);
filterStatus.addEventListener("change", loadAssignments);

loadAssignments();
