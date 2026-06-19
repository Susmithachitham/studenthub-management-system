const API = "http://127.0.0.1:studenthub-management-system-production.up.railway.app/students";
let editId = null;
async function addStudent(){

    const name =
    document.getElementById("name").value;

    const email =
    document.getElementById("email").value;

    const course =
    document.getElementById("course").value;

    if(editId){

        const response = await fetch(
            `${API}/${editId}`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name,
                    email,
                    course
                })
            }
        );

        const result =
        await response.json();

        alert(result.message);

        editId = null;

    }else{

        const response = await fetch(
            API,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name,
                    email,
                    course
                })
            }
        );

        const result =
        await response.json();

        alert(result.message);
    }

    document.getElementById("name").value="";
    document.getElementById("email").value="";
    document.getElementById("course").value="";

    loadStudents();
}

async function loadStudents() {

    const response = await fetch(API);

    const students = await response.json();

    document.getElementById(
"totalStudents"
).innerText = students.length;

const courses =
new Set(
students.map(
student => student.course
)
);

document.getElementById(
"totalCourses"
).innerText = courses.size;

    let html = "";

    students.forEach(student => {
html += `
<div class="student-card">

    <h3>${student.name}</h3>

    <p>📧 ${student.email}</p>

    <p>🎓 ${student.course}</p>

    <div class="actions">

        <button
        class="edit-btn"
        onclick="editStudent(
        ${student.id},
        '${student.name}',
        '${student.email}',
        '${student.course}'
        )">

        Edit

        </button>

        <button
        class="delete-btn"
        onclick="deleteStudent(${student.id})">

        Delete

        </button>

    </div>

</div>
`;
    });

    document.getElementById("students").innerHTML = html;
}

loadStudents();

function searchStudents(){

    const value =
    document.getElementById(
    "search"
    ).value.toLowerCase();

    const cards =
    document.querySelectorAll(
    ".student-card"
    );

    cards.forEach(card => {

        const text =
        card.innerText.toLowerCase();

        if(text.includes(value))
            card.style.display = "block";
        else
            card.style.display = "none";
    });
}

async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete?"
    );

    if (!confirmDelete) {
        return;
    }

    const response = await fetch(
        `${API}/${id}`,
        {
            method: "DELETE"
        }
    );

    const result = await response.json();

    alert(result.message);

    loadStudents();
}

function editStudent(id,name,email,course){

    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("course").value = course;

    editId = id;
}

