const API = "/students";

let chart = null;

/* ==========================
   TOAST
========================== */

function showToast(message){

    const toast =
    document.getElementById(
        "toast"
    );

    toast.innerText =
    message;

    toast.style.display =
    "block";

    setTimeout(()=>{

        toast.style.display =
        "none";

    },3000);
}

/* ==========================
   DARK MODE
========================== */

function toggleDarkMode(){

    document.body.classList.toggle(
        "dark"
    );

    localStorage.setItem(
        "theme",
        document.body.classList.contains(
            "dark"
        )
        ?
        "dark"
        :
        "light"
    );

    closeMenu();
}

if(
    localStorage.getItem(
        "theme"
    ) === "dark"
){

    document.body.classList.add(
        "dark"
    );
}

/* ==========================
   MENU
========================== */

function toggleMenu(){

    const menu =
    document.getElementById(
        "dropdownMenu"
    );

    menu.style.display =
    menu.style.display === "block"
    ?
    "none"
    :
    "block";
}

function closeMenu(){

    document.getElementById(
        "dropdownMenu"
    ).style.display =
    "none";
}

window.onclick =
function(event){

    const menu =
    document.getElementById(
        "dropdownMenu"
    );

    const button =
    document.querySelector(
        ".menu-btn"
    );

    if(
        menu &&
        button &&
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ){

        menu.style.display =
        "none";
    }
};

/* ==========================
   LIVE DATE & TIME
========================== */

function updateClock(){

    const now =
    new Date();

    const time =
    now.toLocaleTimeString();

    const date =
    now.toLocaleDateString(
        "en-IN",
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }
    );

    const liveTime =
    document.getElementById(
        "liveTime"
    );

    const liveDate =
    document.getElementById(
        "liveDate"
    );

    const todayDate =
    document.getElementById(
        "todayDate"
    );

    if(liveTime)
        liveTime.innerText = time;

    if(liveDate)
        liveDate.innerText = date;

    if(todayDate)
        todayDate.innerText = date;
}

setInterval(
    updateClock,
    1000
);

updateClock();

/* ==========================
   ANIMATED COUNTERS
========================== */

function animateCounter(
    id,
    value
){

    let count = 0;

    const element =
    document.getElementById(id);

    if(!element) return;

    const interval =
    setInterval(()=>{

        count++;

        element.innerText =
        count;

        if(
            count >= value
        ){

            clearInterval(
                interval
            );
        }

    },40);
}

/* ==========================
   LOAD STUDENTS
========================== */

async function loadStudents(){

    const response =
    await fetch(API);

    const students =
    await response.json();

    animateCounter(
        "totalStudents",
        students.length
    );

    const courses =
    new Set(
        students.map(
            s=>s.course
        )
    );

    animateCounter(
        "totalCourses",
        courses.size
    );

    // Recent Students

    let recentHtml = "";

    students
    .slice(0,5)
    .forEach(student=>{

        recentHtml += `

        <div class="recent-student">

            <span>
                👨‍🎓 ${student.name}
            </span>

            <span>
                ${student.course}
            </span>

        </div>

        `;
    });

    document.getElementById(
        "recentStudents"
    ).innerHTML =
    recentHtml;

    // Student Cards

    let html = "";

    students.forEach(student=>{

        html += `

        <div class="student-card">

            <h3>
                ${student.name}
            </h3>

            <p>
                🆔 ${student.student_id}
            </p>

            <p>
                📧 ${student.email}
            </p>

            <p>
                🎓 ${student.course}
            </p>

            <p>
                📱 ${student.phone}
            </p>

            <div class="actions">

                <button
                class="view-btn"
                onclick="viewStudent(${student.id})">

                View

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

    document.getElementById(
        "students"
    ).innerHTML =
    html;

    loadChart();
}

/* ==========================
   ADD STUDENT
========================== */

async function addStudent(){

    const name =
    document.getElementById(
        "name"
    ).value;

    const email =
    document.getElementById(
        "email"
    ).value;

    const course =
    document.getElementById(
        "course"
    ).value;

    const age =
    document.getElementById(
        "age"
    ).value;

    const phone =
    document.getElementById(
        "phone"
    ).value;

    if(
        !name ||
        !email ||
        !course ||
        !age ||
        !phone
    ){

        showToast(
            "Fill all fields"
        );

        return;
    }

    const response =
    await fetch(
        API,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                name,
                email,
                course,
                age,
                phone

            })
        }
    );

    const data =
    await response.json();

    showToast(
        data.message
    );

    document.getElementById("name").value="";
    document.getElementById("email").value="";
    document.getElementById("course").value="";
    document.getElementById("age").value="";
    document.getElementById("phone").value="";

    loadStudents();

    showStudents();
}

/* ==========================
   DELETE
========================== */

async function deleteStudent(id){

    if(
        !confirm(
            "Delete Student?"
        )
    ) return;

    const response =
    await fetch(
        `${API}/${id}`,
        {
            method:"DELETE"
        }
    );

    const data =
    await response.json();

    showToast(
        data.message
    );

    loadStudents();
}

/* ==========================
   DETAILS MODAL
========================== */

async function viewStudent(id){

    const response =
    await fetch(
        `${API}/${id}`
    );

    const student =
    await response.json();

    document.getElementById(
        "modalBody"
    ).innerHTML = `

    <h2>
        ${student.name}
    </h2>

    <hr><br>

    <p>
    <b>ID:</b>
    ${student.student_id}
    </p>

    <p>
    <b>Email:</b>
    ${student.email}
    </p>

    <p>
    <b>Course:</b>
    ${student.course}
    </p>

    <p>
    <b>Age:</b>
    ${student.age}
    </p>

    <p>
    <b>Phone:</b>
    ${student.phone}
    </p>

    `;

    document.getElementById(
        "studentModal"
    ).style.display =
    "block";
}

function closeModal(){

    document.getElementById(
        "studentModal"
    ).style.display =
    "none";
}

/* ==========================
   SEARCH
========================== */

function searchStudents(){

    const value =
    document
    .getElementById("search")
    .value
    .toLowerCase();

    document
    .querySelectorAll(
        ".student-card"
    )
    .forEach(card=>{

        card.style.display =
        card.innerText
        .toLowerCase()
        .includes(value)
        ?
        "block"
        :
        "none";
    });
}

/* ==========================
   NAVIGATION
========================== */

function showDashboard(){

    dashboardSection.style.display =
    "block";

    formSection.style.display =
    "none";

    studentSection.style.display =
    "none";
}

function showForm(){

    dashboardSection.style.display =
    "none";

    formSection.style.display =
    "block";

    studentSection.style.display =
    "none";
}

function showStudents(){

    dashboardSection.style.display =
    "none";

    formSection.style.display =
    "none";

    studentSection.style.display =
    "block";
}

/* ==========================
   COURSE CHART
========================== */

async function loadChart(){

    const response =
    await fetch(
        "/course-chart"
    );

    const data =
    await response.json();

    const labels =
    data.map(
        item=>item.course
    );

    const values =
    data.map(
        item=>item.total
    );

    if(chart){
        chart.destroy();
    }

    chart =
    new Chart(
        document.getElementById(
            "courseChart"
        ),
        {
            type:"pie",

            data:{

                labels,

                datasets:[
                    {
                        data:values
                    }
                ]
            }
        }
    );
}

/* ==========================
   EXPORT PDF
========================== */

function exportPDF(){

    showToast(
        "Preparing PDF..."
    );

    setTimeout(()=>{

        window.location =
        "/export-pdf";

    },1000);
}

/* ==========================
   INITIAL LOAD
========================== */

loadStudents();

showDashboard();