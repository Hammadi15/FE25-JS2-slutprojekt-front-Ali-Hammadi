type Assignment = {
  id: string;
  title: string;
  description: string;
  category: "ux" | "frontend" | "backend";
  status: "new" | "doing" | "done";
  assignedTo?: string;
  timestamp: string;
};

type Member = {
  id: string;
  name: string;
  category: "ux" | "frontend" | "backend";
};

const API_URL = "http://localhost:3000";
let members: Member[] = [];

//  LOAD MEMBERS

async function loadMembers() {
  const res = await fetch(`${API_URL}/members`);
  members = await res.json();
  renderMembers();
}

//  RENDER MEMBERS

function renderMembers() {
  const membersDiv = document.getElementById("members");
  if (!membersDiv) return;

  membersDiv.innerHTML = "";

  members.forEach((member) => {
    const container = document.createElement("div");

    container.innerHTML = `
      <strong>${member.name}</strong> (${member.category})
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", async () => {
      await fetch(`${API_URL}/members/${member.id}`, {
        method: "DELETE",
      });

      await loadMembers();
      await loadAssignments();
    });

    container.appendChild(deleteBtn);
    container.appendChild(document.createElement("hr"));

    membersDiv.appendChild(container);
  });
}

//  LOAD ASSIGNMENTS

async function loadAssignments() {
  const newDiv = document.getElementById("newAssignments");
  const doingDiv = document.getElementById("doingAssignments");
  const doneDiv = document.getElementById("doneAssignments");

  if (!newDiv || !doingDiv || !doneDiv) return;

  const res = await fetch(`${API_URL}/assignments`);
  const assignments: Assignment[] = await res.json();

  newDiv.innerHTML = "";
  doingDiv.innerHTML = "";
  doneDiv.innerHTML = "";

  assignments.forEach((assignment) => {
    const container = document.createElement("div");

    container.innerHTML = `
      <h3>${assignment.title}</h3>
      <p>${assignment.description}</p>
      <p>Status: ${assignment.status}</p>
      <p>Category: ${assignment.category}</p>
            <p>timestamp: ${assignment.timestamp}</p>

    `;

    // Show assigned member
    if (assignment.assignedTo) {
      const member = members.find((m) => m.id === assignment.assignedTo);

      if (member) {
        const assignedText = document.createElement("p");
        assignedText.textContent = `Assigned to: ${member.name}`;
        container.appendChild(assignedText);
      }
    }

    // Dropdown for assigning
    if (assignment.status === "new") {
      const select = document.createElement("select");

      members.filter((m) => m.category === assignment.category)
        .forEach((member) => {
          const option = document.createElement("option");
          option.value = member.id;
          option.textContent = member.name;
          select.appendChild(option);
        });

      const assignBtn = document.createElement("button");
      assignBtn.textContent = "Assign";

      assignBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/assignments/${assignment.id}/assign`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: select.value,
          }),
        });

        await loadAssignments();
      });

      container.appendChild(select);
      container.appendChild(assignBtn);
    }

    // Mark as done
    if (assignment.status === "doing") {
      const doneBtn = document.createElement("button");
      doneBtn.textContent = "Mark as Done";

      doneBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/assignments/${assignment.id}/done`, {
          method: "PATCH",
        });

        await loadAssignments();
      });

      container.appendChild(doneBtn);
    }

    // Delete assignment
    if (assignment.status === "done") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/assignments/${assignment.id}`, {
          method: "DELETE",
        });

        await loadAssignments();
      });

      container.appendChild(deleteBtn);
    }
    container.appendChild(document.createElement("hr"));

    if (assignment.status === "new") {
      newDiv.appendChild(container);
    }

    if (assignment.status === "doing") {
      doingDiv.appendChild(container);
    }

    if (assignment.status === "done") {
      doneDiv.appendChild(container);
    }
  });
}

//  CREATE ASSIGNMENT

const assignmentForm = document.getElementById(
  "assignmentForm",
) as HTMLFormElement;

assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = (document.getElementById("title") as HTMLInputElement).value;
  const description = (
    document.getElementById("description") as HTMLInputElement
  ).value;
  const category = (document.getElementById("category") as HTMLSelectElement)
    .value;

  await fetch(`${API_URL}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, category }),
  });

  assignmentForm.reset();
  await loadAssignments();
});

//  CREATE MEMBER

const memberForm = document.getElementById("memberForm") as HTMLFormElement;

memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = (document.getElementById("memberName") as HTMLInputElement)
    .value;
  const category = (
    document.getElementById("memberCategory") as HTMLSelectElement
  ).value;

  await fetch(`${API_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category }),
  });

  memberForm.reset();

  await loadMembers();
  await loadAssignments();
});

//  INIT

async function init() {
  await loadMembers();
  await loadAssignments();
}

init();
